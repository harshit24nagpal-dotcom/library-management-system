const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class MockQuery {
  constructor(data, modelName, mockDbInstance) {
    this.data = data;
    this.modelName = modelName;
    this.mockDb = mockDbInstance;
    this.populatePaths = [];
    this.sortCriteria = null;
  }

  populate(pathStr) {
    this.populatePaths.push(pathStr);
    return this;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }

  async exec() {
    let result = JSON.parse(JSON.stringify(this.data)); // Deep clone

    // Apply sorting
    if (this.sortCriteria) {
      let field = '';
      let ascending = true;
      if (typeof this.sortCriteria === 'string') {
        if (this.sortCriteria.startsWith('-')) {
          field = this.sortCriteria.slice(1);
          ascending = false;
        } else {
          field = this.sortCriteria;
        }
      } else if (typeof this.sortCriteria === 'object') {
        field = Object.keys(this.sortCriteria)[0];
        ascending = this.sortCriteria[field] !== -1;
      }

      if (field && Array.isArray(result)) {
        result.sort((a, b) => {
          const valA = a[field] !== undefined ? a[field] : '';
          const valB = b[field] !== undefined ? b[field] : '';
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }
    }

    // Apply population
    for (const popPath of this.populatePaths) {
      let targetModel = '';
      if (popPath === 'bookId') targetModel = 'Book';
      else if (popPath === 'memberId' || popPath === 'issuedBy') targetModel = 'User';

      if (targetModel) {
        const refData = this.mockDb.readCollection(targetModel);
        if (Array.isArray(result)) {
          result.forEach(item => {
            if (item[popPath]) {
              const id = typeof item[popPath] === 'object' ? item[popPath]._id || item[popPath] : item[popPath];
              const refObj = refData.find(r => r._id === id);
              if (refObj) {
                const clonedRef = { ...refObj };
                delete clonedRef.password;
                item[popPath] = clonedRef;
              }
            }
          });
        } else if (result && typeof result === 'object') {
          if (result[popPath]) {
            const id = typeof result[popPath] === 'object' ? result[popPath]._id || result[popPath] : result[popPath];
            const refObj = refData.find(r => r._id === id);
            if (refObj) {
              const clonedRef = { ...refObj };
              delete clonedRef.password;
              result[popPath] = clonedRef;
            }
          }
        }
      }
    }

    return result;
  }
}

class MockModel {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  readCollection() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (e) {
      return [];
    }
  }

  writeCollection(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  find(query = {}) {
    const items = this.readCollection();
    const filtered = items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          const val = query[key];
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            if (val.$regex !== undefined) {
              const options = val.$options || '';
              const regex = new RegExp(val.$regex, options);
              if (!regex.test(item[key] || '')) return false;
            } else if (val.$ne !== undefined) {
              if (item[key] === val.$ne) return false;
            } else if (val.$in !== undefined && Array.isArray(val.$in)) {
              if (!val.$in.includes(item[key])) return false;
            }
          } else {
            if (item[key] !== val) return false;
          }
        }
      }
      return true;
    });
    return new MockQuery(filtered, this.name, this);
  }

  findOne(query = {}) {
    const items = this.readCollection();
    const found = items.find(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          const val = query[key];
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            if (val.$regex !== undefined) {
              const options = val.$options || '';
              const regex = new RegExp(val.$regex, options);
              if (!regex.test(item[key] || '')) return false;
            } else if (val.$ne !== undefined) {
              if (item[key] === val.$ne) return false;
            } else if (val.$in !== undefined && Array.isArray(val.$in)) {
              if (!val.$in.includes(item[key])) return false;
            }
          } else {
            if (item[key] !== val) return false;
          }
        }
      }
      return true;
    });
    return new MockQuery(found || null, this.name, this);
  }

  findById(id) {
    const items = this.readCollection();
    const found = items.find(item => item._id === id);
    return new MockQuery(found || null, this.name, this);
  }

  async create(data) {
    const items = this.readCollection();
    const newDoc = {
      _id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString()
    };
    items.push(newDoc);
    this.writeCollection(items);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = this.readCollection();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    let updatedDoc = { ...items[index] };
    const updates = update.$set || update;
    for (const key in updates) {
      updatedDoc[key] = updates[key];
    }
    
    if (update.$inc) {
      for (const key in update.$inc) {
        updatedDoc[key] = (updatedDoc[key] || 0) + update.$inc[key];
      }
    }

    items[index] = updatedDoc;
    this.writeCollection(items);
    return updatedDoc;
  }

  async findByIdAndDelete(id) {
    const items = this.readCollection();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    this.writeCollection(items);
    return deleted;
  }

  async countDocuments(query = {}) {
    const items = this.readCollection();
    const filtered = items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          if (item[key] !== query[key]) return false;
        }
      }
      return true;
    });
    return filtered.length;
  }
}

module.exports = { MockModel };
