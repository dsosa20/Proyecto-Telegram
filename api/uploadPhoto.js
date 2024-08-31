const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Inicializar Firebase Admin si no está inicializado
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

const bucket = admin.storage().bucket();

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { photoUrl, telegramId } = req.body;
        
        try {
            // Descargar la foto desde la URL proporcionada
            const response = await fetch(photoUrl);
            const buffer = await response.buffer();

            // Crear un nombre único para la foto
            const fileName = `${telegramId}/${uuidv4()}.jpg`;

            // Subir la foto a Firebase Storage
            const file = bucket.file(fileName);
            await file.save(buffer, {
                contentType: 'image/jpeg'
            });

            // Obtener la URL pública de la foto
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });

            // Guardar la URL en Firestore
            const db = admin.firestore();
            await db.collection('alarm_photos').add({
                telegramId,
                photoUrl: url,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Responder con éxito
            res.status(200).json({ message: 'Photo uploaded successfully', url });
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).json({ error: 'Failed to upload photo' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
