// Archivo: index.js (o el archivo principal de tu backend)

// Importar Firebase Admin SDK para interactuar con Firestore y Storage
const admin = require('firebase-admin');
// Importar la librería para manejar el bot de Telegram
const TelegramBot = require('node-telegram-bot-api');

// Inicializar Firebase Admin SDK usando las variables de entorno
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplazar los saltos de línea en la clave privada
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Inicializar el bot de Telegram usando el token desde la variable de entorno
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Ejemplo de manejo de mensajes recibidos por el bot
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hola, recibí tu mensaje');
});

// Puedes añadir lógica para subir imágenes a Firebase Storage cuando el bot las reciba, o cualquier otra funcionalidad
