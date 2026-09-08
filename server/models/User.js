const createModel = require('./modelHelper');

const UserSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: [
      'Super Admin', 
      'Admin', 
      'Editor', 
      'Reporter', 
      'Moderator', 
      'Ad Manager', 
      'Analyst', 
      'SEO Manager', 
      'Reader'
    ],
    default: 'Reader' 
  },
  designation: { type: String, default: 'প্রতিবেদক' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  // Reader Personalization & Trust Features
  savedArticles: { type: [String], default: [] }, // Array of article IDs or slugs
  preferredLocation: {
    division: { type: String, default: 'ঢাকা' },
    district: { type: String, default: 'ঢাকা' },
    upazila: { type: String, default: '' }
  },
  notificationPreferences: {
    breakingNews: { type: Boolean, default: true },
    importantNews: { type: Boolean, default: true },
    sports: { type: Boolean, default: false },
    technology: { type: Boolean, default: false },
    localNews: { type: Boolean, default: true }
  }
};

module.exports = createModel('User', UserSchema);

