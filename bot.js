const status = document.getElementById("status")
let lastUpdateId = 0
let lastRespondedMessageId = 0
const token = new URLSearchParams(window.location.search).get("token") || ""

async function sendMessage(chatId, text) {
    if (!token) return
    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text })
        })
    } catch (err) {
        status.textContent = "Error sending message"
        status.style.color = "red"
    }
}

async function pollUpdates() {
    if (!token) return
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`)
        const data = await response.json()
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id
                if (update.message && update.message.from && !update.message.from.is_bot) {
                    const chatId = update.message.chat.id
                    const messageId = update.message.message_id
                    const text = update.message.text
                    if (messageId <= lastRespondedMessageId) continue
                    lastRespondedMessageId = messageId
                    if (text && typeof handleUpdate === "function") {
                        handleUpdate(update, sendMessage)
                    }
                }
            }
        }
        status.textContent = "Bot server running"
        status.style.color = "green"
    } catch (err) {
        status.textContent = "Polling error"
        status.style.color = "red"
    }
}

setInterval(pollUpdates, 500)
