import Helper from './helper.js';
import { promises as fs } from 'fs';
import { tmpdir, platform } from 'os';
import { join } from 'path';

const maxtime = 1000 * 60 * 2; // 2 minutes in milliseconds
const __dirname = Helper.__dirname(import.meta);

/**
 * Asynchronously clears temporary files from specified directories.
 * Deletes files older than a specified maximum time.
 */
export default async function clearTmp() {
  const tmpDirs = [tmpdir(), join(__dirname, '../tmp')];
  const deletedFiles = []; // Array to store deleted file paths

  await Promise.allSettled(
    tmpDirs.map(async (dir) => {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (!file.endsWith('.file')) {
            const filePath = join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat.isFile() && Date.now() - stat.mtimeMs >= maxtime) {
              // Check if the file can be opened (Windows specific check)
              if (platform() === 'win32') {
                let fileHandle;
                try {
                  fileHandle = await fs.open(filePath, 'r+');
                } catch (e) {
                  console.error('[clearTmp] Error opening file:', e.message);
                  continue;
                } finally {
                  await fileHandle?.close();
                }
              }
              // Delete the file
              await fs.unlink(filePath);
              deletedFiles.push(filePath); // Add the deleted file to the array
            }
          }
        }
      } catch (e) {
        console.error(`[clearTmp] Error reading directory '${dir}':`, e.message);
      }
    })
  );

  // Log the number of deleted files
  console.log(`[clearTmp] Deleted ${deletedFiles.length} files.`);
}
