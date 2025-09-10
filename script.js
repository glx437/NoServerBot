let lastRespondedMessageId = 0

function handleUpdate(update, sendMessage) {
    if (update.message && update.message.from && !update.message.from.is_bot) {
        const chatId = update.message.chat.id
        const messageId = update.message.message_id
        const text = update.message.text

        if (messageId <= lastRespondedMessageId) return

        lastRespondedMessageId = messageId

        if (text && text.toLowerCase() === "hello") {
            sendMessage(chatId, "Hello!")
        }
    }
}
