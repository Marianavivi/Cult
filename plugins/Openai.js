import fetch from 'node-fetch';

let handler = async (m, { text, conn, usedPrefix, command }) => {
  try {
    // Check if the user provided text or quoted a message
    if (!text && !(m.quoted && m.quoted.text)) {
      throw 'Please provide some text or quote a message to get a response.';
    }

    // If no text but quoted message, use the quoted text
    if (!text && m.quoted && m.quoted.text) {
      text = m.quoted.text;
    }

    // Reacting with a waiting emoji
    m.react('⏳');

    // Update chat presence to show typing
    conn.sendPresenceUpdate('composing', m.chat);

    const prompt = encodeURIComponent(text);
    const guru1 = `https://api.gurusensei.workers.dev/llama?prompt=${prompt}`;

    // First API call
    try {
      let response = await fetch(guru1);
      let data = await response.json();

      // Check if the response is valid
      if (!data || !data.response || !data.response.response) {
        throw new Error('No valid JSON response from the first API');
      }

      let result = data.response.response;
      await sendResponse(conn, m, result, 'First API');
    } catch (error) {
      console.error('Error from the first API:', error);

      // Fallback to the second API if the first one fails
      const guru2 = `https://ultimetron.guruapi.tech/gpt3?prompt=${prompt}`;
      try {
        let response = await fetch(guru2);
        let data = await response.json();

        // Check if the response is valid
        if (!data || !data.completion) {
          throw new Error('No valid JSON response from the second API');
        }

        let result = data.completion;
        await sendResponse(conn, m, result, 'Second API');
      } catch (error) {
        console.error('Error from the second API:', error);
        throw 'Both APIs failed. Please try again later.';
      }
    }
  } catch (error) {
    console.error('General Error:', error);
    await conn.reply(m.chat, `*ERROR: ${error}*`, m);
  }
};

// Function to send response with buttons
async function sendResponse(conn, m, result, source) {
  await conn.sendButton(m.chat, result, `Source: ${source}`, 'https://i.ibb.co/9HY4wjz/a4c0b1af253197d4837ff6760d5b81c0.jpg', [['Script', '.sc']], null, [['Follow Me', 'https://github.com/Marianavivi']], m);
  m.react('✅');
}

handler.help = ['chatgpt'];
handler.tags = ['AI'];
handler.command = ['bro', 'chatgpt', 'ai', 'gpt'];

export default handler;
