import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  Auth,
} from "firebase/auth";

const stripQuotes = (val?: string) =>
  val ? val.replace(/^["']|["']$/g, "").trim() : "";

const apiKey = stripQuotes(import.meta.env.VITE_FIREBASE_API_KEY);
const authDomain = stripQuotes(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "hostel-management-1e75f.firebaseapp.com";
const projectId = stripQuotes(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "hostel-management-1e75f";
const storageBucket = stripQuotes(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "hostel-management-1e75f.firebasestorage.app";
const messagingSenderId = stripQuotes(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const appId = stripQuotes(import.meta.env.VITE_FIREBASE_APP_ID);

const isApiKeyConfigured = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes("DUMMY"));

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyD4J-6nO2n0vwjbtf6UTPvXI15NwUP4V5U",
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error: any) {
  console.warn("[Firebase Client] Initialization warning:", error.message);
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  app,
  auth,
  isApiKeyConfigured,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateFirebaseProfile,
  onAuthStateChanged,
};
