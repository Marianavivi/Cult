/**
 * Display a loading screen with progress updates.
 * @param {object} conn - The connection object for sending messages.
 * @param {string} from - The sender's identifier.
 */
export default async function displayLoadingScreen(conn, from) {
  const loadingStages = [
    'ʟᴏᴀᴅɪɴɢ 《 █▒▒▒▒▒▒▒▒▒▒▒》10%',
    'ʟᴏᴀᴅɪɴɢ 《 ████▒▒▒▒▒▒▒▒》30%',
    'ʟᴏᴀᴅɪɴɢ 《 ███████▒▒▒▒▒》50%',
    'ʟᴏᴀᴅɪɴɢ 《 ██████████▒▒》80%',
    'ʟᴏᴀᴅɪɴɢ 《 ████████████》100%',
    'ʟᴏᴀᴅɪɴɢ ᴄᴏᴍᴘʟᴇᴛᴇ',
  ];

  try {
    // Initial message to indicate loading start
    const { key } = await conn.sendMessage(from, { text: 'ʟᴏᴀᴅɪɴɢ...' });

    // Loop through loading stages and update the message
    for (const stage of loadingStages) {
      try {
        await conn.relayMessage(
          from,
          {
            protocolMessage: {
              key: key,
              type: 14,
              editedMessage: {
                conversation: stage,
              },
            },
          },
          {}
        );
      } catch (error) {
        console.error('Error updating loading stage:', error);
      }
    }
  } catch (error) {
    console.error('Error displaying loading screen:', error);
  }
}
