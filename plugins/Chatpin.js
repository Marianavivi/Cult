const schedule = require('node-schedule');

// In-memory log for pinned/unpinned actions
const pinLog = [];

const handler = async (m, { conn, args }) => {
  try {
    const chatId = m.chat;
    const action = args[0] || 'pin'; // Default action to pin
    const scheduleTime = args[1]; // Optional scheduling time

    if (scheduleTime) {
      // Schedule the pin/unpin action
      schedule.scheduleJob(scheduleTime, async () => {
        await modifyChatPin(conn, chatId, action);
      });
      conn.reply(chatId, `Chat ${action} scheduled for ${scheduleTime} 📅`, m);
    } else {
      // Immediate pin/unpin action
      await modifyChatPin(conn, chatId, action);
    }

    // Log the action
    logPinAction(chatId, action, scheduleTime);
  } catch (error) {
    console.error('Error handling pin/unpin action:', error);
  }
};

const modifyChatPin = async (conn, chatId, action) => {
  const pin = action === 'pin';
  await conn.chatModify({ pin: pin }, chatId);
  const message = pin ? 'Chat pinned 📌' : 'Chat unpinned 📍';
  await conn.reply(chatId, message, null);
};

const logPinAction = (chatId, action, scheduleTime) => {
  const logEntry = {
    chatId: chatId,
    action: action,
    timestamp: new Date().toISOString(),
    scheduleTime: scheduleTime || 'Immediate',
  };
  pinLog.push(logEntry);
  console.log('Pin/Unpin Log:', logEntry);
};

handler.help = ['pin [pin|unpin] [time]'];
handler.tags = ['owner'];
handler.command = ['pin', 'unpin'];
handler.owner = true;

export default handler;
