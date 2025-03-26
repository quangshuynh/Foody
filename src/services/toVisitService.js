import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import the initialized auth service

// Note: We are removing the old API-based functions and helpers.
// Firebase handles authentication state persistence automatically.

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // You might want to store additional user profile info in Firestore/Realtime Database here
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};

// No need for getCurrentUser, isAuthenticated, getAuthToken, updateApiUrl
// Firebase's onAuthStateChanged handles state, and auth headers are managed differently if needed (e.g., for Cloud Functions).
