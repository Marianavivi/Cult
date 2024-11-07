'use strict';
import got from 'got';

// Stringify function with better formatting
const stringify = obj => JSON.stringify(obj, null, 2);

// Parse function to handle Buffer data
const parse = str =>
  JSON.parse(str, (_, v) => {
    if (
      v !== null &&
      typeof v === 'object' &&
      'type' in v &&
      v.type === 'Buffer' &&
      'data' in v &&
      Array.isArray(v.data)
    ) {
      return Buffer.from(v.data);
    }
    return v;
  });

class CloudDBAdapter {
  constructor(url, { serialize = stringify, deserialize = parse, fetchOptions = {} } = {}) {
    this.url = url;
    this.serialize = serialize;
    this.deserialize = deserialize;
    this.fetchOptions = fetchOptions;
  }

  // Enhanced read method with detailed error handling and logging
  async read() {
    try {
      const res = await got(this.url, {
        method: 'GET',
        headers: {
          Accept: 'application/json;q=0.9,text/plain',
        },
        ...this.fetchOptions,
      });

      if (res.statusCode !== 200) {
        console.error(`[ERROR] Read failed with status: ${res.statusCode}`);
        throw new Error(res.statusMessage);
      }

      console.log('[SUCCESS] Read operation successful.');
      return this.deserialize(res.body);

    } catch (error) {
      console.error(`[ERROR] Failed to read from ${this.url}: ${error.message}`);
      return null;
    }
  }

  // Enhanced write method with detailed error handling and logging
  async write(obj) {
    try {
      const res = await got(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        ...this.fetchOptions,
        body: this.serialize(obj),
      });

      if (res.statusCode !== 200) {
        console.error(`[ERROR] Write failed with status: ${res.statusCode}`);
        throw new Error(res.statusMessage);
      }

      console.log('[SUCCESS] Write operation successful.');
      return res.body;

    } catch (error) {
      console.error(`[ERROR] Failed to write to ${this.url}: ${error.message}`);
      throw new Error(`Write operation failed: ${error.message}`);
    }
  }
}

export default CloudDBAdapter;
