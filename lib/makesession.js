import { fileURLToPath } from 'url';
import path from 'path';
import { writeFileSync } from 'fs';
import * as mega from 'megajs';

/**
 * Process the input text, download the file from MEGA, and save its contents.
 * @param {string} txt - The input text containing the MEGA file code.
 */
async function processTxtAndSaveCredentials(txt) {
  // Get the current filename and directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Extract the MEGA file code from the input text
  const megaCode = txt.replace('Cult~', '');
  const megaUrl = `https://mega.nz/file/${megaCode}`;
  console.log('MEGA URL:', megaUrl);

  // Create a MEGA file instance from the URL
  const file = mega.File.fromURL(megaUrl);

  try {
    // Download the file as a stream
    const stream = file.download();
    let data = '';

    // Read the stream and accumulate the data
    for await (const chunk of stream) {
      data += chunk.toString();
    }

    // Save the data to a local file
    const credsPath = path.join(__dirname, '..', 'session', 'creds.json');
    writeFileSync(credsPath, data);
    console.log('Saved credentials to', credsPath);
  } catch (error) {
    console.error('Error downloading or saving credentials:', error);
  }
}

export default processTxtAndSaveCredentials;
