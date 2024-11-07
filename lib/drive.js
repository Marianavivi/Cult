import { join } from 'path';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { google } from 'googleapis';
import EventEmitter from 'events';
import dotenv from 'dotenv';

dotenv.config();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = join(__dirname, '..', 'token.json');

class GoogleAuth extends EventEmitter {
  constructor() {
    super();
  }

  async authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    try {
      const token = JSON.parse(await fs.readFile(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
    } catch (e) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      this.emit('auth', authUrl);
      const code = await promisify(this.once).bind(this)('token');
      const token = (await oAuth2Client.getToken(code)).tokens;
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
      oAuth2Client.setCredentials(token);
    }

    return oAuth2Client;
  }

  token(code) {
    this.emit('token', code);
  }
}

class GoogleDrive extends GoogleAuth {
  constructor() {
    super();
    this.path = '/drive/api';
    this.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  }

  async getAuthenticatedClient() {
    if (!this.oAuth2Client) {
      this.oAuth2Client = await this.authorize(this.credentials);
    }
    return this.oAuth2Client;
  }

  async getFolderID(folderName) {
    const auth = await this.getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (res.data.files.length === 0) {
      throw new Error('Folder not found');
    }

    return res.data.files[0].id;
  }

  async infoFile(fileId) {
    const auth = await this.getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
    });

    return res.data;
  }

  async folderList(folderId) {
    const auth = await this.getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    return res.data.files;
  }

  async downloadFile(fileId, destPath) {
    const auth = await this.getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });

    const dest = fs.createWriteStream(destPath);
    await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
      (err, res) => {
        if (err) throw err;
        res.data
          .on('end', () => {
            dest.close();
          })
          .on('error', (err) => {
            throw err;
          })
          .pipe(dest);
      }
    );
  }

  async uploadFile(filePath, folderId) {
    const auth = await this.getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folderId],
    };
    const media = {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(filePath),
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name',
    });

    return res.data;
  }
}

export { GoogleAuth, GoogleDrive };
