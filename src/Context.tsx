import { Analytics } from "firebase/analytics";
import { Firestore } from "firebase/firestore";
import { createContext } from "react";
import { db, analytics } from "./firebase-connection";

export const Context = createContext<{
  db: Firestore;
  analytics: Analytics;
}>({ db, analytics });
