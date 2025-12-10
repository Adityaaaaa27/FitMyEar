// services/authService.ts
import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { createUserDocumentIfNotExists } from "./dbService.ts";


export const signUpWithEmail = async (email: string, password: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocumentIfNotExists(cred.user);
  return cred.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  // returns unsubscribe function
  return onAuthStateChanged(auth, callback);
};
