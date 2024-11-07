'use strict';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Levelup image
 * @param {String} teks - Text to annotate
 * @param {Number} level - Level to display
 * @returns {Promise<Buffer>}
 */
export function levelup(teks, level) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check for support
            if (!(global.support.convert || global.support.magick || global.support.gm)) {
                return reject('Image conversion tool not supported!');
            }
            const font = join(__dirname, '../src/font');
            const fontLevel = join(font, 'level_c.otf');
            const fontTexts = join(font, 'texts.otf');
            const templatePath = join(__dirname, '../src/lvlup_template.jpg');

            // Set annotations based on the level
            let annotations = '+1385+260';
            if (level > 2) annotations = '+1370+260';
            if (level > 10) annotations = '+1330+260';
            if (level > 50) annotations = '+1310+260';
            if (level > 100) annotations = '+1260+260';

            // Prepare spawn arguments
            const [command, ...args] = [
                ...(global.support.gm ? ['gm'] : global.support.magick ? ['magick'] : []),
                'convert',
                templatePath,
                '-font', fontTexts,
                '-fill', '#0F3E6A',
                '-size', '1024x784',
                '-pointsize', '68',
                '-interline-spacing', '-7.5',
                '-annotate', '+153+200', teks,
                '-font', fontLevel,
                '-fill', '#0A2A48',
                '-size', '1024x784',
                '-pointsize', '140',
                '-interline-spacing', '-1.2',
                '-annotate', annotations, level,
                'jpg:-'
            ];

            // Spawn process and collect data
            let bufs = [];
            const process = spawn(command, args);

            process.on('error', (err) => reject(`Process error: ${err.message}`));
            process.stdout.on('data', (chunk) => bufs.push(chunk));
            process.on('close', () => resolve(Buffer.concat(bufs)));
        } catch (error) {
            reject(`Error: ${error.message}`);
        }
    });
}
