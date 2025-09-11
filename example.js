// script.js - إعادة إرسال أي رسالة كما هي

window.handleUpdate = async function(update, send) {
    const message = update.message;
    if (!message || !message.from || message.from.is_bot) return; // تجاهل رسائل البوت

    const chatId = message.chat.id;

    try {
        // إرسال كل رسالة كما هي باستخدام دالة send
        await send(message, chatId);
        console.log("Message echoed to chat", chatId);
    } catch (e) {
        console.error("Error echoing message:", e);
    }
};

