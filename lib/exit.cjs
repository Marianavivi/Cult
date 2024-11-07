const fs = require('fs');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ff = require('fluent-ffmpeg');
const webp = require('node-webpmux');
const path = require('path');

const generateRandomFileName = (extension) => {
    return path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${extension}`);
};

const convertToWebp = async (inputFile, outputFile, isVideo) => {
    const ffmpeg = ff(inputFile)
        .on('error', (err) => { throw err; })
        .on('end', () => { return true; })
        .toFormat('webp')
        .save(outputFile);

    if (isVideo) {
        ffmpeg.addOutputOptions([
            '-vcodec', 'libwebp',
            '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
            '-loop', '0',
            '-ss', '00:00:00',
            '-t', '00:00:05',
            '-preset', 'default',
            '-an', '-vsync', '0'
        ]);
    } else {
        ffmpeg.addOutputOptions([
            '-vcodec', 'libwebp',
            '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
        ]);
    }

    await ffmpeg.run();
};

const writeExif = async (inputFile, metadata, isImage) => {
    const outputFile = generateRandomFileName('webp');

    if (metadata.packname || metadata.author) {
        const img = new webp.Image();
        const json = {
            'sticker-pack-id': `https://github.com/DikaArdnt/Hisoka-Morou`,
            'sticker-pack-name': metadata.packname,
            'sticker-pack-publisher': metadata.author,
            'emojis': metadata.categories ? metadata.categories : ['']
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        await img.load(inputFile);
        img.exif = exif;
        await img.save(outputFile);
        return outputFile;
    }

    return inputFile;
};

const processMedia = async (media, metadata, isImage) => {
    const tempInputFile = generateRandomFileName(isImage ? 'jpg' : 'mp4');
    const tempOutputFile = generateRandomFileName('webp');

    fs.writeFileSync(tempInputFile, media);

    await convertToWebp(tempInputFile, tempOutputFile, !isImage);

    const exifFile = await writeExif(tempOutputFile, metadata, isImage);

    fs.unlinkSync(tempInputFile);
    fs.unlinkSync(tempOutputFile);

    return fs
