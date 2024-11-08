import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `*This command generates images from text prompts*\n\n*𝙴xample usage*\n*◉ ${usedPrefix + command} Beautiful anime girl*\n*◉ ${usedPrefix + command} Elon Musk in pink outfit*`;
  }

  try {
    m.reply('*Please wait, generating images...*');

    const endpoint = `https://api.gurusensei.workers.dev/dream?prompt=${encodeURIComponent(text)}`;
    const response = await fetch(endpoint);

    if (response.ok) {
      const imageBuffer = await response.buffer();
      const imgurl = await uploadImage(imageBuffer);

      await conn.sendButton(
        m.chat,
        'Here is your Result',
        author,
        imgurl,
        [['Script', '.sc']],
        null,
        [['Follow Me', 'https://github.com/Marianavivi']],
        m
      );
    } else {
      throw new Error('Image generation failed');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    await conn.reply(m.chat, '*Oops! Something went wrong while generating images. Please try again later.*', m);
  }
};

handler.help = ['dalle'];
handler.tags = ['AI'];
handler.command = ['dalle', 'gen', 'imagine', 'openai2'];
export default handler;
