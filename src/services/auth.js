// src/services/auth.js
import {
  auth,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  db,
  doc,
  setDoc,
  getDoc,
} from "./firebase";

// Trigger Google Sign-In (Redirect)
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);

    // Handle the result after redirect
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      }

      return user;
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};
