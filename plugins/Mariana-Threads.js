import fetch from 'node-fetch';
import { threads } from 'nayan-media-downloader';

const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;
        console.log(`Retrying... (${i + 1})`);
    }
    throw new Error('Failed to fetch media after multiple attempts.');
};

const handler = async (message, { conn, args }) => {
    if (!args[0]) throw new Error('❌ Please provide an Instagram Threads link.');

    const threadsUrlPattern = /threads\.net\/(@[^\s\/]+\/post\/[^\s?]+)/gi;
    if (!args[0].match(threadsUrlPattern)) throw new Error('❌ Invalid URL. Please provide a correct Instagram Threads link.');

    message.react('⏳');

    try {
        const url = args[0];
        console.log('Threads URL:', url);

        const mediaData = await threads(url);
        console.log('Media Data:', mediaData);

        const { video, image } = mediaData;
        const downloadUrl = video || image;
        if (!downloadUrl) throw new Error('Error: No download link found.');

        console.log('Download URL:', downloadUrl);

        const response = await fetchWithRetry(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36' } });
        console.log('Response Headers:', response.headers);

        const buffer = Buffer.from(await response.arrayBuffer());
        const mimeType = video ? 'video/mp4' : 'image/jpeg';
        const fileName = video ? 'media.mp4' : 'media.jpg';

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

handler.command = ['threads <url>'];
handler.help = ['threads'];
handler.tags = ['downloader'];

export default handler;
