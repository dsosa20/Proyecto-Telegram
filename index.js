const admin = require('firebase-admin');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    
    try {
        // Descargar la foto de Telegram
        const file = await bot.getFile(fileId);
        const filePath = file.file_path;
        const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
        
        // Cargar la imagen a Firebase Storage
        const imageBuffer = await fetch(url).then(res => res.buffer());
        const fileName = `images/${fileId}.jpg`;
        const fileRef = bucket.file(fileName);
        await fileRef.save(imageBuffer);
        const downloadURL = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;
        
        // Guardar la URL en Firestore
        await db.collection('alarm_photos').add({
            url: downloadURL,
            timestamp: admin.firestore.Timestamp.now(),
        });

        bot.sendMessage(chatId, 'Foto subida exitosamente!');
    } catch (error) {
        bot.sendMessage(chatId, 'Ocurrió un error al subir la foto.');
        console.error('Error handling photo:', error);
    }
});
