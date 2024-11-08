import fetch from 'node-fetch';
import { pintarest } from 'nayan-media-downloader';

// Retry fetch function to handle transient errors
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;
        console.log(`Retrying... (${i + 1})`);
    }
    throw new Error('Failed to fetch media after multiple attempts.');
};

// Handler function to manage Pinterest downloads
const handler = async (message, { conn, args }) => {
    if (!args[0]) throw new Error('❌ Please provide a Pinterest link.');

    const pinterestUrlPattern = /(pinterest\.com\/pin\/|pin\.it\/)/;
    if (!args[0].match(pinterestUrlPattern)) throw new Error('❌ Invalid URL. Please provide a correct Pinterest link.');

    message.react('⏳');

    try {
        const url = args[0];
        console.log('Pinterest URL:', url);

        const mediaData = await pintarest(url);
        console.log('Media Data:', mediaData);

        const downloadUrl = mediaData.type === 'video' ? mediaData.video : mediaData.image;
        if (!downloadUrl) throw new Error('Error: No download link found.');

        console.log('Download URL:', downloadUrl);

        const response = await fetchWithRetry(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36' } });
        console.log('Response Headers:', response.headers);

        const buffer = Buffer.from(await response.arrayBuffer());
        const mimeType = mediaData.type === 'video' ? 'video/mp4' : 'image/jpeg';
        const fileName = mediaData.type === 'video' ? 'media.mp4' : 'media.jpg';

        await conn.sendFile(
            message.chat,
            buffer,
            fileName,
            '✳️ Powered by CULT✳️',
            message,
            false,
            { mimetype: mimeType }
        );

        message.react('✅');
    } catch (error) {
        console.error('❌ Error:', error.message, error.stack);
        await message.reply(`❌ Error: ${error.message}`);
        message.react('❌');
    }
};

handler.command = ['pinterest <url>'];
handler.help = ['pinterest'];
handler.tags = ['downloader'];

export default handler;
