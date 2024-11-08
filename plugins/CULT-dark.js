import fetch from 'node-fetch';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    // Check if the text is provided
    if (!text) throw 'Please provide the text you want to process.';
    
    await m.react('🤖');

    const prompt = encodeURIComponent(text);
    const apiurl = `https://dark.guruapi.tech/egpt?prompt=${prompt}`;

    // Fetch the response from the API
    const result = await fetch(apiurl);
    if (!result.ok) throw 'Failed to fetch from the API.';

    const response = await result.json();
    if (!response.message) throw 'No result found.';

    const replyText = response.message;

    // Send the result to the user
    await conn.sendButton(
      m.chat, 
      replyText, 
      'Author Name', // Replace 'Author Name' with the actual author's name
      'https://letemoinhaiti.com/home/wp-content/uploads/2024/03/img_9025-1-850x560.jpg', 
      [['Script', `.sc`]], 
      null, 
      [['Follow Me', `https://github.com/Marianavivi`]], 
      m
    );
  } catch (error) {
    console.error('Error:', error);
    m.reply('Oops! Something went wrong. We are trying hard to fix it ASAP.');
  }
};

handler.help = ['darky <text>'];
handler.tags = ['tools'];
handler.command = ['darky', 'darkgpt'];

export default handler;
