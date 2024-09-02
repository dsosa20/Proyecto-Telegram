import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { app } from './src/firebase-config.js'; // Importa la instancia de Firebase

// Inicializa Firestore
const db = getFirestore(app);

// Referencia a la colección en Firestore
const photoGallery = document.getElementById('photo-gallery');
if (!photoGallery) {
    console.error('Photo gallery element not found');
}

const photosRef = collection(db, 'alarm_photos');
const photosQuery = query(photosRef, orderBy('timestamp', 'desc')); // Cambiado de 'createdAt' a 'timestamp'

console.log('Setting up Firestore listener');

// Escucha los cambios en Firestore y actualiza la galería
onSnapshot(photosQuery, (snapshot) => {
    console.log('Snapshot received, document count:', snapshot.size);
    
    if (photoGallery) {
        photoGallery.innerHTML = ''; // Limpiar la galería
    }
    
    snapshot.forEach((doc) => {
        const photo = doc.data();
        console.log('Photo data:', photo);
        
        if (photo.url) {
            console.log('Creating image element for URL:', photo.url);
            const imgElement = document.createElement('img');
            imgElement.src = photo.url;
            imgElement.alt = 'Uploaded photo';
            imgElement.onerror = () => console.error('Failed to load image:', photo.url);
            imgElement.onload = () => console.log('Image loaded successfully:', photo.url);
            
            if (photoGallery) {
                photoGallery.appendChild(imgElement);
            } else {
                console.error('Photo gallery element not found when trying to append image');
            }
        } else {
            console.error('No URL found in document:', doc.id);
        }
    });
});

console.log('Firestore listener setup complete');