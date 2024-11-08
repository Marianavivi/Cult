import fetch from 'node-fetch';
import { likee } from 'nayan-media-downloader';

const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;
        console.log(`Retrying... (${i + 1})`);
    }
    throw new Error('Failed to fetch media after multiple attempts.');
};

const handler = async (message, { conn, args }) => {
    if (!args[0]) throw new Error('❌ Please provide a Likee video link.');

    const likeeUrlPattern = /(likee\.app|likee\.com|likee\.tv|lite\.likeevideo\.com|l\.likee\.video)/;
    if (!args[0].match(likeeUrlPattern)) throw new Error('❌ Invalid URL. Please provide a correct Likee video link.');

    message.react('⏳');

    try {
        const url = args[0];
        console.log('Likee URL:', url);

        let mediaData = await likee(url);
        console.log('Media Data:', mediaData);

        if (!mediaData.success || mediaData.success !== 1) throw new Error(`Error: ${mediaData.message}`);

        const downloadUrl = mediaData.data.downloadWithoutWatermark;
        if (!downloadUrl) throw new Error('Error: No download link found.');

        console.log('Download URL:', downloadUrl);
        const response = await fetchWithRetry(downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36' } });
        console.log('Response Headers:', response.headers);

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || (!contentType.includes('video/mp4') && !contentType.includes('octet-stream'))) throw new Error('Error: Invalid content type received.');

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length === 0) throw new Error('Error: Downloaded file is empty.');

        const fileName = mediaData.data.title ? `${mediaData.data.title}.mp4` : 'media.mp4';
        const mimeType = 'video/mp4';

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

handler.command = ['likee <url>'];
handler.help = ['likee'];
handler.tags = ['downloader'];

export default handler;
