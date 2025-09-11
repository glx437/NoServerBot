const Bot = {
    lastMessageId: 0,
    lastUpdateId: 0,
    countRequest: 0,
    speedRequest: 0,
    requestCountInSecond: 0,
    lastTime: Date.now(),
    userId: null,
    chatId: null,
    token: null,
    statusEl: null,
    initialized: false,

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.statusEl = document.getElementById("status")
            this.setStatus("Bot initializing...", "orange")

            const params = new URLSearchParams(window.location.search)
            this.token = params.get("token") || ""
            const externalJsUrl = params.get("url") || ""

            if (!this.token) return this.error("Missing token in URL")
            if (!externalJsUrl) return this.error("Missing script URL in URL")

            this.loadExternalScript(externalJsUrl)
            this.initialized = true
            this.startPolling()
        })
    },

    setStatus(text, color = "black") {
        if (!this.statusEl) return
        this.statusEl.textContent = text
        this.statusEl.style.color = color
    },

    error(message) {
        this.setStatus(`Error: ${message}`, "red")
    },

    async send(message, targetChatId, options = {}) {
        if (!this.token) return
        let type = "text"
        let content = message

        if (message.text) {
            type = "text"
            content = message.text
        } else if (message.document) {
            type = "document"
            content = { file_id: message.document.file_id }
        } else if (message.photo && message.photo.length > 0) {
            type = "photo"
            content = { file_id: message.photo[message.photo.length - 1].file_id }
        } else if (message.video) {
            type = "video"
            content = { file_id: message.video.file_id }
        } else if (message.audio) {
            type = "audio"
            content = { file_id: message.audio.file_id }
        } else if (message.voice) {
            type = "voice"
            content = { file_id: message.voice.file_id }
        } else if (message.sticker) {
            type = "sticker"
            content = { file_id: message.sticker.file_id }
        } else if (message.video_note) {
            type = "videoNote"
            content = { file_id: message.video_note.file_id }
        } else {
            return
        }

        const payload = { chat_id: targetChatId, ...options }
        if (type === "text") payload.text = content
        else payload[type] = content.file_id || content

        const method = type === "text" ? "sendMessage" : "send" + type.charAt(0).toUpperCase() + type.slice(1)

        try {
            await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            this.setStatus(`Message sent to chat ${targetChatId}`, "green")
        } catch (e) {
            this.setStatus(`Error sending message: ${e.message}`, "red")
        }
    },

    async pollUpdates() {
        if (!this.token || !this.initialized) return
        this.countRequest++
        this.requestCountInSecond++

        try {
            const res = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=10`)
            const data = await res.json()
            if (!data.ok) return

            for (const update of data.result) {
                this.lastUpdateId = update.update_id
                const msg = update.message
                if (!msg || !msg.from || msg.from.is_bot) continue
                if (msg.message_id <= this.lastMessageId) continue

                this.lastMessageId = msg.message_id
                this.userId = msg.from.id
                this.chatId = msg.chat.id

                if (typeof window.handleUpdate === "function") {
                    window.handleUpdate(msg, this.send.bind(this))
                }
            }
        } catch (e) {
            this.setStatus(`Bot polling error: ${e.message}`, "red")
        }

        this.updateSpeed()
    },

    updateSpeed() {
        const now = Date.now()
        if (now - this.lastTime >= 1000) {
            this.speedRequest = this.requestCountInSecond
            this.requestCountInSecond = 0
            this.lastTime = now
            this.setStatus(`Bot running | Requests: ${this.countRequest} | Speed: ${this.speedRequest} req/s`, "green")
        }
    },

    startPolling() {
        const poll = async () => {
            await this.pollUpdates()
            setTimeout(poll, 100)
        }
        poll()
    },

    loadExternalScript(url) {
        const script = document.createElement("script")
        script.src = url
        script.async = false
        script.onload = () => {
            this.setStatus(`Bot and script loaded successfully | Requests: ${this.countRequest} | Speed: ${this.speedRequest} req/s`, "green")
        }
        script.onerror = (e) => {
            this.setStatus(`Failed to load external script: ${e.message || "unknown"}`, "red")
        }
        document.head.appendChild(script)
    },
}

Bot.init()
        
