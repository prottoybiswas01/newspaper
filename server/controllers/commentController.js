const Comment = require('../models/Comment');
const Article = require('../models/Article');
const AuditLog = require('../models/AuditLog');

const getCommentsByArticle = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      articleId: req.params.articleId, 
      status: 'approved' 
    }).sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { articleId, authorName, authorEmail, content, parentCommentId } = req.body;
    if (!articleId || !authorName || !authorEmail || !content) {
      return res.status(400).json({ success: false, message: 'All comment fields are required' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Basic spam keyword filter
    const spamKeywords = ['casino', 'viagra', 'cryptopump', 'freemoney', 'telegram.me'];
    const isSpam = spamKeywords.some(kw => content.toLowerCase().includes(kw));

    const comment = await Comment.create({
      articleId,
      articleTitle: article.title,
      authorName,
      authorEmail,
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`,
      content,
      parentCommentId: parentCommentId || '',
      status: isSpam ? 'spam' : 'pending'
    });

    res.status(201).json({ 
      success: true, 
      message: isSpam ? 'মন্তব্যটি স্প্যাম হিসেবে চিহ্নিত হয়েছে।' : 'আপনার মন্তব্যটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।', 
      comment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    const comments = await Comment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const moderateComment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'spam', 'pending', 'reported'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await Comment.findByIdAndUpdate(
      req.params.id, 
      { $set: { status } }, 
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'comment.moderate',
        targetType: 'Comment',
        targetId: req.params.id,
        targetTitle: updated.authorName,
        details: `Updated comment status to: ${status}`
      }).catch(() => null);
    }

    res.json({ success: true, message: `Comment status updated to ${status}`, comment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reportComment = async (req, res) => {
  try {
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { reportsCount: 1 },
        $set: { status: 'reported' }
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.json({ success: true, message: 'Comment reported for moderation' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likeComment = async (req, res) => {
  try {
    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.json({ success: true, likes: updated.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    await Comment.findByIdAndDelete(req.params.id);

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'comment.delete',
        targetType: 'Comment',
        targetId: req.params.id,
        details: 'Deleted comment'
      }).catch(() => null);
    }

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCommentsByArticle,
  createComment,
  getAllComments,
  moderateComment,
  reportComment,
  likeComment,
  deleteComment
};
