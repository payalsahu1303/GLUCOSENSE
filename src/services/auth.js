// src/services/auth.js

import {
  auth,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  setDoc,
  getDoc,
} from "./firebase"; // Import necessary Firebase services

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Trigger Google Sign-In popup
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Reference to the user's document in Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If the user doesn't exist in Firestore, add them
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    // Return the user object after successful login
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};
