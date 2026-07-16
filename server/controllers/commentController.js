const Comment = require('../models/Comment');
const Article = require('../models/Article');

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
    const { articleId, authorName, authorEmail, content } = req.body;
    if (!articleId || !authorName || !authorEmail || !content) {
      return res.status(400).json({ success: false, message: 'All comment fields are required' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const comment = await Comment.create({
      articleId,
      articleTitle: article.title,
      authorName,
      authorEmail,
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`,
      content,
      status: 'pending' // Defaults to moderation queue
    });

    res.status(201).json({ 
      success: true, 
      message: 'Comment submitted successfully. It will appear after approval.', 
      comment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({}).sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const moderateComment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'spam', 'pending'].includes(status)) {
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

    res.json({ success: true, message: `Comment status updated to ${status}`, comment: updated });
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
  deleteComment
};
