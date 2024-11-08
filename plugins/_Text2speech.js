import fetch from 'node-fetch'
import gtts from 'node-gtts'
import { readFileSync, unlinkSync } from 'fs'
import { join } from 'path'

const defaultLang = 'hi'

export async function before(m, { conn }) {
  try {
    if (m.isBaileys && m.fromMe) {
      return true
    }

    if (!m.isGroup) {
      return false
    }

    const users = global.db.data.users
    const chats = global.db.data.chats

    const user = users[m.sender]
    const chat = chats[m.chat]

    if (
      m.mtype === 'protocolMessage' ||
      m.mtype === 'pollUpdateMessage' ||
      m.mtype === 'reactionMessage' ||
      m.mtype === 'stickerMessage'
    ) {
      return
    }

    if (
      !m.msg ||
      !m.message ||
      m.key.remoteJid !== m.chat ||
      user.banned ||
      chat.isBanned
    ) {
      return
    }

    if (!m.quoted || !m.quoted.isBaileys) return
    if (!chat.jarvis) {
      return true
    }

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(m.text)}&lc=en&key=`,
    }

    const res = await fetch('https://api.simsimi.vn/v1/simtalk', options)
    const json = await res.json()

    let reply
    if (json.status === '200') {
      reply = json.message
    } else {
      throw new Error('Invalid response from SimSimi.')
    }

    let speech
    try {
      speech = await tts(reply, defaultLang)
    } catch (e) {
      m.reply(e.message)
      throw new Error('Error occurred during text-to-speech conversion.')
    } finally {
      if (speech) await conn.sendFile(m.chat, speech, 'tts.opus', null, m, true)
    }

    console.log(`Successfully processed message: ${m.text}`)
  } catch (error) {
    console.error(`Error in before handler: ${error.message}`)
    m.reply(`Error: ${error.message}`)
  }
}

function tts(text, lang = 'en') {
  return new Promise((resolve, reject) => {
    try {
      let tts = gtts(lang)
      let filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.wav`)
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath))
        unlinkSync(filePath)
      })
    } catch (e) {
      reject(e)
    }
  })
}
