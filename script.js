function handleUpdate(update, sendMessage, sendFile) {
    const chatId = update.message.chat.id
    const text = update.message.text || ""
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(text)}/400/300`
    sendFile(chatId, "photo", imageUrl, { caption: `Generated for: "${text}"` })
}
