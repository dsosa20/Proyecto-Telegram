import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Inicializa Firestore
const db = getFirestore();

// Referencia a la colección en Firestore
const photoGallery = document.getElementById('photo-gallery');
const photosRef = collection(db, 'alarm_photos');
const photosQuery = query(photosRef, orderBy('timestamp', 'desc'));

onSnapshot(photosQuery, (snapshot) => {
    photoGallery.innerHTML = ''; // Limpiar la galería
    snapshot.forEach((doc) => {
        const photo = doc.data();
        const imgElement = document.createElement('img');
        imgElement.src = photo.url;
        photoGallery.appendChild(imgElement);
    });
});
