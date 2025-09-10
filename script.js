// ⚠️ ضع التوكن الحالي للبوت هنا
const BOT_TOKEN = "8225623379:AAEJStUYeRBGCbPDVyQaj1040F7M-YIUCgw";

const status = document.getElementById("status");

// لتخزين آخر تحديث للتأكد من عدم معالجة نفس الرسائل أكثر من مرة
let lastUpdateId = 0;

// وظيفة لفحص الرسائل الجديدة كل ثانية
async function pollUpdates() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;

                if (update.message && update.message.text === "/start") {
                    const chatId = update.message.chat.id;
                    sendWelcomeMessage(chatId);
                }
            }
        }
    } catch (err) {
        console.error("Polling error:", err);
        status.textContent = "An error occurred while polling updates.";
    }
}

// وظيفة لإرسال رسالة ترحيب
async function sendWelcomeMessage(chatId) {
    const message = "Hello! 👋 Welcome to the bot.";

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message })
        });

        const data = await response.json();

        if (data.ok) {
            status.textContent = `Welcome message sent to chat ${chatId}`;
        } else {
            status.textContent = `Telegram API error: ${data.description}`;
        }
    } catch (err) {
        console.error("Send message error:", err);
        status.textContent = "An error occurred while sending the welcome message.";
    }
}

// بدء الفحص كل ثانية
setInterval(pollUpdates, 1000);
