import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) throw '*Please respond to an image with a QR code*';

    let img = await q.download?.();
    if (!img) throw '*Failed to download the image*';

    let url = await uploadImage(img);
    if (!url) throw '*Failed to upload the image*';

    let anu = await fetch(`https://api.lolhuman.xyz/api/read-qr?apikey=${lolkeysapi}&img=${url}`);
    if (!anu.ok) throw '*Error reading the QR code*';

    let json = await anu.json();
    if (!json.result) throw '*Failed to read the QR code*';

    await m.reply(`*Here you go:* ${json.result}`);
  } catch (error) {
    console.error('Error processing QR code:', error);
    m.reply(`*Oops! An error occurred: ${error.message}*`);
  }
};

handler.command = /^(readqr)$/i;
export default handler;
