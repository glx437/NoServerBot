(() => {
const status = document.getElementById("status")
let lastUpdateId = 0
let lastRespondedMessageId = 0
const params = new URLSearchParams(window.location.search)
const token = params.get("token") || ""
const targetChatId = params.get("chat_id") || null

async function pollUpdates() {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`)
    const data = await response.json()
    if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
            lastUpdateId = update.update_id
            const msg = update.message
            if (!msg || !msg.from || msg.from.is_bot) continue
            const chatId = msg.chat.id
            if (targetChatId && String(chatId) !== targetChatId) continue
            const messageId = msg.message_id
            if (messageId <= lastRespondedMessageId) continue
            lastRespondedMessageId = messageId
            if (typeof handleUpdate === "function") {
                handleUpdate(update, sendMessage, sendFile)
            }
        }
    }
    status.textContent = "Bot server running"
    status.style.color = "green"
}

setInterval(pollUpdates, 500)
})()
