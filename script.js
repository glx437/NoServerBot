// ⚠️ ضع التوكن الحالي للبوت هنا
const BOT_TOKEN = "8225623379:AAEJStUYeRBGCbPDVyQaj1040F7M-YIUCgw";

const sendBtn = document.getElementById("sendBtn");
const status = document.getElementById("status");

// الحصول على chat_id تلقائيًا من Telegram WebApp
let chatId = null;

if (window.Telegram.WebApp) {
    chatId = Telegram.WebApp.initDataUnsafe.user.id;
    console.log("Detected chat ID:", chatId);
} else {
    status.textContent = "Please open this WebApp inside Telegram only!";
}

sendBtn.addEventListener("click", async () => {
    if (!chatId) {
        status.textContent = "Cannot detect chat ID.";
        return;
    }

    const message = "Hello! 👋 This is a test welcome bot.";

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });

        // فحص HTTP response
        if (!response.ok) {
            status.textContent = `HTTP error: ${response.status} ${response.statusText}`;
            return;
        }

        const data = await response.json();

        if (data.ok) {
            status.textContent = "Welcome message sent successfully!";
        } else {
            // Telegram API returned an error
            status.textContent = `Telegram API error: ${data.description}`;
        }

    } catch (err) {
        // Network or JS error
        console.error("Fetch error:", err);
        status.textContent = "An unexpected error occurred while sending the message.";
    }
});
