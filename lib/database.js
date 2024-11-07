'use strict';
import { resolve, dirname as _dirname } from 'path';
import _fs, { existsSync, readFileSync } from 'fs';
const { promises: fs } = _fs;

class Database {
  /**
   * Create new Database
   * @param {String} filepath - Path to specified JSON database
   * @param  {...any} args - JSON.stringify arguments
   */
  constructor(filepath, ...args) {
    this.file = resolve(filepath);
    this.logger = console;

    this._jsonargs = args;
    this._state = false;
    this._queue = [];

    // Load data from the file
    this._load();

    // Set up interval to process the queue
    this._interval = setInterval(() => this._processQueue(), 1000);
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this.save();
  }

  /**
   * Queue load operation
   */
  load() {
    this._queue.push('_load');
  }

  /**
   * Queue save operation
   */
  save() {
    this._queue.push('_save');
  }

  /**
   * Process the queued operations
   */
  async _processQueue() {
    if (!this._state && this._queue.length) {
      this._state = true;
      try {
        await this[this._queue.shift()]();
      } catch (error) {
        this.logger.error('Error processing queue:', error);
      }
      this._state = false;
    }
  }

  /**
   * Load data from the file
   */
  _load() {
    try {
      this._data = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {};
    } catch (error) {
      this.logger.error('Error loading data:', error);
      this._data = {};
    }
  }

  /**
   * Save data to the file
   */
  async _save() {
    try {
      const dirname = _dirname(this.file);
      if (!existsSync(dirname)) {
        await fs.mkdir(dirname, { recursive: true });
      }
      await fs.writeFile(this.file, JSON.stringify(this._data, ...this._jsonargs));
      return this.file;
    } catch (error) {
      this.logger.error('Error saving data:', error);
      throw error;
    }
  }
}

export default Database;
