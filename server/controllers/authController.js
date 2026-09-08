const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');
const AuditLog = require('../models/AuditLog');

const signToken = (user) => {
  const userId = user._id ? user._id.toString() : (user.id || user);
  const payload = typeof user === 'object' 
    ? { id: userId, name: user.name, email: user.email, role: user.role }
    : { id: userId };

  return jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_token_for_professional_news_portal', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const totalUsers = await User.countDocuments({});
    const role = totalUsers === 0 ? 'Super Admin' : 'Reader';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      savedArticles: [],
      preferredLocation: { division: 'ঢাকা', district: 'ঢাকা', upazila: '' },
      notificationPreferences: { breakingNews: true, importantNews: true, sports: false, technology: false, localNews: true }
    });

    res.status(201).json({
      success: true,
      token: signToken(user),
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        savedArticles: user.savedArticles || [],
        preferredLocation: user.preferredLocation,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await AuditLog.create({
      userId: user._id ? user._id.toString() : '',
      userName: user.name,
      userRole: user.role,
      action: 'auth.login',
      targetType: 'User',
      targetId: user._id ? user._id.toString() : '',
      details: 'User logged in'
    }).catch(() => null);

    res.json({
      success: true,
      token: signToken(user),
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        designation: user.designation,
        savedArticles: user.savedArticles || [],
        preferredLocation: user.preferredLocation,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userProfile = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      designation: user.designation,
      socialLinks: user.socialLinks || { facebook: '', twitter: '', linkedin: '' },
      savedArticles: user.savedArticles || [],
      preferredLocation: user.preferredLocation || { division: 'ঢাকা', district: 'ঢাকা', upazila: '' },
      notificationPreferences: user.notificationPreferences || { breakingNews: true, importantNews: true }
    };

    res.json({ success: true, user: userProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar, designation, socialLinks, preferredLocation, notificationPreferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (designation !== undefined) updateData.designation = designation;
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (preferredLocation) updateData.preferredLocation = preferredLocation;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        designation: user.designation,
        socialLinks: user.socialLinks,
        savedArticles: user.savedArticles || [],
        preferredLocation: user.preferredLocation,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Save/Bookmark Article
// @route   POST /api/auth/save-article
const toggleSaveArticle = async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!articleId) {
      return res.status(400).json({ success: false, message: 'Article ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let saved = user.savedArticles || [];
    let isSaved = false;

    if (saved.includes(articleId)) {
      saved = saved.filter(id => id !== articleId);
      isSaved = false;
    } else {
      saved.push(articleId);
      isSaved = true;
    }

    await User.findByIdAndUpdate(req.user.id, { $set: { savedArticles: saved } });

    res.json({
      success: true,
      isSaved,
      savedArticles: saved
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's saved articles with full article objects
// @route   GET /api/auth/saved-articles
const getSavedArticles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const savedIds = user.savedArticles || [];
    const articles = await Article.find({
      _id: { $in: savedIds }
    }).sort({ publishDate: -1 });

    res.json({
      success: true,
      articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reporters (public profile info)
// @route   GET /api/auth/reporters
const getReporters = async (req, res) => {
  try {
    const reporters = await User.find({
      role: { $in: ['Reporter', 'Editor', 'Admin', 'Super Admin'] }
    });

    const enrichedReporters = await Promise.all(
      reporters.map(async (rep) => {
        const count = await Article.countDocuments({ authorId: rep._id.toString(), status: 'published' });
        return {
          _id: rep._id,
          name: rep.name,
          avatar: rep.avatar,
          bio: rep.bio,
          designation: rep.designation || rep.role,
          role: rep.role,
          socialLinks: rep.socialLinks,
          articleCount: count
        };
      })
    );

    res.json({ success: true, reporters: enrichedReporters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific reporter profile details
// @route   GET /api/auth/reporters/:id
const getReporterById = async (req, res) => {
  try {
    const rep = await User.findById(req.params.id);
    if (!rep || !['Reporter', 'Editor', 'Admin', 'Super Admin'].includes(rep.role)) {
      return res.status(404).json({ success: false, message: 'Reporter not found' });
    }

    const articles = await Article.find({ authorId: rep._id.toString(), status: 'published' }).sort({ publishDate: -1 });

    res.json({
      success: true,
      reporter: {
        _id: rep._id,
        name: rep.name,
        avatar: rep.avatar,
        bio: rep.bio,
        designation: rep.designation || rep.role,
        role: rep.role,
        socialLinks: rep.socialLinks,
        articleCount: articles.length
      },
      articles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin/Super Admin only)
// @route   GET /api/auth/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    
    const sanitized = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation,
      createdAt: u.createdAt
    }));

    res.json({ success: true, users: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (Super Admin / Admin only)
// @route   PUT /api/auth/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = [
      'Super Admin', 
      'Admin', 
      'Editor', 
      'Reporter', 
      'Moderator', 
      'Ad Manager', 
      'Analyst', 
      'SEO Manager', 
      'Reader'
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'user.role_change',
      targetType: 'User',
      targetId: req.params.id,
      targetTitle: updatedUser.name,
      details: `Changed role to ${role}`
    }).catch(() => null);

    res.json({ success: true, message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Article.deleteMany({ authorId: userId });
    await User.findByIdAndDelete(userId);

    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'user.delete',
      targetType: 'User',
      targetId: userId,
      targetTitle: userToDelete.name,
      details: `Deleted user and their articles`
    }).catch(() => null);

    res.json({ success: true, message: 'User and their articles deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  toggleSaveArticle,
  getSavedArticles,
  getReporters,
  getReporterById,
  getAllUsers,
  updateUserRole,
  deleteUser
};
