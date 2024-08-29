import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Inicializa Firestore
const db = getFirestore();

const gallery = document.getElementById('photo-gallery');

// Configura la consulta para obtener las imágenes de Firestore
const q = query(collection(db, 'alarm_photos'), orderBy('timestamp', 'desc'));

// Escucha en tiempo real para obtener las imágenes
onSnapshot(q, (snapshot) => {
    gallery.innerHTML = ''; // Limpiar la galería
    snapshot.forEach((doc) => {
        const data = doc.data();
        const img = document.createElement('img');
        img.src = data.url;
        img.alt = 'Imagen del Bot de Telegram';
        gallery.appendChild(img);
    });
});
