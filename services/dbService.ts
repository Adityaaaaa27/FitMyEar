// services/dbService.ts
import { db } from "./firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export type EarUploadStatus = "pending" | "processing" | "done" | "failed";

export interface EarUpload {
  id?: string;
  userId: string;
  imageUrl: string;
  createdAt?: any; // Firestore Timestamp
  status: EarUploadStatus;
  modelUrl?: string | null;
}

// ---------- USERS ----------
export const createUserDocumentIfNotExists = async (user: User) => {
  if (!user?.uid) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? null,
      createdAt: serverTimestamp(),
    });
  }
};

// ---------- UPLOADS ----------
export const createEarUpload = async (
  userId: string,
  imageUrl: string
): Promise<string> => {
  const uploadsRef = collection(db, "uploads");

  const docRef = await addDoc(uploadsRef, {
    userId,
    imageUrl,
    status: "pending",   // 🔴 MUST be "pending"
    modelUrl: null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};


export const listenToUserUploads = (
  userId: string,
  callback: (uploads: EarUpload[]) => void
) => {
  const uploadsRef = collection(db, "uploads");
  const q = query(uploadsRef, where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const data: EarUpload[] = [];

    snapshot.forEach((docSnap) => {
      const v = docSnap.data() as Omit<EarUpload, "id">;
      data.push({
        ...v,
        id: docSnap.id,
      });
    });

    callback(data);
  });
};

export const updateUploadStatusAndModel = async (
  uploadId: string,
  status: EarUploadStatus,
  modelUrl?: string | null
) => {
  const uploadRef = doc(db, "uploads", uploadId);

  await updateDoc(uploadRef, {
    status,
    modelUrl: modelUrl ?? null,
  });
};
