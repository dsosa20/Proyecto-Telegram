// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCddqCOWH1ztpnrx5x4RnH-0E3fVsyKOZA",
  authDomain: "proyecto-telegram-68994.firebaseapp.com",
  projectId: "proyecto-telegram-68994",
  storageBucket: "proyecto-telegram-68994.appspot.com",
  messagingSenderId: "346424282175",
  appId: "1:346424282175:web:74356aae02d238a3aabc8a",
  measurementId: "G-S4NKCTLVQQ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exporta la instancia de Firebase y la configuración
export { app, firebaseConfig };
