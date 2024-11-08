import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default owner and loading from environment variables
const defaultOwner = 254732647560';
const ownervb = process.env.OWNERS || defaultOwner;
const ownerlist = ownervb.split(';');

// Global settings
global.owner = ownerlist.map(owner => [owner, true]);
global.botname = process.env.BOTNAME || 'CULT';
global.botNumber = 254732647560'; // Replace with your bot number

// Allowed contacts and API keys
global.mods = [];
global.prems = [];
global.allowed = [254732647560', '254743032398'];
global.keysZens = ['c2459db922', '37CC845916', '6fb0eff124'];
global.keysxxx = global.keysZens[Math.floor(Math.random() * global.keysZens.length)];
global.keysxteammm = [
  '29d4b59a4aa687ca',
  '5LTV57azwaid7dXfz5fzJu',
  'cb15ed422c71a2fb',
  '5bd33b276d41d6b4',
  'HIRO',
  'kurrxd09',
  'ebb6251cc00f9c63'
];
global.keysxteam = global.keysxteammm[Math.floor(Math.random() * global.keysxteammm.length)];
global.keysneoxrrr = ['5VC9rvNx', 'cfALv5'];
global.keysneoxr = global.keysneoxrrr[Math.floor(Math.random() * global.keysneoxrrr.length)];
global.lolkeysapi = ['GataDios'];

// Channels and APIs
global.canal = 'https://whatsapp.com/channel/0029VaLYCPXJENxtW7BU9a0u';
global.APIs = {
  xteam: 'https://api.xteam.xyz',
  dzx: 'https://api.dhamzxploit.my.id',
  lol: 'https://api.lolhuman.xyz',
  violetics: 'https://violetics.pw',
  neoxr: 'https://api.neoxr.my.id',
  zenzapis: 'https://zenzapis.xyz',
  akuari: 'https://api.akuari.my.id',
  akuari2: 'https://apimu.my.id',
  nrtm: 'https://fg-nrtm.ddns.net',
  bg: 'http://bochil.ddns.net',
  fgmods: 'https://api.fgmods.xyz'
};

global.APIKeys = {
  'https://api.xteam.xyz': 'd90a9e986e18778b',
  'https://api.lolhuman.xyz': '85faf717d0545d14074659ad',
  'https://api.neoxr.my.id': global.keysneoxr,
  'https://violetics.pw': 'beta',
  'https://zenzapis.xyz': global.keysxxx,
  'https://api.fgmods.xyz': 'm2XBbNvz'
};

// Sticker watermark and other global settings
global.premium = true;
global.packname = 'CULT';
global.author = 'Marianavivi';
global.menuvid = 'https://files.catbox.moe/sh5zls.mp4';
global.igfg = '📸 Follow on Instagram\nhttps://www.instagram.com/xj_ent';
global.dygp = 'https://whatsapp.com/channel/0029VaLYCPXJENxtW7BU9a0u';
global.fgsc = 'https://github.com/Marianavivi/Cult';
global.fgyt = 'https://youtube.com/@MarianaGuetirrez-b5p';
global.fgpyp = 'https://youtube.com/@MarianaGuetirrez-b5p';
global.fglog = 'https://files.catbox.moe/hplv2q.jpg';
global.thumb = fs.readFileSync('./assets/mariana.jpg');

// Emojis and messages
global.wait = '⏳';
global.rwait = '⏳';
global.dmoji = '🤭';
global.done = '✅';
global.error = '❌';
global.xmoji = '🤩';

// Additional settings
global.multiplier = 69;
global.maxwarn = 3;

// Watch for changes to the file and update dynamically
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js'"));
  import(`${file}?update=${Date.now()}`);
});
