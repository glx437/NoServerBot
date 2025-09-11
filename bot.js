let lastMessageId = 0
let countRequest = 0
let speedRequest = 0
let userId = null
let chatId = null
let AdminId = null
let token = null

document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status")
    if (statusEl) {
        statusEl.textContent = "Bot initializing..."
        statusEl.style.color = "orange"
    }

    const params = new URLSearchParams(window.location.search)
    token = params.get("token") || ""
    const externalJsUrl = params.get("url") || ""

    if (!token) {
        if (statusEl) {
            statusEl.textContent = "Error: missing token"
            statusEl.style.color = "red"
        }
        console.error("Missing token in URL")
        return
    }

    if (!externalJsUrl) {
        if (statusEl) {
            statusEl.textContent = "Error: missing script URL"
            statusEl.style.color = "red"
        }
        console.error("Missing script URL in URL")
        return
    }

    async function send(file, targetChatId, options = {}) {
        if (!token) return
        let type = "text"
        if (typeof file === "string") {
            if (file.startsWith("http") || file.startsWith("data:")) type = "document"
        } else if (file && file.fileType) {
            type = file.fileType
            file = file.file_id || file
        } else if (file && file.file_id) type = "document"

        const payload = { chat_id: targetChatId, ...options }
        if (type === "text") payload.text = file
        else payload[type] = file

        try {
            await fetch(`https://api.telegram.org/bot${token}/${type === "text" ? "sendMessage" : "send" + type.charAt(0).toUpperCase() + type.slice(1)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        } catch (e) {
            console.error("Send error:", e)
            if (statusEl) {
                statusEl.textContent = "Error sending message"
                statusEl.style.color = "red"
            }
        }
    }

    let lastUpdateId = 0
    let lastTime = Date.now()
    let requestCountInSecond = 0

    async function pollUpdates() {
        if (!token) return
        countRequest++
        requestCountInSecond++
        const start = Date.now()
        try {
            const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`)
            const data = await res.json()
            if (!data.ok) return
            for (const update of data.result) {
                lastUpdateId = update.update_id
                const msg = update.message
                if (!msg || !msg.from || msg.from.is_bot) continue
                userId = msg.from.id
                chatId = msg.chat.id
                if (msg.message_id <= lastMessageId) continue
                lastMessageId = msg.message_id
                if (typeof window.handleUpdate === "function") {
                    window.handleUpdate(update, send)
                }
            }
        } catch (e) {
            console.error("getUpdates error", e)
            if (statusEl) {
                statusEl.textContent = `Bot polling error: ${e.message}`
                statusEl.style.color = "red"
            }
        }
        const now = Date.now()
        if (now - lastTime >= 1000) {
            speedRequest = requestCountInSecond
            requestCountInSecond = 0
            lastTime = now
        }
        if (statusEl) {
            statusEl.textContent = `Bot running | Requests: ${countRequest} | Speed: ${speedRequest} req/s`
            statusEl.style.color = "green"
        }
    }

    setInterval(pollUpdates, 300)

    // تحميل script.js بعد جاهزية bot.js
    const script = document.createElement("script")
    script.src = externalJsUrl
    script.async = false
    script.onload = () => {
        console.log("External script loaded")
        if (statusEl) {
            statusEl.textContent = `Bot and script loaded successfully | Requests: ${countRequest} | Speed: ${speedRequest} req/s`
            statusEl.style.color = "green"
        }
    }
    script.onerror = (e) => {
        console.error("Failed to load external script", e)
        if (statusEl) {
            statusEl.textContent = `Failed to load external script: ${e.message || "unknown"}`
            statusEl.style.color = "red"
        }
    }
    document.head.appendChild(script)
})
