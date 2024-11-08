let toM = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata }) {
  try {
    // Ensure the group has participants
    if (!groupMetadata.participants || groupMetadata.participants.length < 2) {
      return m.reply('Not enough participants to ship.')
    }

    let ps = groupMetadata.participants.map(v => v.id)
    let a = m.sender
    let b

    // Make sure b is not the same as a
    do {
      b = ps.getRandom()
    } while (b === a)

    // Send the shipping message
    m.reply(`${toM(a)} ❤️ ${toM(b)}\nCongratulations 💖🍻`, null, {
      mentions: [a, b]
    })

    console.log(`Shipped ${toM(a)} with ${toM(b)}`)
  } catch (error) {
    console.error(error)
    m.reply(`Error: ${error.message}`)
  }
}

handler.help = ['ship']
handler.tags = ['fun']
handler.command = ['ship']

handler.group = true

export default handler
