let handler = async (m, { conn, args }) => {
  try {
    // Get the list of mentioned users, or use the sender if no one is mentioned
    let users = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid : [m.sender]
    
    // Fetch names for each mentioned user
    let contacts = await Promise.all(users.map(async user => {
      let username = await conn.getName(user)
      if (!username) {
        throw new Error(`Unable to find contact information for user: ${user}`)
      }
      return [`${user.split`@`[0]}@s.whatsapp.net`, username]
    }))

    // Send contact information
    await conn.sendContact(m.chat, contacts, m)
    console.log('Contacts saved successfully:', contacts)
  } catch (error) {
    console.error(error)
    m.reply(`Error: ${error.message}`)
  }
}

handler.help = ['savecontact *@tag*']
handler.tags = ['tools']
handler.command = ['savecontact', 'save']
export default handler
