// @ts-check
import yargs from 'yargs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import fs from 'fs';
import Stream, { Readable } from 'stream';

/**
 * @param {ImportMeta | string} pathURL
 * @param {boolean?} rmPrefix - If true, removes 'file://' prefix, if windows it will automatically be false.
 * @returns {string}
 */
const __filename = function filename(pathURL = import.meta, rmPrefix = os.platform() !== 'win32') {
  const p = /** @type {ImportMeta} */ (pathURL).url || /** @type {string} */ (pathURL);
  return rmPrefix
    ? /file:\/\/\//.test(p)
      ? fileURLToPath(p)
      : p
    : /file:\/\/\//.test(p)
      ? p
      : pathToFileURL(p).href;
};

/**
 * @param {ImportMeta | string} pathURL
 * @returns {string}
 */
const __dirname = function dirname(pathURL) {
  const dir = __filename(pathURL, true);
  const regex = /\/$/;
  return regex.test(dir)
    ? dir
    : fs.existsSync(dir) && fs.statSync(dir).isDirectory()
      ? dir.replace(regex, '')
      : path.dirname(dir);
};

/**
 * @param {ImportMeta | string} dir
 * @returns {NodeRequire}
 */
const __require = function require(dir = import.meta) {
  const p = /** @type {ImportMeta} */ (dir).url || /** @type {string} */ (dir);
  return createRequire(p);
};

/**
 * @param {string} file
 * @returns {Promise<boolean>}
 */
const checkFileExists = (file) =>
  fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

/**
 * @param {string} name
 * @param {string} path
 * @param {{ [Key: string]: any }} query
 * @param {string} apikeyqueryname
 * @returns {string}
 */
const API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] }
            : {}),
        })
      )
    : '');

/** @type {ReturnType<yargs.Argv['parse']>} */
const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

const prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(
      /[|\\{}()[\]^$+*?.\-\^]/g,
      '\\$&'
    ) +
    ']'
);

/**
 * @param {Readable} stream
 * @param {string} file
 * @returns {Promise<void>}
 */
const saveStreamToFile = (stream, file) =>
  new Promise((resolve, reject) => {
    const writable = stream.pipe(fs.createWriteStream(file));
    writable.once('finish', () => {
      resolve();
      writable.destroy();
    });
    writable.once('error', (err) => {
      reject(err);
      writable.destroy();
    });
  });

const kDestroyed = Symbol('kDestroyed');
const kIsReadable = Symbol('kIsReadable');

/**
 * Checks if the given object is a readable node stream.
 * @param {any} obj
 * @param {boolean} [strict=false]
 * @returns {boolean}
 */
const isReadableNodeStream = (obj, strict = false) => {
  return !!(
    obj &&
    typeof obj.pipe === 'function' &&
    typeof obj.on === 'function' &&
    (!strict || (typeof obj.pause === 'function' && typeof obj.resume === 'function')) &&
    (!obj._writableState || obj._readableState?.readable !== false) && // Duplex
    (!obj._writableState || obj._readableState) // Writable has .pipe.
  );
};

/**
 * Checks if the given object is a node stream.
 * @param {any} obj
 * @returns {boolean}
 */
const isNodeStream = (obj) => {
  return (
    obj &&
    (obj._readableState ||
      obj._writableState ||
      (typeof obj.write === 'function' && typeof obj.on === 'function') ||
      (typeof obj.pipe === 'function' && typeof obj.on === 'function'))
  );
};

/**
 * Checks if the given stream is destroyed.
 * @param {any} stream
 * @returns {boolean|null}
 */
const isDestroyed = (stream) => {
  if (!isNodeStream(stream)) return null;
  const wState = stream._writableState;
  const rState = stream._readableState;
  const state = wState || rState;
  return !!(stream.destroyed || stream[kDestroyed] || state?.destroyed);
};

/**
 * Checks if the given stream has finished reading.
 * @param {Readable} stream
 * @param {boolean} [strict=true]
 * @returns {boolean|null}
 */
const isReadableFinished = (stream, strict = true) => {
  if (!isReadableNodeStream(stream)) return null;
  const rState = stream._readableState;
  if (rState?.errored) return false;
  if (typeof rState?.endEmitted !== 'boolean') return null;
  return !!(rState.endEmitted || (strict === false && rState.ended === true && rState.length === 0));
};

/**
 * Checks if the given stream is readable.
 * @param {any} stream
 * @returns {boolean|null}
 */
const isReadableStream = (stream) => {
  if (typeof Stream.isReadable === 'function') return Stream.isReadable(stream);
  if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
  if (typeof stream?.readable !== 'boolean') return null;
  if (isDestroyed(stream)) return false;
  return (
    (isReadableNodeStream(stream) && !!stream.readable && !isReadableFinished(stream)) ||
    stream instanceof fs.ReadStream ||
    stream instanceof Readable
  );
};

export default {
  __filename,
  __dirname,
  __require,
  checkFileExists,
  API,
  saveStreamToFile,
  isReadableStream,
  opts,
  prefix,
};
