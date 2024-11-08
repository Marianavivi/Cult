import fs from 'fs'
import syntaxError from 'syntax-error'
import path from 'path'
import util from 'util'

const _fs = fs.promises

let handler = async (m, { text, usedPrefix, command, __dirname }) => {
  if (!text) throw} <name file>
Contoh: ${usedPrefix}savefile lazack.js
        ${usedPrefix}saveplugin owner
`.trim()
  if (!m.quoted) throw `Balas/quote media/text yang ingin disimpan`

  const filename = text.replace(/plugin(s)\//i, '') + (/\.js$/i.test(text) ? '' : '.js')
  const filePath = path.join(__dirname, filename)

  if (/p(lugin)?/i.test(command)) {
    const error = syntaxError(m.quoted.text, filename, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    })
    if (error) throw error

    if (fs.existsSync(filePath)) {
      // Add logic to confirm if file should be overwritten
      return m.reply(`File ${filename} already exists. Overwrite? Use: ${usedPrefix}${command} <name file> overwrite`)
    }

    await _fs.writeFile(filePath, m.quoted.text)
    m.reply(`
Successfully saved to *${filename}*

\`\`\`
${util.format(m.quoted.text)}
\`\`\`
`.trim())

  } else {
    const isJavascript = m.quoted.text && !m.quoted.mediaMessage && /\.js/.test(text)
    if (isJavascript) {
      const error = syntaxError(m.quoted.text, text, {
        sourceType: 'module',
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true
      })
      if (error) throw error

      if (fs.existsSync(filePath)) {
        return m.reply(`File ${text} already exists. Overwrite? Use: ${usedPrefix}${command} <name file> overwrite`)
      }

      await _fs.writeFile(text, m.quoted.text)
      m.reply(`
Successfully saved to *${text}*

\`\`\`
${util.format(m.quoted.text)}
\`\`\`
`.trim())
    } else if (m.quoted.mediaMessage) {
      const media = await m.quoted.download()
      await _fs.writeFile(text, media)
      m.reply(`
Successfully saved media to *${text}*
`.trim())
    } else {
      throw 'Not supported!!'
    }
  }
}

handler.help = ['plugin', 'file'].map(v => `save${v} <name file>`)
handler.tags = ['owner']
handler.command = /^(save|s)(p(lugin)?|(f(ile)?))$/i

handler.rowner = true

export default handler
