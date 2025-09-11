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

    receive(message) {
        if (!message) return null
        if (message.text) return { type: "text", content: message.text }
        if (message.photo && message.photo.length > 0) return { type: "photo", content: message.photo[message.photo.length - 1].file_id }
        if (message.document) return { type: "document", content: message.document.file_id }
        if (message.video) return { type: "video", content: message.video.file_id }
        if (message.audio) return { type: "audio", content: message.audio.file_id }
        if (message.voice) return { type: "voice", content: message.voice.file_id }
        if (message.sticker) return { type: "sticker", content: message.sticker.file_id }
        if (message.video_note) return { type: "videoNote", content: message.video_note.file_id }
        return null
    },

    async send(file, targetChatId, options = {}) {
        if (!this.token || !file) return
        const payload = { chat_id: targetChatId, ...options }
        let method = "sendMessage"
        switch (file.type) {
            case "text":
                payload.text = file.content
                method = "sendMessage"
                break
            case "photo":
                payload.photo = file.content
                method = "sendPhoto"
                break
            case "document":
                payload.document = file.content
                method = "sendDocument"
                break
            case "video":
                payload.video = file.content
                method = "sendVideo"
                break
            case "audio":
                payload.audio = file.content
                method = "sendAudio"
                break
            case "voice":
                payload.voice = file.content
                method = "sendVoice"
                break
            case "sticker":
                payload.sticker = file.content
                method = "sendSticker"
                break
            case "videoNote":
                payload.video_note = file.content
                method = "sendVideoNote"
                break
            default:
                return
        }
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
            
