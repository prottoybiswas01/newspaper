const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isJSONFallback = false;
let connPromise = null;
const DATA_DIR = path.join(__dirname, '..', 'data');

// Disable command buffering globally so queries fail fast or fall back instead of timing out after 10s
try {
  mongoose.set('bufferCommands', false);
} catch (e) {
  // Ignore if bufferCommands setting not supported in version
}

const connectDB = async () => {
  if (connPromise) return connPromise;

  connPromise = (async () => {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.warn('\n⚠️  No MONGODB_URI provided in environment. Falling back to local JSON database.');
      isJSONFallback = true;
      return;
    }

    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('\n✅ Connected to MongoDB successfully.');
      isJSONFallback = false;
    } catch (error) {
      console.error('\n❌ MongoDB connection failed:', error.message);
      console.warn('⚠️  Falling back to local JSON database.');
      isJSONFallback = true;
    }
  })();

  return connPromise;
};

const getFallbackStatus = () => {
  if (mongoose.connection.readyState === 1) {
    return false;
  }
  return true;
};

// Helper to generate a unique random MongoDB-like string ID
const generateId = () => {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// JSON Mock Model Class to replicate Mongoose behavior
class JSONModel {
  constructor(collectionName) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // Matches a simple query object against a document
  _match(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const key in query) {
      let val = query[key];
      // Handle MongoDB syntax ($or, $regex, etc.)
      if (key === '$or' && Array.isArray(val)) {
        if (!val.some(q => this._match(doc, q))) return false;
        continue;
      }
      if (val && typeof val === 'object' && '$regex' in val) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(doc[key] || '')) return false;
        continue;
      }
      if (val && typeof val === 'object' && '$ne' in val) {
        if (doc[key] === val.$ne) return false;
        continue;
      }
      if (val && typeof val === 'object' && '$in' in val) {
        if (!val.$in.includes(doc[key])) return false;
        continue;
      }
      // Direct match
      if (doc[key] !== val) return false;
    }
    return true;
  }

  // Mongoose Query Builder Mock
  _queryBuilder(docs) {
    let result = [...docs];
    const builder = {
      docs: result,
      then(resolve) {
        resolve(this.docs);
      },
      sort(sortObj) {
        if (!sortObj) return this;
        const keys = Object.keys(sortObj);
        this.docs.sort((a, b) => {
          for (const key of keys) {
            const order = sortObj[key];
            if (a[key] < b[key]) return order === -1 ? 1 : -1;
            if (a[key] > b[key]) return order === -1 ? -1 : 1;
          }
          return 0;
        });
        return this;
      },
      limit(n) {
        if (typeof n === 'number') {
          this.docs = this.docs.slice(0, n);
        }
        return this;
      },
      skip(n) {
        if (typeof n === 'number') {
          this.docs = this.docs.slice(n);
        }
        return this;
      },
      populate() {
        // Mock populate (returns same docs)
        return this;
      },
      select() {
        // Mock select (returns same docs)
        return this;
      }
    };
    // Make builder a Promise-like object
    builder.catch = () => builder;
    return builder;
  }

  async find(query = {}) {
    const docs = this._read();
    const matched = docs.filter(doc => this._match(doc, query));
    return this._queryBuilder(matched);
  }

  async findOne(query = {}) {
    const docs = this._read();
    const matched = docs.find(doc => this._match(doc, query));
    return matched || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    const docs = this._read();
    const newDoc = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    docs.push(newDoc);
    this._write(docs);
    return newDoc;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const docs = this._read();
    const idx = docs.findIndex(doc => doc._id === id);
    if (idx === -1) return null;

    // Handle Mongoose syntax for $set and $inc
    let flatUpdate = { ...updateData };
    if (updateData.$set) {
      flatUpdate = { ...flatUpdate, ...updateData.$set };
      delete flatUpdate.$set;
    }
    if (updateData.$inc) {
      for (const key in updateData.$inc) {
        flatUpdate[key] = (docs[idx][key] || 0) + updateData.$inc[key];
      }
      delete flatUpdate.$inc;
    }

    docs[idx] = {
      ...docs[idx],
      ...flatUpdate,
      updatedAt: new Date().toISOString()
    };
    this._write(docs);
    return docs[idx];
  }

  async findByIdAndDelete(id) {
    const docs = this._read();
    const idx = docs.findIndex(doc => doc._id === id);
    if (idx === -1) return null;
    const deleted = docs[idx];
    docs.splice(idx, 1);
    this._write(docs);
    return deleted;
  }

  async countDocuments(query = {}) {
    const docs = this._read();
    return docs.filter(doc => this._match(doc, query)).length;
  }
}

module.exports = {
  connectDB,
  isFallback: getFallbackStatus,
  JSONModel
};
