import fetch from 'node-fetch';
import { capcut } from 'nayan-media-downloader';

// Handler function to manage CapCut downloads
const handler = async (message, { conn, args }) => {
    const urlPattern = /(capcut\.com\/[^\s]+)/gi;
    
    if (!args[0]) {
        throw new Error('Error: No URL provided. Please provide a CapCut link.');
    }

    if (!args[0].match(urlPattern)) {
        throw new Error('Error: Invalid URL. Please provide a correct CapCut link.');
    }

    message.reply('⏳ Downloading...');

    try {
        const url = args[0];
        console.log('CapCut URL:', url);
        
        let mediaData = await capcut(url);
        console.log('Media Data:', mediaData);

        const { video, image } = mediaData;
        const downloadUrl = video || image;

        if (!downloadUrl) {
            throw new Error('Error: Could not fetch the media data. Please try again later.');
        }

        console.log('Download URL:', downloadUrl);
        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error('Error: Failed to download the media. Please try again.');
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const mimeType = video ? 'video/mp4' : 'image/jpeg';
        const fileName = video ? 'media.mp4' : 'media.jpg';

        await conn.sendFile(
            message.chat,
            buffer,
            fileName,
            'Powered by CapCut Downloader',
            message,
            false,
            { mimetype: mimeType }
        );

        message.reply('✅ Download complete.');

    } catch (error) {
        console.error('An error occurred:', error.message, error.stack);
        message.reply(`❌ Error: ${error.message}`);
    }
};

// Command and tags for the handler function
handler.command = ['capcut <url>'];
handler.help = ['capcut'];
handler.tags = ['downloader'];

export default handler;
