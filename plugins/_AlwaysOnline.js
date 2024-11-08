export async function before(m) {
  try {
    const chat = global.db.data.chats[m.chat]
    
    // Check if autotype feature is enabled
    if (!chat.autotype) return

    // Extract all commands from global plugins
    const commands = Object.values(global.plugins).flatMap(plugin => [].concat(plugin.command))
    
    // Determine presence status based on whether the message matches any command
    const presenceStatus = commands.some(cmd =>
      cmd instanceof RegExp ? cmd.test(m.text) : m.text.includes(cmd)
    ) ? 'composing' : 'available'
    
    // Update presence status if necessary
    if (presenceStatus) await this.sendPresenceUpdate(presenceStatus, m.chat)
    console.log(`Presence status updated to "${presenceStatus}" for chat ${m.chat}`)
  } catch (error) {
    console.error(`Error updating presence status: ${error.message}`)
  }
}

// Disable this feature by default
export const disabled = false
