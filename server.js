
const BOT_TOKEN = "8225623379:AAEJStUYeRBGCbPDVyQaj1040F7M-YIUCgw";
const status = document.getElementById("status");

let lastUpdateId = 0;
async function sendBotStatusMessage(text) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: YOUR_CHAT_ID, text })
        });

        const data = await response.json();

        if (data.ok) {
            status.textContent = `Status: ${text}`;
            status.style.color = "green";
        } else {
            status.textContent = `Telegram API error: ${data.description}`;
            status.style.color = "red";
        }
    } catch (err) {
        console.error("Send message error:", err);
        status.textContent = "Error sending bot status message.";
        status.style.color = "red";
    }
}
async function pollUpdates() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;
            }
        }

        status.textContent = "Bot server running...";
        status.style.color = "green";
    } catch (err) {
        console.error("Polling error:", err);
        status.textContent = "Polling error occurred.";
        status.style.color = "red";
    }
}
window.addEventListener("load", () => {
    sendBotStatusMessage("bot server: On");
});
window.addEventListener("beforeunload", () => {
    sendBotStatusMessage("bot server: Off");
});
setInterval(pollUpdates, 1000);
            
