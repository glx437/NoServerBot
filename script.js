function handleUpdate(update, sendMessage, sendPhoto) {
    const chatId = update.message.chat.id
    const text = update.message.text || ""
    const imageUrl = `https://picsum.photos/seed/${text}/400/300`
    sendPhoto(chatId, imageUrl, {
        caption: `Here is an image based on your message: "${text}"`
    })
}
