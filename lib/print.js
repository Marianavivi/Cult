import chalk from 'chalk';
import { watchFile } from 'fs';
import terminalImage from 'terminal-image';

const urlRegex = (await import('url-regex-safe')).default({ strict: false });

/**
 * Logs text to the console with appropriate color based on error state.
 * @param {string} text - The text to log.
 * @param {boolean} [error=false] - Whether the log is for an error.
 */
const log = (text, error = false) =>
  console.log(
    chalk[error ? 'red' : 'blue']('[ULTRA MD]'),
    chalk[error ? 'redBright' : 'greenBright'](text)
  );

/**
 * Logs messages and commands with details about the sender and chat context.
 * @param {Object} m - The message object.
 * @param {Object} conn - The connection object.
 */
export default async function logMessage(m, conn = { user: {} }) {
  const senderName = await conn.getName(m.sender);

  let chatName = 'Private';
  if (m.chat && m.chat !== m.sender) {
    if (m.chat.endsWith('@g.us')) {
      chatName = await conn.getName(m.chat) || '';
    }
  }

  if (m.isCommand) {
    const commandText = m.text.split(' ')[0];
    const cmdtxt = chalk.cyanBright('Command');
    const cmd = chalk.yellowBright(`${commandText}`);
    const from = chalk.greenBright('from');
    const username = chalk.yellowBright(`${senderName}`);
    const ins = chalk.greenBright('in');
    const grp = chalk.blueBright(chatName);
    log(`${cmdtxt} ${cmd} ${from} ${username} ${ins} ${grp}`);
  } else {
    const msg = chalk.cyanBright('Message');
    const from = chalk.greenBright('from');
    const username = chalk.yellowBright(`${senderName}`);
    const ins = chalk.greenBright('in');
    const grp = chalk.blueBright(chatName);
    log(`${msg} ${from} ${username} ${ins} ${grp}`);
  }
}

// Watch for changes in the file and log updates
const file = global.__filename(import.meta.url);
watchFile(file, () => {
  log(chalk.redBright("Update 'lib/print.js'"));
});
