(() => {
const status = document.getElementById("status")
let lastUpdateId = 0
let lastRespondedMessageId = 0
const token = new URLSearchParams(window.location.search).get("token") || ""

async function sendMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text })
    })
}

async function sendFile(chatId, fileType, fileIdOrUrl, options = {}) {
    const payload = { chat_id: chatId, [fileType]: fileIdOrUrl, ...options }
    await fetch(`https://api.telegram.org/bot${token}/send${fileType.charAt(0).toUpperCase() + fileType.slice(1)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
}

async function pollUpdates() {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`)
    const data = await response.json()
    if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
            lastUpdateId = update.update_id
            if (update.message && update.message.from && !update.message.from.is_bot) {
                const chatId = update.message.chat.id
                const messageId = update.message.message_id
                if (messageId <= lastRespondedMessageId) continue
                lastRespondedMessageId = messageId
                if (typeof handleUpdate === "function") {
                    handleUpdate(update, sendMessage, sendFile)
                }
            }
        }
    }
    status.textContent = "Bot server running"
    status.style.color = "green"
}

setInterval(pollUpdates, 500)
})()
