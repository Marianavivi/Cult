'use strict';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Helper to get __dirname in ES module
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Runs FFmpeg with specified arguments
 * @param {Buffer} buffer - Input file buffer
 * @param {Array} args - FFmpeg arguments
 * @param {String} ext - Temporary file extension
 * @param {String} ext2 - Output file extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  const tmp = join(__dirname, '../tmp', `${Date.now()}.${ext}`);
  const out = `${tmp}.${ext2}`;

  try {
    await fs.writeFile(tmp, buffer);
    console.log(`FFmpeg started with args: ${['-y', '-i', tmp, ...args, out].join(' ')}`);
    await runSpawnProcess('ffmpeg', ['-y', '-i', tmp, ...args, out]);
    const data = await fs.readFile(out);
    await fs.unlink(tmp);
    console.log(`FFmpeg process completed: ${out}`);
    return {
      data,
      filename: out,
      async delete() {
        await fs.unlink(out);
        console.log(`File deleted: ${out}`);
      }
    };
  } catch (error) {
    console.error('Error during FFmpeg processing:', error);
    await fs.unlink(tmp).catch(() => {});
    throw error;
  }
}

/**
 * Helper function to run spawn process
 * @param {String} command - Command to run
 * @param {Array} args - Command arguments
 * @returns {Promise<void>}
 */
function runSpawnProcess(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    process.on('error', reject);
    process.on('close', code => (code === 0 ? resolve() : reject(new Error(`Process exited with code ${code}`))));
    process.stdout.on('data', chunk => process.stdout.write(chunk));
    process.stderr.on('data', chunk => process.stderr.write(chunk));
  });
}

/**
 * Convert audio to playable WhatsApp PTT format
 * @param {Buffer} buffer - Audio buffer
 * @param {String} ext - File extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on'], ext, 'ogg');
}

/**
 * Convert audio to playable WhatsApp audio format
 * @param {Buffer} buffer - Audio buffer
 * @param {String} ext - File extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'], ext, 'opus');
}

/**
 * Convert video to playable WhatsApp video format
 * @param {Buffer} buffer - Video buffer
 * @param {String} ext - File extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, ['-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'slow'], ext, 'mp4');
}

export { toAudio, toPTT, toVideo, ffmpeg };
