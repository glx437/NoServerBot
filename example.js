window.handleUpdate = async function(message, BotInstance) {
    if (!message || !message.from || message.from.is_bot) return
    const chatId = message.chat.id
    await fetch(`https://api.telegram.org/bot${BotInstance.token}/forwardMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            from_chat_id: chatId,
            message_id: message.message_id
        })
    })
}
