import * as mongoose from 'mongoose';

const { Schema, connect, model: _model } = mongoose;
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true };

export class MongoDB {
  /**
   * @param {string} url - The MongoDB connection URL.
   * @param {mongoose.ConnectOptions} [options=defaultOptions] - Mongoose connection options.
   */
  constructor(url, options = defaultOptions) {
    this.url = url;
    this.options = options;
    this.data = this._data = {};
    this._schema = {};
    this._model = {};
    this.db = connect(this.url, { ...this.options }).catch(console.error);
  }

  /**
   * Read data from the MongoDB collection.
   * @returns {Promise<Object>} - The data read from the collection.
   */
  async read() {
    this.conn = await this.db;
    this._schema = new Schema({
      data: {
        type: Object,
        required: true,
        default: {}
      }
    });
    try {
      this._model = _model('data', this._schema);
    } catch {
      this._model = _model('data');
    }
    this._data = await this._model.findOne({});
    if (!this._data) {
      this.data = {};
      const [, _data] = await Promise.all([
        this.write(this.data),
        this._model.findOne({})
      ]);
      this._data = _data;
    } else {
      this.data = this._data.data;
    }
    return this.data;
  }

  /**
   * Write data to the MongoDB collection.
   * @param {Object} data - The data to write.
   * @returns {Promise<Object>} - The saved document.
   */
  write(data) {
    return new Promise(async (resolve, reject) => {
      if (!data) return reject(new Error('No data provided'));
      if (!this._data) {
        const newData = new this._model({ data });
        return resolve(newData.save());
      }
      this._model.findById(this._data._id, (err, doc) => {
        if (err) return reject(err);
        doc.data = data;
        this.data = data;
        return doc.save(resolve);
      });
    });
  }
}

export const MongoDBV2 = class MongoDBV2 {
  /**
   * @param {string} url - The MongoDB connection URL.
   * @param {mongoose.ConnectOptions} [options=defaultOptions] - Mongoose connection options.
   */
  constructor(url, options = defaultOptions) {
    this.url = url;
    this.options = options;
    this.models = [];
    this.data = {};
    this.db = connect(this.url, { ...this.options }).catch(console.error);
  }

  /**
   * Read data from the MongoDB collections.
   * @returns {Promise<Object>} - The data read from the collections.
   */
  async read() {
    this.conn = await this.db;
    const schema = new Schema({
      data: [{ name: String }]
    });
    try {
      this.list = _model('lists', schema);
    } catch {
      this.list = _model('lists');
    }
    this.lists = await this.list.findOne({});
    if (!this.lists?.data) {
      await this.list.create({ data: [] });
      this.lists = await this.list.findOne({});
    }

    const garbage = [];
    for (const { name } of this.lists.data) {
      let collection;
      try {
        collection = _model(name, new Schema({ data: Array }));
      } catch (e) {
        console.error(e);
        try {
          collection = _model(name);
        } catch (e) {
          garbage.push(name);
          console.error(e);
        }
      }
      if (collection) {
        this.models.push({ name, model: collection });
        const collectionsData = await collection.find({});
        this.data[name] = Object.fromEntries(collectionsData.map(v => v.data));
      }
    }

    try {
      const listDoc = await this.list.findById(this.lists._id);
      listDoc.data = listDoc.data.filter(v => !garbage.includes(v.name));
      await listDoc.save();
    } catch (e) {
      console.error(e);
    }

    return this.data;
  }

  /**
   * Write data to the MongoDB collections.
   * @param {Object} data - The data to write.
   * @returns {Promise<boolean>} - Whether the write operation was successful.
   */
  async write(data) {
    if (!this.lists || !data) {
      return Promise.reject(new Error('No lists or data provided'));
    }

    const collections = Object.keys(data);
    const listDoc = [];
    for (const key of collections) {
      const index = this.models.findIndex(v => v.name === key);
      let doc;
      if (index !== -1) {
        doc = this.models[index].model;
        await doc.deleteMany().catch(console.error);
        await doc.insertMany(Object.entries(data[key]).map(v => ({ data: v })));
      } else {
        const schema = new Schema({ data: Array });
        try {
          doc = _model(key, schema);
        } catch (e) {
          console.error(e);
          doc = _model(key);
        }
        this.models.push({ name: key, model: doc });
        await doc.insertMany(Object.entries(data[key]).map(v => ({ data: v })));
      }
      listDoc.push({ name: key });
    }

    return new Promise((resolve, reject) => {
      this.list.findById(this.lists._id, function (err, doc) {
        if (err) return reject(err);
        doc.data = listDoc;
        this.data = {};
        doc.save(() => resolve(true));
      });
    });
  }
};
