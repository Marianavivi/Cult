import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import { canLevelUp, xpRange } from '../lib/levelling.js';
import fetch from 'node-fetch';
import fs from 'fs';
import moment from 'moment-timezone';
import { promises } from 'fs';
import { join } from 'path';

const { levelling } = '../lib/levelling.js';
let handler = async (m, { conn, usedPrefix, command }) => {
    let d = new Date(new Date + 3600000);
    let locale = 'en';
    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;

    if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`;
    let pp = './assets/Ultra.jpg';
    let user = global.db.data.users[who];
    let { name, exp, diamond, lastclaim, registered, regTime, age, level, role, warn, coins, badges, missions } = global.db.data.users[who];
    let { min, xp, max } = xpRange(user.level, global.multiplier);
    let username = conn.getName(who);
    let math = max - xp;
    let prem = global.prems.includes(who.split`@`[0]);
    let sn = createHash('md5').update(who).digest('hex');
    let totaluser = Object.values(global.db.data.users).length;
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    let more = String.fromCharCode(8206);
    let readMore = more.repeat(850);
    let greeting = ucapan();
    let quote = quotes[Math.floor(Math.random() * quotes.length)];

    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
    let str = `
🚀 *_Buckle up ${name}, ${greeting}! We're going on an adventure!_* 🚀

📜 *_Quote of the day: ${quote}_* 📜

乂─『 *INFO*』─乂 

◈┏━⟪ *MENU* ⟫━⦿
◈┃• User Level: ${level}
◈┃• Experience: ${exp}
◈┃• Diamonds: 💎 ${diamond}
◈┃• Coins: 🪙 ${coins}
◈┃• Badges: 🏅 ${badges}
◈┃• Active Missions: 📜 ${missions}
◈┃• Role: ${role}
◈┃• Total Warnings: ⚠️ ${warn}
◈┃• Total Users: ${totaluser}
◈┃• Registered Users: ${rtotalreg}
◈┗━♪♪━★━☆━⦿

◈┏━⟪ *OTHER MENUS* ⟫━⦿
◈┃• Groupmenu
◈┃• Animemenu
◈┃• Infoanime
◈┃• Makermenu
◈┃• Ownermenu
◈┃• Stickermenu
◈┃• Toolsmenu
◈┃• Gamemenu
◈┃• Logomenu
◈┃• Randompic
◈┃• Randomvid
◈┃• Setprivacy
◈┃• Botmenu
◈┃• Dlmenu
◈┃• Enable
◈┃• Aimenu
◈┃• Aeditor
◈┃• Imagen
◈┃• Menu
◈┃• Menu3
◈┃• Menu4
◈┃• List
◈┃• Fancy
◈┃• Fancy2
◈┗━♪♪━★━☆━⦿

🔖 *Remember, you can always use ${usedPrefix}list or ${usedPrefix}help for guidance!* 🔖

© MARIANA CULT

*More quotes to boost your day:* 📜

${quotes.slice(0, 5).join('\n')}
`;

    conn.sendFile(m.chat, pp, 'profile.jpg', str, m, null, {
        mentions: [m.sender]
    });
    m.react('✅');
};

handler.help = ['main'];
handler.tags = ['group'];
handler.command = ['menu', 'help'];

export default handler;

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

function ucapan() {
    const time = moment.tz('Asia/Karachi').format('HH');
    let res = "Happy early in the day ☀️";
    if (time >= 4) {
        res = "Good Morning 🌄";
    }
    if (time >= 10) {
        res = "Good Afternoon ☀️";
    }
    if (time >= 15) {
        res = "Good Afternoon 🌇";
    }
    if (time >= 18) {
        res = "Good Night 🌙";
    }
    return res;
}

const quotes =[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/rizakc/wkwk-tes/tree/4ef389995581ab55091ac7aad7813f3c88a85c2e/index.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "1")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/fazrinmauza/store/tree/21b20c14fff160ac4f3be6a01c5f2441f5edcb62/sticker%2Fdevil.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "2")
