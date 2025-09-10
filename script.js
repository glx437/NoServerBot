function handleUpdate(update, sendMessage) {
    if (update.message && update.message.from && !update.message.from.is_bot) {
        const chatId = update.message.chat.id
        const text = update.message.text
        if (text && text.toLowerCase() === "hello") sendMessage(chatId, "Hello!")
    }
}
