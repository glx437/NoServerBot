// كود JavaScript كامل للرد بالصورة مباشرة وليس الرابط
let lastUpdateId = 0;

async function processPendingMessages() {
    const botToken = '8423861374:AAGKoa6nt6bLM9Yhmnb3DpVOW9krddHoVD0'; // ضع توكن البوت هنا
    
    try {
        // جلب الرسائل الجديدة فقط
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}`);
        const data = await response.json();
        
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                if (update.message && update.message.text) {
                    const userText = update.message.text;
                    const chatId = update.message.chat.id;
                    
                    // إنشاء رابط الصورة
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(userText)}?width=512&height=512`;
                    
                    // إرسال الصورة مباشرة للمستخدم
                    await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo: imageUrl,
                            caption: `🖼️ الصورة المُنشأة للوصف: "${userText}"`,
                            reply_to_message_id: update.message.message_id
                        })
                    });
                }
                
                lastUpdateId = update.update_id;
            }
        }
        
        return `✅ تم معالجة ${data.result?.length || 0} رسالة`;
    } catch (error) {
        return `❌ خطأ: ${error.message}`;
    }
}

// دالة للاستخدام مع UptimeRobot
async function handleUptimePing() {
    const result = await processPendingMessages();
    console.log(result);
    return result;
}

// للتجربة الفورية - إلغاء التعليق للتجربة
// handleUptimePing();//set your webapp script
