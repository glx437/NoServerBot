async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${new URLSearchParams(window.location.search).get("token")}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text })
    })
}

async function sendFile(chatId, fileType, fileIdOrUrl, options = {}) {
    const payload = { chat_id: chatId, [fileType]: fileIdOrUrl, ...options }
    await fetch(`https://api.telegram.org/bot${new URLSearchParams(window.location.search).get("token")}/send${fileType.charAt(0).toUpperCase() + fileType.slice(1)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
}

function handleUpdate(update, sendMessage, sendFile) {
    const msg = update.message
    if (!msg) return
    const chatId = msg.chat.id

    if (msg.text) return sendMessage(chatId, msg.text)

    const mediaMap = {
        photo: "photo",
        animation: "animation",
        video: "video",
        document: "document",
        audio: "audio",
        voice: "voice",
        sticker: "sticker",
        video_note: "video_note"
    }

    for (const key in mediaMap) {
        if (msg[key]) {
            const entry = Array.isArray(msg[key]) ? msg[key][msg[key].length - 1] : msg[key]
            return sendFile(chatId, mediaMap[key], entry.file_id)
        }
    }

    if (msg.contact) {
        const c = msg.contact
        return sendMessage(chatId, `Received contact: ${c.first_name || ""} ${c.last_name || ""}`)
    }

    if (msg.location) {
        const loc = msg.location
        return sendMessage(chatId, `Received location: lat=${loc.latitude}, lon=${loc.longitude}`)
    }
        }
