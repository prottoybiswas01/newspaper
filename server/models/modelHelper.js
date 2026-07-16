const mongoose = require('mongoose');
const db = require('../config/db');

function createModel(modelName, schemaDefinition) {
  // We check isFallback dynamically on runtime
  const collectionName = modelName.toLowerCase() + 's';
  
  // Custom wrapper to determine which model to use at runtime
  const handler = {
    get(target, prop) {
      const activeModel = db.isFallback()
        ? target.fallbackModel
        : target.mongooseModel();

      const val = activeModel[prop];
      if (typeof val === 'function') {
        return val.bind(activeModel);
      }
      return val;
    }
  };

  const target = {
    _fallbackModel: null,
    get fallbackModel() {
      if (!this._fallbackModel) {
        this._fallbackModel = new db.JSONModel(collectionName);
      }
      return this._fallbackModel;
    },
    mongooseModel: () => {
      if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
      }
      const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
      return mongoose.model(modelName, schema);
    }
  };

  return new Proxy(target, handler);
}

module.exports = createModel;
