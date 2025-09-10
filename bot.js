(() => {
const params = new URLSearchParams(window.location.search)
const token = params.get("token") || ""
const externalJsUrl = params.get("url") || ""
const status = document.getElementById("status")
let lastUpdateId = 0
let lastRespondedMessageId = 0

if (!token) {
    console.error("Token missing in URL")
    return
}

if (!externalJsUrl) {
    console.error("External JS URL missing in URL")
    return
}

const script = document.createElement("script")
script.src = externalJsUrl
script.onload = () => console.log("External JS loaded successfully")
script.onerror = () => console.error("Failed to load external JS")
document.head.appendChild(script)

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
    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`)
        const data = await res.json()
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id
                const msg = update.message
                if (!msg || !msg.from || msg.from.is_bot) continue
                const chatId = msg.chat.id
                const messageId = msg.message_id
                if (messageId <= lastRespondedMessageId) continue
                lastRespondedMessageId = messageId
                if (typeof window.handleUpdate === "function") {
                    window.handleUpdate(update, sendMessage, sendFile)
                }
            }
        }
    } catch (e) {
        console.error("getUpdates error:", e)
    }
    if (status) {
        status.textContent = "Bot running"
        status.style.color = "green"
    }
}

setInterval(pollUpdates, 300)
})()
