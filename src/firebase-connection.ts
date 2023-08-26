import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDWysA3NPO6G4B93-ay5OA-U74Z-nXpFMk",
  authDomain: "vehicle-financing-review.firebaseapp.com",
  projectId: "vehicle-financing-review",
  storageBucket: "vehicle-financing-review.appspot.com",
  messagingSenderId: "627338069606",
  appId: "1:627338069606:web:aa41df90ed550a8d504fa7",
  measurementId: "G-NLLK88HE2M",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
