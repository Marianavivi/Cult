// Function to handle status messages before processing
export async function before(m, { conn, isAdmin, isBotAdmin }) {
  // Only handle status messages
  if (m.key.remoteJid != 'status@broadcast') return false;

  // Ensure story array exists
  this.story = this.story ? this.story : [];

  // Extract details from the message
  const { mtype, text, sender } = m;
  const { jid } = conn.user;
  const senderId = m.key.participant.split('@')[0];
  const chatData = global.db.data.chats[m.chat];

  // Handle specific message types and view status without downloading
  if (mtype === 'imageMessage' || mtype === 'videoMessage') {
    const caption = `status from ${senderId}\n\n ©ULTRA-MD`;
    this.story.push({
      type: mtype,
      quoted: m,
      sender: sender,
      caption: caption,
    });
  } else if (mtype === 'audioMessage') {
    this.story.push({
      type: mtype,
      quoted: m,
      sender: sender,
    });
  } else if (mtype === 'extendedTextMessage') {
    const messageText = text ? text : '';
    this.story.push({
      type: mtype,
      quoted: m,
      sender: sender,
      message: messageText,
    });
  }

  // Preserve auto status view behavior, skip download
  return chatData.viewStory ? true : false;
}
