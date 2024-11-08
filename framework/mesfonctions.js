"use strict";
const axios = require('axios');
const path = require("path");
const cheerio = require("cheerio");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const util = require('util');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transportslet { listall } = require('./stylish-font');

const genererNomFichier = async (extension) => {
  const randomNbre = Math.floor(Math.random() * 2000);
  const nomFichier = `Zok${randomNbre}.${extension}`;
  return nomFichier;
};

const stick = async (buffer, author) => {
  try {
    const sticker = new Sticker(buffer, {
      pack: 'DEXTER-MD',
      author,
      type: StickerTypes.FULL,
      categories: ['🤩', '🎉'],
      id: '12345',
      quality: 50,
      background: '#000000'
    });
    return sticker;
  } catch (error) {
    logger.error('Error creating sticker:', error);
    throw error;
  }
};

const zJson = async (url, option = {}) => {
  try {
    const result = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36' },
      ...option
    });
    return result.data;
  } catch (error) {
    logger.error('Error fetching JSON data:', error);
    throw error;
  }
};

const getBuffer = async (url, option = {}) => {
  try {
    const result = await axios.get(url, {
      headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
      ...option, responseType: 'arrayBuffer'
    });
    return result.data;
  } catch (error) {
    logger.error('Error fetching buffer:', error);
    throw error;
  }
};

const recept_message = async (zok, mess, store) => {
  if (!mess) return;

  if (mess.key) {
    const { key, message } = mess;
    mess.cleMessage = key;
    mess.idMessage = key.id;
    mess.origineMessage = key.remoteJid;
    mess.moi = key.fromMe;
    mess.groupe = mess.origineMessage.endsWith('@g.us');
    mess.origineBot = mess.idMessage.startsWith('BAE5') && mess.idMessage.length === 16;

    mess.typeMessage = getContentType(message);
    mess.ms = (mess.typeMessage === 'viewOnceMessage' ? message[mess.typeMessage].message[getContentType(message[mess.typeMessage].message)] : message[mess.typeMessage]);

    try {
      const { typeMessage, ms } = mess;
      const messageSwitch = {
        'conversation': () => mess.corpsMessage = message.conversation,
        'imageMessage': () => mess.corpsMessage = message.imageMessage.caption,
        'videoMessage': () => mess.corpsMessage = message.videoMessage.caption,
        'extendedTextMessage': () => mess.corpsMessage = message.extendedTextMessage.Textarea,
        'buttonsResponseMessage': () => mess.corpsMessage = message.buttonsResponseMessage.SelectedButtonId,
        'listResponseMessage': () => mess.corpsMessage = message.listResponseMessage.singleSelectReply.selectedRowId,
        'templateButtonReplyMessage': () => mess.corpsMessage = message.templateButtonReplyMessage.selectedId,
        'messageContextInfo': () => mess.corpsMessage = ms.contextInfo.quotedMessage ? ms.contextInfo.quotedMessage : '',
        'default': () => mess.corpsMessage = false,
      };
      (messageSwitch[typeMessage] || messageSwitch['default'])();
    } catch {
      mess.corpsMessage = false;
    }

    mess.quoted = mess.ms.contextInfo ? mess.ms.contextInfo.quotedMessage : null;
    mess.mentionedJid = mess.ms.contextInfo ? mess.ms.contextInfo.mentionedJid : [];
  }

  return mess;
};

const styletext = async (teks) => {
  try {
    const { data } = await axios.get(`http://qaz.wtf/u/convert.cgi?text=${teks}`);
    const $ = cheerio.load(data);
    const hasil = [];
    $('table > tbody > tr').each((_, element) => {
      hasil.push({
        name: $(element).find('td:nth-child(1) > span').text(),
        result: $(element).find('td:nth-child(2)').text().trim()
      });
    });
    return hasil;
  } catch (error) {
    logger.error('Error styling text:', error);
    throw error;
  }
};

const apiWaifu = async (theme) => {
  let url = `https://api.waifu.pics/nsfw/${theme || 'waifu'}`;
  try {
    const { data } = await axios.get(url);
    return data.url;
  } catch (error) {
    logger.error('Error fetching waifu image:', error);
    throw error;
  }
};

const tabCmd = {};
const reaction = {};
const fruit = {};

const ajouterCommande = async () => {
  const commandesPath = path.join(__dirname, '/../commandes');
  fs.readdirSync(commandesPath).forEach((fichier) => {
    if (path.extname(fichier).toLowerCase() === '.js') {
      require(path.join(commandesPath, fichier.split('.js')[0]));
      logger.info('Loaded command file:', fichier);
    }
  });
};

const xlab = async () => {
  const readDir = util.promisify(fs.readdir);
  const readFile = util.promisify(fs.readFile);
  const chemin = './commandes/';
  const nomFichier = await readDir(chemin);
  nomFichier.forEach((fichier) => {
    if (fichier.endsWith('.js')) {
      const { commande } = require(path.join(__dirname, '/../commandes/', fichier.split('.js')[0]));
      if (commande) {
        const infos = commande();
        if (infos) {
          for (const cd of infos.nomCom) {
            fruit[cd] = infos.execute;
          }
        }
      }
    }
  });
};

const { sizeFormatter } = require('human-readable');
const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

const police = (text, index) => {
  index = index - 1;
  return listall(text)[index];
};

module.exports = {
  genererNomFichier,
  stick,
  zJson,
  getBuffer,
  recept_message,
  styletext,
  apiWaifu,
  tabCmd,
  reaction,
  fruit,
  ajouterCommande,
  xlab,
  format,
  police
};
