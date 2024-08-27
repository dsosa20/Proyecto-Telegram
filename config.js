// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCddqCOWH1ztpnrx5x4RnH-0E3fVsyKOZA",
  authDomain: "proyecto-telegram-68994.firebaseapp.com",
  projectId: "proyecto-telegram-68994",
  storageBucket: "proyecto-telegram-68994.appspot.com",
  messagingSenderId: "346424282175",
  appId: "1:346424282175:web:74356aae02d238a3aabc8a",
  measurementId: "G-S4NKCTLVQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);