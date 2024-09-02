import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { app } from './src/firebase-config.js'; // Importa la instancia de Firebase

// Inicializa Firestore
const db = getFirestore(app);

// Referencia a la colección en Firestore
const photoGallery = document.getElementById('photo-gallery');
const photosRef = collection(db, 'alarm_photos');
const photosQuery = query(photosRef, orderBy('createdAt', 'desc')); // Asegúrate de que 'createdAt' coincide con el nombre del campo en Firestore

// Escucha los cambios en Firestore y actualiza la galería
onSnapshot(photosQuery, (snapshot) => {
  photoGallery.innerHTML = ''; // Limpiar la galería
  snapshot.forEach((doc) => {
    const photo = doc.data();
    console.log('Photo data:', photo); // Verifica los datos recibidos
    if (photo.url) { // Usa el campo correcto
      const imgElement = document.createElement('img');
      imgElement.src = photo.url; // Usa `url` como fuente
      photoGallery.appendChild(imgElement);
    } else {
      console.error('No url found in document:', doc.id);
    }
  });
});