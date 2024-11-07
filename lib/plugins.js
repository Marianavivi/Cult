import { readdirSync, existsSync, readFileSync, watch } from 'fs';
import { join, resolve } from 'path';
import { format } from 'util';
import syntaxerror from 'syntax-error';
import importFile from './import.js';
import Helper from './helper.js';

const __dirname = Helper.__dirname(import.meta);
const pluginFolderPath = Helper.__dirname(join(__dirname, '../plugins/index'));
const pluginFilter = filename => /\.(mc)?js$/.test(filename);

// Inspired by https://github.com/Nurutomo/mahbod/blob/main/src/util/PluginManager.ts

let watcher = {};
let plugins = {};
let pluginFolders = [];

/**
 * Initialize and watch plugin files.
 * @param {string} pluginFolder - The path to the plugin folder.
 * @param {Function} pluginFilter - The filter function to identify plugin files.
 * @param {Object} conn - The connection object.
 * @returns {Promise<Object>} The plugins object.
 */
async function filesInit(pluginFolder = pluginFolderPath, pluginFilter = pluginFilter, conn) {
  const folder = resolve(pluginFolder);
  if (folder in watcher) return;
  pluginFolders.push(folder);

  await Promise.all(
    readdirSync(folder)
      .filter(pluginFilter)
      .map(async filename => {
        try {
          const file = global.__filename(join(folder, filename));
          const module = await import(file);
          if (module) plugins[filename] = 'default' in module ? module.default : module;
        } catch (e) {
          conn?.logger.error(e);
          delete plugins[filename];
        }
      })
  );

  const watching = watch(folder, reload.bind(null, conn, folder, pluginFilter));
  watching.on('close', () => deletePluginFolder(folder, true));
  watcher[folder] = watching;

  return plugins;
}

/**
 * Delete a plugin folder from the watcher.
 * @param {string} folder - The path to the plugin folder.
 * @param {boolean} isAlreadyClosed - Whether the folder is already closed.
 */
function deletePluginFolder(folder, isAlreadyClosed = false) {
  const resolved = resolve(folder);
  if (!(resolved in watcher)) return;
  if (!isAlreadyClosed) watcher[resolved].close();
  delete watcher[resolved];
  pluginFolders = pluginFolders.filter(f => f !== resolved);
}

/**
 * Reload a plugin file.
 * @param {Object} conn - The connection object.
 * @param {string} pluginFolder - The path to the plugin folder.
 * @param {Function} pluginFilter - The filter function to identify plugin files.
 * @param {string} filename - The name of the plugin file to reload.
 */
async function reload(conn, pluginFolder = pluginFolderPath, pluginFilter = pluginFilter, _ev, filename) {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in plugins) {
      if (existsSync(dir)) {
        conn.logger.info(`Updated plugin - '${filename}'`);
      } else {
        conn?.logger.warn(`Deleted plugin - '${filename}'`);
        return delete plugins[filename];
      }
    } else {
      conn?.logger.info(`New plugin - '${filename}'`);
    }

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });

    if (err) {
      conn.logger.error(`Syntax error while loading '${filename}'\n${format(err)}`);
    } else {
      try {
        const module = await importFile(global.__filename(dir)).catch(console.error);
        if (module) plugins[filename] = module;
      } catch (e) {
        conn?.logger.error(`Error requiring plugin '${filename}\n${format(e)}'`);
      } finally {
        plugins = Object.fromEntries(Object.entries(plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
}

export {
  pluginFolderPath as pluginFolder,
  pluginFilter,
  plugins,
  watcher,
  pluginFolders,
  filesInit,
  deletePluginFolder,
  reload,
};
