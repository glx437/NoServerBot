(() => {
if (!window.send) return

let step = 0
let userToken = ""
let userUrl = ""

window.handleUpdate = async (update, send) => {
    try {
        const msg = update.message
        if (!msg || !msg.text) return
        const chatId = msg.chat.id
        const text = msg.text.trim()

        if (step === 0 && text === "/create") {
            await send("Send your token:", chatId)
            step = 1
            return
        }

        if (step === 1) {
            userToken = text
            await send("Send your script URL:", chatId)
            step = 2
            return
        }

        if (step === 2) {
            userUrl = text
            const webAppLink = `https://www.domain/?token=${encodeURIComponent(userToken)}&url=${encodeURIComponent(userUrl)}`
            await send(`Success! Your WebApp link:\n${webAppLink}`, chatId)
            step = 0
            userToken = ""
            userUrl = ""
            return
        }
    } catch (e) {
        const chatId = update.message && update.message.chat && update.message.chat.id
        if (chatId) await send("error", chatId)
        console.error("script.js handleUpdate error:", e)
        step = 0
        userToken = ""
        userUrl = ""
    }
}
})()
