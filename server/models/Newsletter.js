const createModel = require('./modelHelper');

const NewsletterSchema = {
  email: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['active', 'unsubscribed'], 
    default: 'active' 
  }
};

module.exports = createModel('Newsletter', NewsletterSchema);
