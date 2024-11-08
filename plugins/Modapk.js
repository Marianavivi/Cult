import { download } from 'aptoide-scraper';

let handler = async (m, { conn, usedPrefix: prefix, command, text }) => {
  try {
    if (command === 'modapk') {
      if (!text) throw `*[❗] Please provide the APK Name you want to download.*`;

      await conn.reply(m.chat, global.wait, m);
      let data = await download(text);

      if (!data || !data.dllink) throw `*[❗] Failed to fetch the APK data. Please check the name and try again.*`;

      if (data.size.replace(' MB', '') > 200 || data.size.includes('GB')) {
        return await conn.sendMessage(m.chat, { text: '*[⛔] The file is too large.*' }, { quoted: m });
      }

      // Log the download request
      console.log(`Download Request: ${data.name}, Size: ${data.size}, User: ${m.sender}`);

      await conn.sendMessage(
        m.chat,
        {
          document: { url: data.dllink },
          mimetype: 'application/vnd.android.package-archive',
          fileName: `${data.name}.apk`,
          caption: `📥 *Downloading ${data.name}*\n\n🗂️ Size: ${data.size}\n🔗 [Download Link](${data.dllink})`
        },
        { quoted: m }
      );

      // Confirm the download to the user
      await conn.reply(m.chat, `*[✅] Successfully downloaded ${data.name}.apk*`, m);

    }
  } catch (error) {
    console.error(error);
    throw `*[❗] An error occurred. Please ensure the APK name is correct and try again.*`;
  }
};

handler.help = ['modapk'];
handler.tags = ['downloader'];
handler.command = /^modapk$/i;
export default handler;
