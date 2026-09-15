const createModel = require('./modelHelper');

const settingSchema = {
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  value: { 
    type: Object, 
    required: true 
  }
};

module.exports = createModel('Setting', settingSchema);
