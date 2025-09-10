// ⚠️ Place your bot token here
const BOT_TOKEN = "8225623379:AAEJStUYeRBGCbPDVyQaj1040F7M-YIUCgw";

const sendBtn = document.getElementById("sendBtn");
const status = document.getElementById("status");

// Get chat_id automatically from Telegram WebApp
let chatId = null;

if (window.Telegram.WebApp) {
    chatId = Telegram.WebApp.initDataUnsafe.user.id;
} else {
    status.textContent = "Please open this WebApp inside Telegram only!";
}

sendBtn.addEventListener("click", async () => {
    if (!chatId) return;

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

        const data = await response.json();

        if (data.ok) {
            status.textContent = "Welcome message sent successfully!";
        } else {
            status.textContent = `Error: ${data.description}`;
        }
    } catch (err) {
        console.error(err);
        status.textContent = "An error occurred while sending the message.";
    }
});
