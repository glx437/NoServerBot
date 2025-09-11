window.handleUpdate = async function(message, BotInstance) {
    if (!message || !message.from || message.from.is_bot) return
    const chatId = message.chat.id
    const file = BotInstance.type(message)
    await BotInstance.send(file, chatId)
}
