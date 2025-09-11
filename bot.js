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

    if (!token || !externalJsUrl) {
        if (statusEl) {
            statusEl.textContent = "Bot initialization error: missing token or script URL"
            statusEl.style.color = "red"
        }
        return
    }

    const script = document.createElement("script")
    script.src = externalJsUrl
    script.async = true
    script.onload = () => console.log("External script loaded")
    script.onerror = () => {
        console.error("Failed to load external script")
        if (statusEl) {
            statusEl.textContent = "Failed to load external script"
            statusEl.style.color = "red"
        }
    }
    document.head.appendChild(script)

    async function send(file, targetChatId, options = {}) {
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

        if (!token) return

        await fetch(`https://api.telegram.org/bot${token}/${type === "text" ? "sendMessage" : "send" + type.charAt(0).toUpperCase() + type.slice(1)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
    }

    let lastUpdateId = 0
    async function pollUpdates() {
        countRequest++
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
                statusEl.textContent = "Bot polling error"
                statusEl.style.color = "red"
            }
        }
        speedRequest = Date.now() - start
        if (statusEl) {
            statusEl.textContent = `Bot running | Requests: ${countRequest} | Speed: ${speedRequest}ms`
            statusEl.style.color = "green"
        }
    }

    setInterval(pollUpdates, 300)
})
