const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isJSONFallback = false;
let connPromise = null;
const BUNDLED_DATA_DIR = path.join(__dirname, '..', 'data');
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || (process.env.NODE_ENV === 'production' && process.platform === 'linux'));
const WRITABLE_DATA_DIR = isServerless ? path.join('/tmp', 'newspaper_data') : BUNDLED_DATA_DIR;

// Global in-memory document store to guarantee operations succeed even on read-only file systems
const globalMemoryStore = {};

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
      console.warn('\n⚠️  No MONGODB_URI provided in environment. Falling back to local/memory database.');
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
      console.warn('⚠️  Falling back to local/memory database.');
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

// JSON Mock Model Class to replicate Mongoose behavior safely across all platforms
class JSONModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.writablePath = path.join(WRITABLE_DATA_DIR, `${collectionName}.json`);
    this.bundledPath = path.join(BUNDLED_DATA_DIR, `${collectionName}.json`);

    if (!globalMemoryStore[collectionName]) {
      globalMemoryStore[collectionName] = this._initData();
    }
  }

  _initData() {
    // 1. Try reading from writable /tmp path
    try {
      if (fs.existsSync(this.writablePath)) {
        const raw = fs.readFileSync(this.writablePath, 'utf8');
        return JSON.parse(raw || '[]');
      }
    } catch (e) {}

    // 2. Try reading from bundled static data
    try {
      if (fs.existsSync(this.bundledPath)) {
        const raw = fs.readFileSync(this.bundledPath, 'utf8');
        const parsed = JSON.parse(raw || '[]');
        // Try copying to writable dir
        this._safeWriteFile(parsed);
        return parsed;
      }
    } catch (e) {}

    // 3. Fallback to empty array
    this._safeWriteFile([]);
    return [];
  }

  _safeWriteFile(data) {
    try {
      if (!fs.existsSync(WRITABLE_DATA_DIR)) {
        fs.mkdirSync(WRITABLE_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.writablePath, JSON.stringify(data, null, 2));
    } catch (e) {
      // Ignore EROFS or filesystem write errors on serverless
    }
  }

  _read() {
    if (globalMemoryStore[this.collectionName]) {
      return [...globalMemoryStore[this.collectionName]];
    }
    globalMemoryStore[this.collectionName] = this._initData();
    return [...globalMemoryStore[this.collectionName]];
  }

  _write(data) {
    globalMemoryStore[this.collectionName] = [...data];
    this._safeWriteFile(data);
  }

  // Matches a simple query object against a document
  _match(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const key in query) {
      let val = query[key];
      if (val === undefined) continue;

      // Handle MongoDB syntax ($or)
      if (key === '$or' && Array.isArray(val)) {
        if (!val.some(q => this._match(doc, q))) return false;
        continue;
      }

      // Direct RegExp instance (e.g. { category: /bangladesh/i })
      if (val instanceof RegExp) {
        if (!val.test(String(doc[key] || ''))) return false;
        continue;
      }

      // Object operators
      if (val && typeof val === 'object') {
        // { $regex: ... }
        if ('$regex' in val) {
          let regex;
          if (val.$regex instanceof RegExp) {
            regex = val.$regex;
          } else {
            try {
              regex = new RegExp(val.$regex, val.$options || '');
            } catch (e) {
              regex = new RegExp(String(val.$regex));
            }
          }
          if (!regex.test(String(doc[key] || ''))) return false;
          continue;
        }

        // { $ne: val }
        if ('$ne' in val) {
          if (doc[key] === val.$ne) return false;
          continue;
        }

        // { $in: [...] }
        if ('$in' in val && Array.isArray(val.$in)) {
          if (Array.isArray(doc[key])) {
            if (!doc[key].some(item => val.$in.includes(item))) return false;
          } else {
            if (!val.$in.includes(doc[key])) return false;
          }
          continue;
        }

        // { $nin: [...] }
        if ('$nin' in val && Array.isArray(val.$nin)) {
          if (Array.isArray(doc[key])) {
            if (doc[key].some(item => val.$nin.includes(item))) return false;
          } else {
            if (val.$nin.includes(doc[key])) return false;
          }
          continue;
        }

        // Comparison operators: $gt, $gte, $lt, $lte
        if ('$lt' in val || '$lte' in val || '$gt' in val || '$gte' in val) {
          const docVal = doc[key];
          const docTime = new Date(docVal).getTime();
          const isDate = !isNaN(docTime) && typeof docVal === 'string' && docVal.includes('-');

          if ('$lt' in val) {
            const target = isDate ? new Date(val.$lt).getTime() : val.$lt;
            const current = isDate ? docTime : docVal;
            if (current >= target) return false;
          }
          if ('$lte' in val) {
            const target = isDate ? new Date(val.$lte).getTime() : val.$lte;
            const current = isDate ? docTime : docVal;
            if (current > target) return false;
          }
          if ('$gt' in val) {
            const target = isDate ? new Date(val.$gt).getTime() : val.$gt;
            const current = isDate ? docTime : docVal;
            if (current <= target) return false;
          }
          if ('$gte' in val) {
            const target = isDate ? new Date(val.$gte).getTime() : val.$gte;
            const current = isDate ? docTime : docVal;
            if (current < target) return false;
          }
          continue;
        }
      }

      // ID comparison handling
      if (key === '_id' || key === 'id') {
        const docId = String(doc._id || doc.id || '');
        const targetVal = val && typeof val === 'object' && val._id ? val._id : val;
        if (docId !== String(targetVal || '')) return false;
        continue;
      }

      // If document field is an array and query is a scalar (e.g. tags: 'জাতীয়')
      if (Array.isArray(doc[key])) {
        if (!doc[key].includes(val)) return false;
        continue;
      }

      // Direct scalar equality match
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

  find(query = {}) {
    const docs = this._read();
    const matched = docs.filter(doc => this._match(doc, query));
    return this._queryBuilder(matched);
  }

  findOne(query = {}) {
    const docs = this._read();
    const matched = docs.filter(doc => this._match(doc, query));
    const baseBuilder = this._queryBuilder(matched);
    const singleBuilder = {
      ...baseBuilder,
      sort(sortObj) {
        baseBuilder.sort(sortObj);
        return this;
      },
      select(fields) {
        baseBuilder.select(fields);
        return this;
      },
      populate(fields) {
        baseBuilder.populate(fields);
        return this;
      },
      then(resolve) {
        resolve(baseBuilder.docs.length > 0 ? baseBuilder.docs[0] : null);
      },
      catch(reject) {
        return this;
      }
    };
    return singleBuilder;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    const docs = this._read();
    const newDoc = {
      _id: data._id || generateId(),
      ...data,
      publishDate: data.publishDate || (data.status === 'published' ? new Date().toISOString() : undefined),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    docs.unshift(newDoc);
    this._write(docs);
    return newDoc;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const docs = this._read();
    const strId = String(id || '');
    const idx = docs.findIndex(doc => String(doc._id || doc.id || '') === strId);
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
    const strId = String(id || '');
    const idx = docs.findIndex(doc => String(doc._id || doc.id || '') === strId);
    if (idx === -1) return null;
    const deleted = docs[idx];
    docs.splice(idx, 1);
    this._write(docs);
    return deleted;
  }

  async deleteMany(query = {}) {
    const docs = this._read();
    const remaining = docs.filter(doc => !this._match(doc, query));
    const deletedCount = docs.length - remaining.length;
    this._write(remaining);
    return { deletedCount };
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
