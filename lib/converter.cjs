'use strict';
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process');

/**
 * Runs FFmpeg with specified arguments
 * @param {Buffer} buffer - Input file buffer
 * @param {Array} args - FFmpeg arguments
 * @param {String} ext - Temporary file extension
 * @param {String} ext2 - Output file extension
 * @returns {Promise<Buffer>}
 */
async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  const tmp = path.join(__dirname, '../src', `${Date.now()}.${ext}`);
  const out = `${tmp}.${ext2}`;

  try {
    await fs.promises.writeFile(tmp, buffer);
    const ffmpegArgs = ['-y', '-i', tmp, ...args, out];
    console.log(`Running FFmpeg with args: ${ffmpegArgs.join(' ')}`);
    await runSpawnProcess(ffmpegPath, ffmpegArgs);
    const result = await fs.promises.readFile(out);
    await fs.promises.unlink(tmp);
    await fs.promises.unlink(out);
    return result;
  } catch (error) {
    console.error('Error during FFmpeg processing:', error);
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
 * Convert audio to playable WhatsApp audio format
 * @param {Buffer} buffer - Audio buffer
 * @param {String} ext - File extension
 * @returns {Promise<Buffer>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'
  ], ext, 'mp3');
}

/**
 * Convert audio to playable WhatsApp PTT format
 * @param {Buffer} buffer - Audio buffer
 * @param {String} ext - File extension
 * @returns {Promise<Buffer>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'
  ], ext, 'opus');
}

/**
 * Convert video to playable WhatsApp video format
 * @param {Buffer} buffer - Video buffer
 * @param {String} ext - File extension
 * @returns {Promise<Buffer>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264', '-c:a', 'aac', '-ab', '128k', '-ar', '44100', '-crf', '32', '-preset', 'slow'
  ], ext, 'mp4');
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg
};
