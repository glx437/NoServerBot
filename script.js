const TELEGRAM_BOT_TOKEN = '8423861374:AAGKoa6nt6bLM9Yhmnb3DpVOW9krddHoVD0';
let lastProcessedUpdateId = 0;

async function processTelegramUpdates() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastProcessedUpdateId + 1}`);
        const data = await response.json();
        
        if (data.ok && data.result && data.result.length > 0) {
            const lastMessage = data.result[data.result.length - 1];
            
            if (lastMessage.message && lastMessage.message.text) {
                const userText = lastMessage.message.text;
                const chatId = lastMessage.message.chat.id;
                
                const imageUrl =
                `https://image.pollinations.ai/prompt/${encodeURIComponent(userText)}?width=720&height=720&nologo=true`;
                
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        chat_id: chatId,
                        photo: imageUrl
                    })
                });
                
                lastProcessedUpdateId = lastMessage.update_id;
            }
        }
    } catch (error) {
        // يتم التعامل مع الأخطاء بشكل صامت
    }
}

// التنفيذ الفوري
processTelegramUpdates();
