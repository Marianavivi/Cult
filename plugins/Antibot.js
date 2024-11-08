import { areJidsSameUser } from '@whiskeysockets/baileys';

export async function before(m, { participants, conn }) {
  if (m.isGroup) {
    let chat = global.db.data.chats[m.chat];

    // Check if antiBotClone feature is enabled
    if (!chat.antiBotClone) {
      return;
    }

    let botJid = global.conn.user.jid; // JID of the main bot

    // Skip if the bot JID is the same as the connected bot
    if (botJid === conn.user.jid) {
      return;
    } else {
      // Check if the main bot is present in the group
      let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id));

      if (isBotPresent) {
        setTimeout(async () => {
          try {
            // Notify about the redundant bot and leave the group
            await m.reply(`✨ No bot is needed in this group, You will be expelled`, null, { quoted: m });
            await this.groupLeave(m.chat);
          } catch (error) {
            console.error('Error while leaving the group:', error);
          }
        }, 5000); // 5 seconds delay
      }
    }
  }
}
