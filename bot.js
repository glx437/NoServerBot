// bot.js - نسخة محسنة ومنظمة
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
            this.statusEl = document.getElementById("status");
            this.setStatus("Bot initializing...", "orange");

            const params = new URLSearchParams(window.location.search);
            this.token = params.get("token") || "";
            const externalJsUrl = params.get("url") || "";

            if (!this.token) return this.error("Missing token in URL");
            if (!externalJsUrl) return this.error("Missing script URL in URL");

            this.loadExternalScript(externalJsUrl);
            this.initialized = true;
            this.startPolling();
        });
    },

    setStatus(text, color = "black") {
        if (!this.statusEl) return;
        this.statusEl.textContent = text;
        this.statusEl.style.color = color;
    },

    error(message) {
        console.error(message);
        this.setStatus(`Error: ${message}`, "red");
    },

    async send(content, targetChatId, options = {}) {
        if (!this.token) return;
        let type = "text";

        if (typeof content === "string") {
            if (content.startsWith("http") || content.startsWith("data:")) type = "document";
        } else if (content && content.fileType) {
            type = content.fileType;
            content = content.file_id || content;
        } else if (content && content.file_id) type = "document";

        const payload = { chat_id: targetChatId, ...options };
        if (type === "text") payload.text = content;
        else payload[type] = content;

        const method = type === "text" ? "sendMessage" : "send" + type.charAt(0).toUpperCase() + type.slice(1);

        try {
            await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (e) {
            console.error("Send error:", e);
            this.setStatus("Error sending message", "red");
        }
    },

    async pollUpdates() {
        if (!this.token || !this.initialized) return;

        this.countRequest++;
        this.requestCountInSecond++;

        try {
            const res = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=10`);
            const data = await res.json();
            if (!data.ok) return;

            for (const update of data.result) {
                this.lastUpdateId = update.update_id;
                const msg = update.message;
                if (!msg || !msg.from || msg.from.is_bot) continue;
                if (msg.message_id <= this.lastMessageId) continue;

                this.lastMessageId = msg.message_id;
                this.userId = msg.from.id;
                this.chatId = msg.chat.id;

                if (typeof window.handleUpdate === "function") {
                    window.handleUpdate(update, this.send.bind(this));
                }
            }
        } catch (e) {
            console.error("getUpdates error:", e);
            this.setStatus(`Bot polling error: ${e.message}`, "red");
        }

        this.updateSpeed();
    },

    updateSpeed() {
        const now = Date.now();
        if (now - this.lastTime >= 1000) {
            this.speedRequest = this.requestCountInSecond;
            this.requestCountInSecond = 0;
            this.lastTime = now;
            this.setStatus(`Bot running | Requests: ${this.countRequest} | Speed: ${this.speedRequest} req/s`, "green");
        }
    },

    startPolling() {
        const poll = async () => {
            await this.pollUpdates();
            // استخدم long polling بدلاً من interval ثابت
            setTimeout(poll, 100); // تأخير قصير لتخفيف الضغط على المتصفح
        };
        poll();
    },

    loadExternalScript(url) {
        const script = document.createElement("script");
        script.src = url;
        script.async = false;
        script.onload = () => {
            console.log("External script loaded");
            this.setStatus(`Bot and script loaded successfully | Requests: ${this.countRequest} | Speed: ${this.speedRequest} req/s`, "green");
        };
        script.onerror = (e) => {
            console.error("Failed to load external script", e);
            this.setStatus(`Failed to load external script: ${e.message || "unknown"}`, "red");
        };
        document.head.appendChild(script);
    },
};

Bot.init();
