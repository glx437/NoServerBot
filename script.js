const TELEGRAM_BOT_TOKEN = '8423861374:AAGKoa6nt6bLM9Yhmnb3DpVOW9krddHoVD0';
let lastProcessedUpdateId = 0;

// تنفيذ فوري بدون أي تأخير
async function processTelegramUpdates() {
    console.log('🔍 Checking for new messages...');
    
    try {
        const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastProcessedUpdateId + 1}`);
        const updatesData = await updatesResponse.json();
        
        if (!updatesData.ok) {
            console.error('❌ Telegram API error:', updatesData);
            return;
        }
        
        if (!updatesData.result || updatesData.result.length === 0) {
            console.log('✅ No new messages');
            return;
        }

        console.log(`📨 Processing ${updatesData.result.length} messages`);
        
        // معالجة جميع الرسائل بشكل متوازي (أسرع)
        const processingPromises = updatesData.result.map(async (update) => {
            if (update.message && update.message.text) {
                const userText = update.message.text;
                const chatId = update.message.chat.id;
                
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userText)}?width=720&height=720&nologo=true`;
                
                try {
                    const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo: imageUrl,
                            caption: `Generated image for: "${userText}"`
                        })
                    });
                    
                    const sendResult = await sendResponse.json();
                    
                    if (sendResult.ok) {
                        console.log(`✅ Sent to ${chatId}`);
                    } else {
                        console.error(`❌ Failed: ${sendResult.description}`);
                    }
                } catch (error) {
                    console.error(`❌ Send error: ${error}`);
                }
            }
            
            lastProcessedUpdateId = update.update_id;
        });

        await Promise.all(processingPromises);
        console.log(`✅ All messages processed. Last ID: ${lastProcessedUpdateId}`);
        
    } catch (error) {
        console.error('💥 Critical error:', error);
    }
}

// تنفيذ فوري عند تحميل السكريبت - بدون انتظار DOM
(async function() {
    console.log('🚀 Bot starting immediately...');
    await processTelegramUpdates();
    console.log('🏁 Bot execution completed');
})();

// للاستدعاء اليدوي إذا لزم الأمر
window.runBot = processTelegramUpdates;
