// src/services/authService.js - Firebase Version
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import the initialized auth service

// Note: We are removing the old API-based functions and helpers.
// Firebase handles authentication state persistence automatically.

/**
 * Registers a new user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<User>} Firebase User object.
 */
export const register = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required for registration.");
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // You might want to store additional user profile info in Firestore/Realtime Database here
    console.log("User registered successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error.code, error.message);
    // Provide more specific error messages
    let friendlyMessage = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      friendlyMessage = 'This email address is already in use.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      friendlyMessage = 'Password is too weak. Please choose a stronger password.';
    }
    throw new Error(friendlyMessage); // Re-throw a user-friendly error
  }
};

/**
 * Logs in a user with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<User>} Firebase User object.
 */
export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required for login.");
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    // Provide more specific error messages
    let friendlyMessage = 'Login failed. Please check your credentials.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      friendlyMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    }
    throw new Error(friendlyMessage); // Re-throw a user-friendly error
  }
};

/**
 * Logs out the current user.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Logout failed. Please try again.'); // Re-throw a user-friendly error
  }
};

// No need for getCurrentUser, isAuthenticated, getAuthToken, updateApiUrl
// Firebase's onAuthStateChanged handles state, and auth headers are managed differently if needed (e.g., for Cloud Functions).
