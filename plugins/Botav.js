const handler = async (m, { conn }) => {
  try {
    const user = global.db.data.users[m.sender];
    const name = conn.getName(m.sender);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const av = `./assets/${pickRandom(['mariana', 'cult'])}.mp3`;

    // Send a message with buttons
    await conn.sendButton(
      m.chat,
      `*HOLA FROM CULT*\n        Morning or Evening\n\n @${m.sender.split('@')[0]}     \n\n*You called me what is your problem bro?* `.trim(),
      igfg,
      null,
      [['OWNER HELP', '.grp'], ['GET SC', '.repo']],
      m,
      { mentions: [m.sender] }
    );

    // Send an audio file
    await conn.sendFile(
      m.chat,
      av,
      'audio.mp3',
      null,
      m,
      true,
      { type: 'audioMessage', ptt: true }
    );
  } catch (error) {
    console.error('Error sending message or file:', error);
  }
};

handler.customPrefix = /^(bot|qasim)$/i;
handler.command = new RegExp();
export default handler;

// Function to pick a random item from a list
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}
