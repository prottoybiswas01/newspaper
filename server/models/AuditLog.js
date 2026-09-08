const createModel = require('./modelHelper');

const AuditLogSchema = {
  userId: { type: String, default: '' },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'System' },
  action: { type: String, required: true }, // e.g. 'article.create', 'article.publish', 'ad.activate', 'comment.moderate', 'user.role_change'
  targetType: { type: String, default: '' }, // 'Article', 'Ad', 'Comment', 'User', 'Settings'
  targetId: { type: String, default: '' },
  targetTitle: { type: String, default: '' },
  details: { type: String, default: '' },
  ip: { type: String, default: '127.0.0.1' }
};

module.exports = createModel('AuditLog', AuditLogSchema);
