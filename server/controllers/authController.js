const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
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

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If first user, make them Super Admin; otherwise Reader
    const totalUsers = await User.countDocuments({});
    const role = totalUsers === 0 ? 'Super Admin' : 'Reader';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      success: true,
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
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

    res.json({
      success: true,
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
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
    
    // Omit password
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      socialLinks: user.socialLinks || { facebook: '', twitter: '', linkedin: '' }
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
    const { name, bio, avatar, socialLinks } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (socialLinks) updateData.socialLinks = socialLinks;

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
        socialLinks: user.socialLinks
      }
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
    
    // Strip passwords
    const sanitized = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
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
    const allowedRoles = ['Super Admin', 'Admin', 'Editor', 'Reporter', 'Moderator', 'SEO Manager', 'Reader'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // A Super Admin's role can only be changed by another Super Admin or we can prevent self change
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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

    // Cascade delete user's articles
    await Article.deleteMany({ authorId: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

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
  getReporters,
  getReporterById,
  getAllUsers,
  updateUserRole,
  deleteUser
};
