import { toDataURL } from 'qrcode';

const handler = async (m, { text, conn }) => {
  try {
    if (!text) throw '*Please provide a text to convert*';

    // Generate QR code
    const qrCodeURL = await toDataURL(text.slice(0, 2048), { scale: 8 });

    // Send the QR code image to the user
    await conn.sendFile(m.chat, qrCodeURL, 'qrcode.png', 'Here you go!', m);

  } catch (error) {
    console.error('Error generating QR code:', error);
    m.reply('*Oops! Something went wrong while generating the QR code. Please try again later.*');
  }
};

handler.help = ['', 'code'].map(v => 'qr' + v + ' <text>');
handler.tags = ['tools'];
handler.command = /^qr(code)?$/i;

export default handler;
