const BOT_TOKEN = "8225623379:AAEJStUYeRBGCbPDVyQaj1040F7M-YIUCgw"
const status = document.getElementById("status")
let lastUpdateId = 0
let chatId = 0

async function sendMessage(chatId, text) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text })
        })
        const data = await response.json()
        if (!data.ok) {
            status.textContent = `Telegram API error: ${data.description}`
            status.style.color = "red"
        }
    } catch (err) {
        status.textContent = "Error sending message"
        status.style.color = "red"
    }
}

async function pollUpdates() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`)
        const data = await response.json()
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id
                if (typeof handleUpdate === "function") handleUpdate(update, sendMessage)
            }
        }
        status.textContent = "Bot server running"
        status.style.color = "green"
    } catch (err) {
        status.textContent = "Polling error"
        status.style.color = "red"
    }
}

window.addEventListener("load", () => {
    if (window.Telegram.WebApp) {
        chatId = Telegram.WebApp.initDataUnsafe.user.id
        sendMessage(chatId, "bot status: On")
    }
})

window.addEventListener("beforeunload", () => {
    if (chatId) sendMessage(chatId, "bot status: Off")
})

setInterval(pollUpdates, 500)
