const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')({ origin: true });

console.log('Module loaded');

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
            console.log('Method not allowed:', req.method);
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { photoUrl, telegramId } = req.body;
        console.log('Received data:', { photoUrl, telegramId });

        // Verificar campos requeridos
        if (!photoUrl || !telegramId) {
            console.error('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            console.log('Attempting to fetch photo from URL');
            // Descargar la foto desde la URL proporcionada
            const response = await fetch(photoUrl);
            const buffer = await response.buffer();
            console.log('Photo fetched successfully');

            // Crear un nombre único para la foto
            const fileName = `${telegramId}/${uuidv4()}.jpg`;
            console.log('Generated file name:', fileName);

            console.log('Attempting to upload file to Firebase Storage');
            // Subir la foto a Firebase Storage
            const file = bucket.file(fileName);
            await file.save(buffer, {
                contentType: 'image/jpeg'
            });
            console.log('File uploaded successfully to Firebase Storage');

            console.log('Generating signed URL');
            // Obtener la URL pública de la foto
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });
            console.log('Generated signed URL:', url);

            if (!url) {
                throw new Error('Failed to generate signed URL');
            }

            console.log('Attempting to save to Firestore');
            // Guardar la URL en Firestore
            const db = admin.firestore();
            const docRef = await db.collection('alarm_photos').add({
                url: url,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                telegramId: telegramId
            });

            console.log('Data saved to Firestore, document ID:', docRef.id);

            // Verificar que los datos se guardaron correctamente
            const savedDoc = await docRef.get();
            console.log('Saved document data:', savedDoc.data());

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