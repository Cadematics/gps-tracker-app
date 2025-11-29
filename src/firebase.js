import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-KXnLJPyY-tYghAHkr6rgttCZ-ZAlAYQ",
  authDomain: "gps-tracker-platform-c9fc4.firebaseapp.com",
  projectId: "gps-tracker-platform-c9fc4",
  storageBucket: "gps-tracker-platform-c9fc4.appspot.com",
  messagingSenderId: "230744784638",
  appId: "1:230744784638:web:121fd4517f92c7ccb4efaf"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
