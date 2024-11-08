const fs = require('fs-extra');
const path = require('path');

// Load environment variables if config.env exists
if (fs.existsSync(path.join(__dirname, 'config.env'))) {
  require('dotenv').config({ path: path.join(__dirname, 'config.env') });
}

// Global configuration variables with defaults and error handling
global.owner = process.env.OWNER_NUMBER || 254732647560';
global.mongodb = process.env.MONGODB_URI || "mongodb+srv://SithumKalhara:97531@cluster0.iva7dbo.mongodb.net/?retryWrites=true&w=majority";
global.port = process.env.PORT || 5000;
global.email = 'marianagutierrezvivi@gmail.com';
global.github = 'https://github.com/Marianavivi/Cult';
global.location = 'Kenya';
global.gurl = 'https://instagram.com/xj_ent'; // add your username
global.sudo = process.env.SUDO || '254732647560';
global.devs = '254732647560';
global.website = 'https://github.com/Marianavivi/Cult'; // wa.me/+254700000000
global.THUMB_IMAGE = process.env.THUMB_IMAGE || 'https://files.catbox.moe/hplv2q.jpg';

module.exports = {
  sessionName: process.env.SESSION_ID || '', // Put Your Session Id Here
  author: process.env.PACK_AUTHER || 'CULT',
  packname: process.env.PACK_NAME || 'MADE BY MARIANA',
  
  botname: process.env.BOT_NAME || 'CULT-MD',
  ownername: process.env.OWNER_NAME || 'Mariana',  
  auto_read_status: process.env.AUTO_READ_STATUS === 'true',
  autoreaction: process.env.AUTO_REACTION === 'true',
  antibadword: process.env.ANTI_BAD_WORD || 'nbwoed',
  alwaysonline: process.env.ALWAYS_ONLINE === 'true',
  antifake: process.env.FAKE_COUNTRY_CODE || '234',
  readmessage: process.env.READ_MESSAGE === 'true',
  auto_status_saver: process.env.AUTO_STATUS_SAVER === 'true',
  HANDLERS: process.env.PREFIX || '.',
  warncount: parseInt(process.env.WARN_COUNT, 10) || 3,
  disablepm: process.env.DISABLE_PM === 'true',
  levelupmessage: process.env.LEVEL_UP_MESSAGE === 'true',
  antilink: process.env.ANTILINK_VALUES || 'chat.whatsapp.com',
  antilinkaction: process.env.ANTILINK_ACTION || 'remove',
  BRANCH: 'main', 
  ALIVE_MESSAGE: process.env.ALIVE_MESSAGE || '',
  autobio: process.env.AUTO_BIO === 'true',
  caption: process.env.CAPTION || "\t*🟢POWERED BY CULT💠* ",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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',
  heroku: process.env.HEROKU === 'true',
  HEROKU: {
    HEROKU: process.env.HEROKU === 'true',
    API_KEY: process.env.HEROKU_API_KEY || 'HRKU-a0d897a4-5268-4da2-851d-190e61cff0d7',
    APP_NAME: process.env.HEROKU_APP_NAME || ''
  },
  VERSION: process.env.VERSION || 'v.0.0.3',
  LANG: process.env.THEME || 'cult',
  WORKTYPE: process.env.WORKTYPE || 'private'
};

// Watch for file changes and update the module dynamically
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update '${__filename}'`);
  delete require.cache[file];
  require(file);
});
