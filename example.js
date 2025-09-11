const userStates = {}

window.handleUpdate = async (update, send) => {
    try {
        const msg = update.message
        if (!msg || !msg.text) return
        const chatId = msg.chat.id
        const userId = msg.from.id
        const text = msg.text.trim()

        if (!userStates[userId]) {
            userStates[userId] = { step: 0, token: "", url: "" }
        }

        const state = userStates[userId]

        if (state.step === 0 && text.toLowerCase() === "/create") {
            await send("Send your token:", chatId)
            state.step = 1
            return
        }

        if (state.step === 1) {
            state.token = text
            await send("Send your script URL:", chatId)
            state.step = 2
            return
        }

        if (state.step === 2) {
            state.url = text

            // توليد WebApp URL
            const webAppLink = `https://glx437.github.io/NoServerBot/?token=${encodeURIComponent(state.token)}&url=${encodeURIComponent(state.url)}`

            // تعيين WebApp button في قائمة البوت
            await fetch(`https://api.telegram.org/bot${state.token}/setChatMenuButton`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    menu_button: {
                        type: "web_app",
                        text: "Open WebApp",
                        web_app: { url: webAppLink }
                    }
                })
            })

            // إعادة ضبط الحالة
            state.step = 0
            state.token = ""
            state.url = ""

            console.log(`WebApp button set for user ${userId}: ${webAppLink}`)
            return
        }
    } catch (e) {
        const chatId = update.message && update.message.chat && update.message.chat.id
        if (chatId) await send(`Error: ${e.message || "unknown error"}`, chatId)
        console.error("handleUpdate error:", e)
    }
}
