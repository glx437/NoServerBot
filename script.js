function handleUpdate(update, sendMessage) {
    const chatId = update.message.chat.id
    const text = update.message.text.toLowerCase()

    if (text === "hello") {
        sendMessage(chatId, "Hello!")
    }

}
