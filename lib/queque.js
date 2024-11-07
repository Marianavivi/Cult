import EventEmitter from 'events';

// Utility function to check if a value is a number
const isNumber = x => typeof x === 'number' && !isNaN(x);

// Utility function to create a delay
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms));

// Delay constant for the queue
const QUEUE_DELAY = 5 * 1000;

export default class Queue extends EventEmitter {
  _queue = new Set();

  constructor() {
    super();
  }

  /**
   * Add an item to the queue.
   * @param {any} item - The item to add.
   */
  add(item) {
    this._queue.add(item);
    // console.debug('Added item to queue', item, 'Index:', this._queue.size);
  }

  /**
   * Check if an item exists in the queue.
   * @param {any} item - The item to check.
   * @returns {boolean} - True if the item exists, otherwise false.
   */
  has(item) {
    return this._queue.has(item);
  }

  /**
   * Delete an item from the queue.
   * @param {any} item - The item to delete.
   */
  delete(item) {
    this._queue.delete(item);
    // console.debug('Deleted item from queue', item, 'Now have', this._queue.size, 'in queue');
  }

  /**
   * Get the first item in the queue.
   * @returns {any} - The first item in the queue.
   */
  first() {
    return [...this._queue].shift();
  }

  /**
   * Check if the item is the first in the queue.
   * @param {any} item - The item to check.
   * @returns {boolean} - True if the item is the first, otherwise false.
   */
  isFirst(item) {
    return this.first() === item;
  }

  /**
   * Get the last item in the queue.
   * @returns {any} - The last item in the queue.
   */
  last() {
    return [...this._queue].pop();
  }

  /**
   * Check if the item is the last in the queue.
   * @param {any} item - The item to check.
   * @returns {boolean} - True if the item is the last, otherwise false.
   */
  isLast(item) {
    return this.last() === item;
  }

  /**
   * Get the index of an item in the queue.
   * @param {any} item - The item to get the index of.
   * @returns {number} - The index of the item.
   */
  getIndex(item) {
    return [...this._queue].indexOf(item);
  }

  /**
   * Get the size of the queue.
   * @returns {number} - The size of the queue.
   */
  getSize() {
    return this._queue.size;
  }

  /**
   * Check if the queue is empty.
   * @returns {boolean} - True if the queue is empty, otherwise false.
   */
  isEmpty() {
    return this.getSize() === 0;
  }

  /**
   * Remove and process the first item in the queue.
   * @param {any} item - The item to unqueue.
   */
  unqueue(item) {
    let queueItem;
    if (item) {
      if (this.has(item)) {
        queueItem = item;
        if (!this.isFirst(item)) {
          throw new Error('Item is not first in queue');
        }
      } else {
        // console.error('Try to unqueue item', item, 'but not found');
      }
    } else {
      queueItem = this.first();
    }

    if (queueItem) {
      this.delete(queueItem);
      this.emit(queueItem);
    }
  }

  /**
   * Wait for an item to be processed in the queue.
   * @param {any} item - The item to wait for.
   * @returns {Promise<void>}
   */
  waitQueue(item) {
    return new Promise((resolve, reject) => {
      // console.debug('Wait queue', item);
      if (this.has(item)) {
        const solve = async (removeQueue = false) => {
          await delay(QUEUE_DELAY);
          // console.debug('Wait queue', item, 'done!');
          if (removeQueue) this.unqueue(item);
          if (!this.isEmpty()) this.unqueue();
          resolve();
        };

        if (this.isFirst(item)) {
          // console.debug('Wait queue', item, 'is first in queue');
          solve(true);
        } else {
          this.once(item, solve);
        }
      } else {
        reject(new Error('Item not found'));
      }
    });
  }
}
