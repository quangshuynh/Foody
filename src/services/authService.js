import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser // Import deleteUser for potential rollback
} from "firebase/auth";
import { auth } from '../firebaseConfig';
import { createUserProfile } from './userService'; // Import profile creation

// Note: We are removing the old API-based functions and helpers.
// Firebase handles authentication state persistence automatically.

/**
 * Registers a new user with username, email, and password, and creates their profile.
 * @param {string} username - The chosen username.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<User>} Firebase User object.
 */
export const register = async (username, email, password) => {
  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required for registration.");
  }
  let userCredential; // Define userCredential outside try block to access in catch
  try {
    // 1. Create the Firebase Auth user
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Firebase Auth user created successfully:", user.uid);

    // 2. Create the user profile document in Firestore
    try {
      await createUserProfile(user.uid, username, email);
      console.log("User profile created successfully for:", user.uid);
      return user; // Return the user object on full success
    } catch (profileError) {
      console.error("Failed to create user profile after auth creation:", profileError);
      // Attempt to roll back Auth user creation if profile fails
      if (user) {
        try {
          await deleteUser(user);
          console.log("Rolled back Firebase Auth user creation for:", user.uid);
        } catch (deleteError) {
          console.error("Failed to roll back Firebase Auth user creation:", deleteError);
          // This leaves an orphaned Auth user - might need manual cleanup
          throw new Error("Registration failed: Could not create profile, and failed to clean up user account. Please contact support.");
        }
      }
      // Throw the original profile error or a combined error
      throw new Error(`Registration failed: ${profileError.message || 'Could not create user profile.'}`);
    }

  } catch (authError) {
    console.error('Registration error:', authError.code, authError.message);
    // Provide more specific error messages
    // Handle Auth specific errors
    let friendlyMessage = 'Registration failed. Please try again.';
    if (authError.code === 'auth/email-already-in-use') {
      friendlyMessage = 'This email address is already in use.';
    } else if (authError.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    } else if (authError.code === 'auth/weak-password') {
      friendlyMessage = 'Password is too weak. Please choose a stronger password.';
    }
    // If it wasn't a profile error re-thrown from the inner catch block
    if (!friendlyMessage.startsWith('Registration failed:')) {
        throw new Error(friendlyMessage);
    } else {
        throw authError; // Re-throw the specific profile error from the inner catch
    }
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
