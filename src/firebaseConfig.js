// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6gCXwMNBqXF7DtDLGX1RYCB6COetDC5c",  // put your own API key here
  authDomain: "foody-e5677.firebaseapp.com",
  projectId: "foody-e5677",
  storageBucket: "foody-e5677.firebasestorage.app",
  messagingSenderId: "981213113044",
  appId: "1:981213113044:web:15cecd02989f2608b56941",
  measurementId: "G-4NBS6J9DLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db, analytics }; // Export db
