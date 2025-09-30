const TELEGRAM_BOT_TOKEN = '8423861374:AAGKoa6nt6bLM9Yhmnb3DpVOW9krddHoVD0';
let lastProcessedUpdateId = 0;

async function processTelegramUpdates() {
    try {
        const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastProcessedUpdateId + 1}`);
        const updatesData = await updatesResponse.json();
        
        if (!updatesData.ok || !updatesData.result.length) {
            return 'No new messages';
        }

        let processedCount = 0;
        
        for (const update of updatesData.result) {
            if (update.message && update.message.text) {
                const userText = update.message.text;
                const chatId = update.message.chat.id;
                
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userText)}?width=512&height=512`;
                
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        photo: imageUrl,
                        caption: `Generated image for: "${userText}"`
                    })
                });
                
                processedCount++;
            }
            
            lastProcessedUpdateId = update.update_id;
        }
        
        return `Processed ${processedCount} messages`;
        
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function handleRequest() {
    const result = await processTelegramUpdates();
    
    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.textContent = `Result: ${result} | Last Update ID: ${lastProcessedUpdateId} | Time: ${new Date().toLocaleString()}`;
    }
    
    return result;
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        handleRequest();
    }, 1000);
});

window.runBot = handleRequest;
