const createModel = require('./modelHelper');

const CommentSchema = {
  articleId: { type: String, required: true },
  articleTitle: { type: String, default: '' },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'spam'], 
    default: 'pending' 
  }
};

module.exports = createModel('Comment', CommentSchema);
