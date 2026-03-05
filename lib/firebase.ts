import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "studio-5485353702-8ce01",
  appId: "1:419112240411:web:f8e6edfc5d51747e663fbe",
  apiKey: "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE",
  authDomain: "studio-5485353702-8ce01.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "419112240411",
  storageBucket: "studio-5485353702-8ce01.firebasestorage.app",
  databaseURL: "https://studio-5485353702-8ce01-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

export { app, db, rtdb, auth };
