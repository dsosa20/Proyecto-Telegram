// public/app.js
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { app } from './src/firebase-config.js'; // Importa la instancia de Firebase

// Inicializa Firestore
const db = getFirestore(app);

// Referencia a la colección en Firestore
const photoGallery = document.getElementById('photo-gallery');
const photosRef = collection(db, 'alarm_photos');
const photosQuery = query(photosRef, orderBy('timestamp', 'desc'));

// Escucha los cambios en Firestore y actualiza la galería
onSnapshot(photosQuery, (snapshot) => {
  photoGallery.innerHTML = ''; // Limpiar la galería
  snapshot.forEach((doc) => {
    const photo = doc.data();
    const imgElement = document.createElement('img');
    imgElement.src = photo.url;
    photoGallery.appendChild(imgElement);
  });
});
