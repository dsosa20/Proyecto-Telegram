const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')({ origin: true });

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

module.exports = (req, res) => {
    // Manejar CORS
    return cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { photoUrl, telegramId } = req.body;

        // Verificar campos requeridos
        if (!photoUrl || !telegramId) {
            console.error('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('Received request:', { photoUrl, telegramId });

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

            console.log('Photo uploaded to Storage');

            // Obtener la URL pública de la foto
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });

            console.log('Generated signed URL:', url);

            // Guardar la URL en Firestore
            const db = admin.firestore();
            const docRef = await db.collection('alarm_photos').add({
                telegramId,
                photoUrl: url,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log('Data saved to Firestore, document ID:', docRef.id);

            // Responder con éxito
            res.status(200).json({ 
                message: 'Photo uploaded successfully', 
                url,
                fileId: fileName,
                telegramId,
                firestoreDocId: docRef.id
            });
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).json({ 
                error: 'Failed to upload photo', 
                details: error.message 
            });
        }
    });
};