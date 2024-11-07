import { readFileSync, writeFileSync, existsSync } from 'fs';
import { initAuthCreds, BufferJSON, proto } from '@whiskeysockets/baileys';

/**
 * Binds event handlers to the WhatsApp connection to manage contacts, groups, and chats.
 * @param {import('@whiskeysockets/baileys').WASocket | import('@whiskeysockets/baileys').WALegacySocket} conn - The WhatsApp connection instance.
 */
function bind(conn) {
  if (!conn.chats) conn.chats = {};

  /**
   * Updates the local database with contact information.
   * @param {import('@whiskeysockets/baileys').Contact[] | {contacts: import('@whiskeysockets/baileys').Contact[]}} contacts - The contacts to update.
   */
  function updateNameToDb(contacts) {
    if (!contacts) return;
    contacts = contacts.contacts || contacts;
    for (const contact of contacts) {
      const id = conn.decodeJid(contact.id);
      if (!id || id === 'status@broadcast') continue;
      let chats = conn.chats[id];
      if (!chats) chats = conn.chats[id] = { ...contact, id };
      conn.chats[id] = {
        ...chats,
        ...{
          ...contact,
          id,
          ...(id.endsWith('@g.us')
            ? { subject: contact.subject || contact.name || chats.subject || '' }
            : { name: contact.notify || contact.name || chats.name || chats.notify || '' }),
        },
      };
    }
  }

  // Event handlers for various updates
  conn.ev.on('contacts.upsert', updateNameToDb);
  conn.ev.on('groups.update', updateNameToDb);
  conn.ev.on('contacts.set', updateNameToDb);

  conn.ev.on('chats.set', async ({ chats }) => {
    try {
      for (let { id, name, readOnly } of chats) {
        id = conn.decodeJid(id);
        if (!id || id === 'status@broadcast') continue;
        const isGroup = id.endsWith('@g.us');
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = { id };
        chats.isChats = !readOnly;
        if (name) chats[isGroup ? 'subject' : 'name'] = name;
        if (isGroup) {
          const metadata = await conn.groupMetadata(id).catch(_ => null);
          if (name || metadata?.subject) chats.subject = name || metadata.subject;
          if (!metadata) continue;
          chats.metadata = metadata;
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (!id) return;
    id = conn.decodeJid(id);
    if (id === 'status@broadcast') return;
    if (!(id in conn.chats)) conn.chats[id] = { id };
    let chats = conn.chats[id];
    chats.isChats = true;
    const groupMetadata = await conn.groupMetadata(id).catch(_ => null);
    if (!groupMetadata) return;
    chats.subject = groupMetadata.subject;
    chats.metadata = groupMetadata;
  });

  conn.ev.on('groups.update', async (groupsUpdates) => {
    try {
      for (const update of groupsUpdates) {
        const id = conn.decodeJid(update.id);
        if (!id || id === 'status@broadcast') continue;
        const isGroup = id.endsWith('@g.us');
        if (!isGroup) continue;
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = { id };
        chats.isChats = true;
        const metadata = await conn.groupMetadata(id).catch(_ => null);
        if (metadata) chats.metadata = metadata;
        if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject;
      }
    } catch (e) {
      console.error(e);
    }
  });

  conn.ev.on('chats.upsert', (chatsUpsert) => {
    try {
      const { id, name } = chatsUpsert;
      if (!id || id === 'status@broadcast') return;
      conn.chats[id] = { ...(conn.chats[id] || {}), ...chatsUpsert, isChats: true };
      const isGroup = id.endsWith('@g.us');
      if (isGroup) conn.insertAllGroup().catch(_ => null);
    } catch (e) {
      console.error(e);
    }
  });

  conn.ev.on('presence.update', async ({ id, presences }) => {
    try {
      const sender = Object.keys(presences)[0] || id;
      const _sender = conn.decodeJid(sender);
      const presence = presences[sender]['lastKnownPresence'] || 'composing';
      let chats = conn.chats[_sender];
      if (!chats) chats = conn.chats[_sender] = { id: sender };
      chats.presences = presence;
      if (id.endsWith('@g.us')) {
        let chats = conn.chats[id];
        if (!chats) chats = conn.chats[id] = { id };
      }
    } catch (e) {
      console.error(e);
    }
  });
}

const KEY_MAP = {
  'pre-key': 'preKeys',
  session: 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory',
};

/**
 * Manages authentication state using a single file.
 * @param {String} filename - The filename to save the authentication state.
 * @param {import('pino').Logger} logger - The logger for logging purposes.
 * @returns {Object} The authentication state and saveState function.
 */
function useSingleFileAuthState(filename, logger) {
  let creds, keys = {}, saveCount = 0;

  const saveState = (forceSave) => {
    logger?.trace('saving auth state');
    saveCount++;
    if (forceSave || saveCount > 5) {
      writeFileSync(
        filename,
        JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
      );
      saveCount = 0;
    }
  };

  if (existsSync(filename)) {
    const result = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }), BufferJSON.reviver);
    creds = result.creds;
    keys = result.keys;
  } else {
    creds = initAuthCreds();
    keys = {};
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type];
          return ids.reduce((dict, id) => {
            let value = keys[key]?.[id];
            if (value) {
              if (type === 'app-state-sync-key') {
                value = proto.AppStateSyncKeyData.fromObject(value);
              }
              dict[id] = value;
            }
            return dict;
          }, {});
        },
        set: (data) => {
          for (const _key in data) {
            const key = KEY_MAP[_key];
            keys[key] = keys[key] || {};
            Object.assign(keys[key], data[_key]);
          }
          saveState();
        },
      },
    },
    saveState,
  };
}

export default {
  bind,
  useSingleFileAuthState,
};
