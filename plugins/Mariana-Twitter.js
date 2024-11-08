import fetch from 'node-fetch';
import { twitterdown } from 'nayan-media-downloader';

// Retry fetch function to handle transient errors
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options);
        if (response.ok) return response;
        console.log(`Retrying... (${i + 1})`);
    }
    throw new Error('Failed to fetch media after multiple attempts.');
};

const handler = async (message, { conn, args }) => {
    if (!args[0]) throw new Error('❌ Please provide a Twitter link.');

    const twitterUrlPattern = /twitter|x\.com/gi;
    if (!args[0].match(twitterUrlPattern)) throw new Error('❌ Invalid URL. Please provide a correct Twitter link.');

    message.react('⏳');

    try {
        const url = args[0];
        console.log('Twitter URL:', url);

        const mediaData = await twitterdown(url);
        console.log('Media Data:', mediaData);

        const { download, fileName, mimetype } = mediaData;
        const messageContent = `✳️ Enter the link next to the command\n\n☆ VIDEO TITLE: ${fileName}\n\n❥ Here is your video:\n\n❥ © Mariana`;
        await conn.sendFile(
            message.chat,
            download,
            fileName,
            messageContent,
            message,
            false,
            { mimetype }
        );

        message.react('✅');
    } catch (error) {
        console.error('❌ Error:', error.message, error.stack);
        await message.reply(`⚠️ An error occurred while processing the request. Please try again later.`);
        message.react('❌');
    }
};

handler.command = ['twitter <url>'];
handler.help = ['twitter'];
handler.tags = ['downloader'];

export default handler;
