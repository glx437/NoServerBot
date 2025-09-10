function handleUpdate(update) {
    if (!update.message) return

    const chatId = update.message.chat.id

    // Forward text
    if (update.message.text) {
        sendMessage(chatId, update.message.text)
    }

    // Forward photo
    if (update.message.photo) {
        const fileId = update.message.photo.slice(-1)[0].file_id
        sendPhoto(chatId, fileId)
    }

    // Forward document
    if (update.message.document) {
        const fileId = update.message.document.file_id
        sendDocument(chatId, fileId)
    }

    // Forward audio
    if (update.message.audio) {
        const fileId = update.message.audio.file_id
        sendAudio(chatId, fileId)
    }

    // Forward video
    if (update.message.video) {
        const fileId = update.message.video.file_id
        sendVideo(chatId, fileId)
    }

    // Forward voice
    if (update.message.voice) {
        const fileId = update.message.voice.file_id
        sendVoice(chatId, fileId)
    }

    // Stickers
    if (update.message.sticker) {
        const fileId = update.message.sticker.file_id
        sendSticker(chatId, fileId)
    }
}

function sendMessage(chatId, text) {
    fetch(`${apiUrl}sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text })
    })
}

function sendPhoto(chatId, fileId) {
    fetch(`${apiUrl}sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo: fileId })
    })
}

function sendDocument(chatId, fileId) {
    fetch(`${apiUrl}sendDocument`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, document: fileId })
    })
}

function sendAudio(chatId, fileId) {
    fetch(`${apiUrl}sendAudio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, audio: fileId })
    })
}

function sendVideo(chatId, fileId) {
    fetch(`${apiUrl}sendVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, video: fileId })
    })
}

function sendVoice(chatId, fileId) {
    fetch(`${apiUrl}sendVoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, voice: fileId })
    })
}

function sendSticker(chatId, fileId) {
    fetch(`${apiUrl}sendSticker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, sticker: fileId })
    })
}
