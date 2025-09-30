const TELEGRAM_BOT_TOKEN = '8423861374:AAGKoa6nt6bLM9Yhmnb3DpVOW9krddHoVD0';
let lastProcessedUpdateId = 0;

async function processTelegramUpdates() {
    console.log('🔍 Checking for new messages...');
    
    try {
        const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastProcessedUpdateId + 1}`);
        const updatesData = await updatesResponse.json();
        
        console.log('Telegram API Response:', updatesData);
        
        if (!updatesData.ok) {
            console.error('❌ Telegram API error:', updatesData);
            return 'Telegram API error';
        }
        
        if (!updatesData.result || updatesData.result.length === 0) {
            console.log('✅ No new messages found');
            return 'No new messages';
        }

        console.log(`📨 Found ${updatesData.result.length} new messages`);
        let processedCount = 0;
        let failedCount = 0;
        
        for (const update of updatesData.result) {
            console.log('Processing update:', update);
            
            if (update.message && update.message.text) {
                const userText = update.message.text;
                const chatId = update.message.chat.id;
                const messageId = update.message.message_id;
                
                console.log(`🔄 Processing message from ${chatId}: "${userText}"`);
                
                try {
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userText)}?width=720&height=720&nologo=true`;
                    
                    console.log(`🖼️ Generated image URL: ${imageUrl}`);
                    
                    const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo: imageUrl,
                            caption: `Generated image for: "${userText}"`,
                            reply_to_message_id: messageId
                        })
                    });
                    
                    const sendResult = await sendResponse.json();
                    console.log('Send photo response:', sendResult);
                    
                    if (sendResult.ok) {
                        console.log(`✅ Successfully sent image to ${chatId}`);
                        processedCount++;
                    } else {
                        console.error(`❌ Failed to send image to ${chatId}:`, sendResult.description);
                        failedCount++;
                    }
                    
                } catch (sendError) {
                    console.error(`❌ Error sending photo to ${chatId}:`, sendError);
                    failedCount++;
                }
            } else {
                console.log('⚠️ Update does not contain text message:', update);
            }
            
            lastProcessedUpdateId = update.update_id;
            console.log(`📝 Updated lastProcessedUpdateId to: ${lastProcessedUpdateId}`);
        }
        
        const resultMessage = `Processed: ${processedCount} | Failed: ${failedCount} | Total: ${updatesData.result.length}`;
        console.log(`📊 Final result: ${resultMessage}`);
        return resultMessage;
        
    } catch (error) {
        console.error('💥 Critical error in processTelegramUpdates:', error);
        return `Critical error: ${error.message}`;
    }
}

async function handleRequest() {
    console.log('🚀 Starting bot request handler...');
    const result = await processTelegramUpdates();
    
    console.log('🏁 Request handling completed:', result);
    
    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.textContent = `Result: ${result} | Last ID: ${lastProcessedUpdateId} | Time: ${new Date().toLocaleString()}`;
    }
    
    return result;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, starting bot...');
    setTimeout(() => {
        handleRequest();
    }, 1000);
});

window.runBot = handleRequest;
window.getBotStatus = () => {
    return {
        lastProcessedUpdateId,
        lastRun: new Date().toLocaleString()
    };
};

console.log('🤖 Telegram bot script loaded successfully');
