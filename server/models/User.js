const createModel = require('./modelHelper');

const UserSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Admin', 'Editor', 'Reporter', 'Moderator', 'SEO Manager', 'Reader'],
    default: 'Reader' 
  },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  }
};

module.exports = createModel('User', UserSchema);
