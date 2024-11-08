import fetch from 'node-fetch';

const gitagptHandler = async (m, { text, usedPrefix, command }) => {
  try {
    // Validate input text or quoted message
    if (!text && !(m.quoted && m.quoted.text)) {
      throw `Please provide some text or quote a message to get a response. Keep in mind that GitaGPT is still in the testing phase, so it may generate inaccurate responses at times.`;
    }

    // Use quoted message text if text is not provided
    if (!text && m.quoted && m.quoted.text) {
      text = m.quoted.text;
    }

    // Indicate that the bot is composing a message
    conn.sendPresenceUpdate('composing', m.chat);

    // Encode the prompt and prepare the API endpoint
    const prompt = encodeURIComponent(text);
    const endpoint = `https://ultimetron.guruapi.tech/gita?prompt=${prompt}`;

    // Fetch the response from the API
    const response = await fetch(endpoint);

    // Check if the response is ok
    if (!response.ok) {
      throw `Failed to fetch response from GitaGPT API.`;
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Check if the completion result exists
    if (!data.completion) {
      throw `No completion result found in the response.`;
    }

    // Send the result to the user
    m.reply(data.completion);
  } catch (error) {
    console.error('Error:', error.message);
    m.reply(`*ERROR: ${error.message}*`);
  }
};

gitagptHandler.help = ['gitagpt'];
gitagptHandler.tags = ['AI'];
gitagptHandler.command = ['gitagpt'];
gitagptHandler.diamond = false;

export default gitagptHandler;
