window.handleUpdate = async function(message, send) {
    if (!message || !message.from || message.from.is_bot) return
    const chatId = message.chat.id
    await send(message, chatId)
}
