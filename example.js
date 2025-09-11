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
            const webAppLink = `https://www.domain/?token=${encodeURIComponent(state.token)}&url=${encodeURIComponent(state.url)}`
            await send(`Success! Your WebApp link:\n${webAppLink}`, chatId)
            state.step = 0
            state.token = ""
            state.url = ""
            return
        }
    } catch (e) {
        const chatId = update.message && update.message.chat && update.message.chat.id
        if (chatId) await send(`Error: ${e.message || "unknown error"}`, chatId)
        console.error("handleUpdate error:", e)
    }
}
