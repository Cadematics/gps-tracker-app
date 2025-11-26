// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-KXnLJPyY-tYghAHkr6rgttCZ-ZAlAYQ",
  authDomain: "gps-tracker-platform-c9fc4.firebaseapp.com",
  projectId: "gps-tracker-platform-c9fc4",
  storageBucket: "gps-tracker-platform-c9fc4.firebasestorage.app",
  messagingSenderId: "230744784638",
  appId: "1:230744784638:web:121fd4517f92c7ccb4efaf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
