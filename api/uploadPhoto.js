const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')({ origin: true });

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
    console.log('Initializing Firebase Admin');
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin initialized');
}

const bucket = admin.storage().bucket();

module.exports = (req, res) => {
    console.log('uploadPhoto function called');

    // Manejar CORS
    return cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Verificar los datos de entrada
        const { photoUrl, telegramId } = req.body;
        console.log('Received data:', { photoUrl, telegramId });

        if (!photoUrl || !telegramId) {
            console.error('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            console.log('Attempting to download photo from URL:', photoUrl);

            // Descargar la foto desde la URL proporcionada
            const response = await fetch(photoUrl);
            const buffer = await response.buffer();

            // Crear un nombre único para la foto
            const fileName = `${telegramId}/${uuidv4()}.jpg`;
            console.log('Generated file name:', fileName);

            // Subir la foto a Firebase Storage
            const file = bucket.file(fileName);
            console.log('Attempting to upload file:', fileName);
            await file.save(buffer, {
                contentType: 'image/jpeg'
            });
            console.log('File uploaded successfully');

            // Obtener la URL pública de la foto
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });
            console.log('Generated signed URL:', url);

            // Guardar la URL en Firestore
            const db = admin.firestore();
            console.log('Attempting to write to Firestore');
            const docRef = await db.collection('alarm_photos').add({
                telegramId,
                photoUrl: url,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Document written with ID:', docRef.id);

            // Responder con éxito
            res.status(200).json({ 
                message: 'Photo uploaded successfully', 
                url,
                fileId: fileName,
                telegramId,
                firestoreDocId: docRef.id
            });
        } catch (error) {
            console.error('Detailed error:', error);
            res.status(500).json({ 
                error: 'Failed to upload photo', 
                details: error.message,
                stack: error.stack
            });
        }
    });
};
