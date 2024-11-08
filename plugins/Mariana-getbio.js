let handler = async (m, { conn, text, command }) => {
  try {
    let who

    // Determine the user whose bio to fetch
    if (m.isGroup) {
      who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    } else {
      who = m.quoted ? m.quoted.sender : m.sender
    }

    // Fetch and reply with the user's bio/status
    let bio = await conn.fetchStatus(who)
    m.reply(bio.status)

  } catch (error) {
    console.error(error)
    if (error.message === 'bio is private!') {
      m.reply('The bio is private or cannot be accessed.')
    } else {
      try {
        // Retry fetching the sender's bio if an error occurs
        let who = m.quoted ? m.quoted.sender : m.sender
        let bio = await conn.fetchStatus(who)
        m.reply(bio.status)
      } catch (retryError) {
        console.error(retryError)
        m.reply('The bio is private or cannot be accessed.')
      }
    }
  }
}

handler.help = ['getbio <@tag/reply>']
handler.tags = ['group']
handler.command = /^(getb?io)$/i
handler.limit = true

export default handler
