const createModel = require('./modelHelper');

const PollSchema = {
  question: { type: String, required: true },
  options: [{
    option: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  },
  votedUserIds: { type: [String], default: [] } // Stores user IDs or IP addresses to prevent duplicate voting
};

module.exports = createModel('Poll', PollSchema);
