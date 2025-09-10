function handleUpdate(update, sendMessage, sendFile) {
    const chatId = update.message.chat.id

    if (update.message.text) {
        const text = update.message.text
        sendMessage(chatId, `You said: "${text}"`)
    }

    if (update.message.photo) {
        const fileId = update.message.photo.slice(-1)[0].file_id
        sendFile(chatId, "photo", fileId, { caption: "Received your photo!" })
    }

    if (update.message.document) {
        const fileId = update.message.document.file_id
        sendFile(chatId, "document", fileId, { caption: "Received your document!" })
    }

    if (update.message.video) {
        const fileId = update.message.video.file_id
        sendFile(chatId, "video", fileId, { caption: "Received your video!" })
    }

    if (update.message.audio) {
        const fileId = update.message.audio.file_id
        sendFile(chatId, "audio", fileId, { caption: "Received your audio!" })
    }
}
