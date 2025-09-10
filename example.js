function initExternalBot(token) {
    window.handleUpdate = function(update, sendMessage, sendFile) {
        if (!update || !update.message) return
        const msg = update.message
        const chatId = msg.chat.id

        if (msg.text) {
            return sendMessage(chatId, msg.text)
        }

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

        if (msg.dice) {
            return sendFile(chatId, "sendDice", msg.dice.emoji || "🎲")
        }

        if (msg.poll) {
            return sendMessage(chatId, "Received a poll")
        }

        if (msg.location) {
            return sendMessage(chatId, `Location received: lat=${msg.location.latitude}, lon=${msg.location.longitude}`)
        }

        if (msg.contact) {
            const c = msg.contact
            return sendMessage(chatId, `Contact received: ${c.first_name || ""} ${c.last_name || ""}`)
        }

        if (msg.venue) {
            const v = msg.venue
            return sendMessage(chatId, `Venue received: ${v.title || ""}, ${v.address || ""}`)
        }
    }
}
