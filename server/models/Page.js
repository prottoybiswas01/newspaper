const createModel = require('./modelHelper');

const PageSchema = {
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  subtitle: { 
    type: String, 
    default: '' 
  },
  content: { 
    type: String, 
    default: '' 
  },
  seoTitle: { 
    type: String, 
    default: '' 
  },
  seoDescription: { 
    type: String, 
    default: '' 
  },
  isPublished: { 
    type: Boolean, 
    default: true 
  },
  lastUpdatedBy: { 
    type: String, 
    default: 'Admin' 
  }
};

module.exports = createModel('Page', PageSchema);
