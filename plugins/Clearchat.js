const handler = async (m, { conn, args }) => {
  try {
    // Prompt user for confirmation before deletion
    const confirmation = await conn.sendMessage(m.chat, {
      text: "Are you sure you want to delete this chat? Type 'yes' to confirm.",
      mentions: [m.sender],
    });

    const filter = msg => msg.key.remoteJid === m.chat && msg.message.conversation.toLowerCase() === 'yes';

    const collector = conn.createMessageCollector(filter, { time: 15000 }); // 15 seconds timeout

    collector.on('collect', async (collected) => {
      if (collected.message.conversation.toLowerCase() === 'yes') {
        // Optionally, back up the chat before deleting
        const backupChat = await conn.loadAllMessages(m.chat);
        // Save the backupChat to a file or database (implementation not shown)

        // Delete the chat
        await conn.chatModify(
          {
            delete: true,
            lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }],
          },
          m.chat
        );

        await conn.reply(m.chat, 'Successfully deleted this chat!', m);
        logDeletionAction(m.chat); // Log the deletion action
        collector.stop();
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        conn.reply(m.chat, 'Chat deletion cancelled. No confirmation received.', m);
      }
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    await conn.reply(m.chat, 'Error occurred while deleting the chat. Please try again later.', m);
  }
};

// Log the deletion action
const logDeletionAction = (chatId) => {
  const logEntry = {
    chatId: chatId,
    timestamp: new Date().toISOString(),
  };
  console.log('Deletion Log:', logEntry);
  // Optionally, save logEntry to a file or database (implementation not shown)
};

handler.help = ['deletechat'];
handler.tags = ['owner'];
handler.command = /^(deletechat|delchat|dchat|clearchat|cleanchat)$/i;
handler.owner = true;

export default handler;
