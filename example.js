// script.js - يعيد إرسال أي رسالة واردة

// يجب أن تكون الدالة handleUpdate متاحة في window
window.handleUpdate = async function(update, send) {
    try {
        const message = update.message;
        if (!message || !message.text) return; // تجاهل الرسائل غير النصية

        const chatId = message.chat.id;
        const text = message.text;

        // إرسال نفس النص مرة أخرى
        await send(text, chatId);
        console.log(`Echoed message: "${text}" to chat ${chatId}`);
    } catch (e) {
        console.error("Error in handleUpdate:", e);
    }
};
