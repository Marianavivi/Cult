// Array to store stdout chunks
let stdouts = [];

/**
 * Module to intercept and log stdout writes.
 * @param {number} [maxLength=200] - The maximum length of the stdout logs.
 * @returns {Object} The modified module.
 */
export default function interceptStdout(maxLength = 200) {
  const oldWrite = process.stdout.write.bind(process.stdout);

  /**
   * Disable the interception of stdout writes.
   * @returns {Function} Restored write function.
   */
  module.exports.disable = () => {
    module.exports.isModified = false;
    process.stdout.write = oldWrite;
    return process.stdout.write;
  };

  process.stdout.write = (chunk, encoding, callback) => {
    stdouts.push(Buffer.from(chunk, encoding));
    oldWrite(chunk, encoding, callback);

    // Remove oldest stdout if maxLength is exceeded
    if (stdouts.length > maxLength) stdouts.shift();
  };

  module.exports.isModified = true;
  return module.exports;
}

/**
 * Indicates whether stdout interception is active.
 * @type {boolean}
 */
export const isModified = false;

/**
 * Retrieve the captured stdout logs.
 * @returns {Buffer} The concatenated stdout logs.
 */
export function getLogs() {
  return Buffer.concat(stdouts);
}
