const AuditLog = require('../models/AuditLog');

// @desc    Get system audit logs
// @route   GET /api/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const { action, targetType, limit = 50 } = req.query;
    const query = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 50);

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      total,
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuditLogs
};
