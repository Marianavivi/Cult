// Inspired by https://github.com/nodejs/modules/issues/307#issuecomment-858729422

import Helper from './helper.js';

// Constants for worker directory and file path
const WORKER_DIR = Helper.__dirname(import.meta.url, false);

/**
 * Dynamically imports a module
 * @template T
 * @param {string} modulePath - The path to the module to import
 * @returns {Promise<T>} - The imported module
 */
export default async function importLoader(modulePath) {
  try {
    modulePath = Helper.__filename(modulePath);
    const module_ = await import(`${modulePath}?id=${Date.now()}`);
    const result = module_ && 'default' in module_ ? module_.default : module_;
    return result;
  } catch (error) {
    console.error('Error importing module:', error);
    throw error;
  }
}
