let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const regex = /x/g;
    if (!text) throw 'Please provide a number to search';
    if (!text.match(regex)) throw `*Example: ${usedPrefix + command} 923444844060x*`;

    const random = text.match(regex).length;
    const total = Math.pow(10, random);
    const array = [];

    for (let i = 0; i < total; i++) {
      const list = [...i.toString().padStart(random, '0')];
      const result = text.replace(regex, () => list.shift()) + '@s.whatsapp.net';

      if (await conn.onWhatsApp(result).then(v => (v[0] || {}).exists)) {
        const info = await conn.fetchStatus(result).catch(_ => {});
        array.push({ exists: true, jid: result, ...info });
      } else {
        array.push({ exists: false, jid: result });
      }
    }

    let txt = 'Registered\n\n' +
      array.filter(v => v.exists).map(v =>
        `• Link: wa.me/${v.jid.split('@')[0]}\n*• Bio:* ${v.status || 'No description'}\n*• Set on:* ${formatDate(v.setAt)}`
      ).join('\n\n') +
      '\n\n*Not registered*\n\n' +
      array.filter(v => !v.exists).map(v => v.jid.split('@')[0]).join('\n');

    m.reply(txt);
  } catch (error) {
    console.error('Error while processing the number search:', error);
    m.reply('*An error occurred while processing your request. Please try again later.*');
  }
}

handler.help = ['nowa'];
handler.tags = ['tools'];
handler.command = /^nowa$/i;
export default handler;

function formatDate(n, locale = 'in') {
  const d = new Date(n);
  return d.toLocaleDateString(locale, { timeZone: 'Africa🌍 /Kenya🇰🇪 ' });
}
