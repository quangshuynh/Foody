import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  updateProfile,
  updateEmail,
  updatePassword
} from "firebase/auth";
import { auth } from '../firebaseConfig';
import { createUserProfile, checkUsernameExists } from './userService';

export const register = async (username, email, password) => {
  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required for registration.");
  }
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Firebase Auth user created successfully:", user.uid);
    try {
      await createUserProfile(user.uid, username, email);
      console.log("User profile created successfully for:", user.uid);
      return user;
    } catch (profileError) {
      console.error("Failed to create user profile after auth creation:", profileError);
      if (user) {
        try {
          await deleteUser(user);
          console.log("Rolled back Firebase Auth user creation for:", user.uid);
        } catch (deleteError) {
          console.error("Failed to roll back Firebase Auth user creation:", deleteError);
          throw new Error("Registration failed: Could not create profile, and failed to clean up user account. Please contact support.");
        }
      }
      throw new Error(`Registration failed: ${profileError.message || 'Could not create user profile.'}`);
    }
  } catch (authError) {
    console.error('Registration error:', authError.code, authError.message);
    let friendlyMessage = 'Registration failed. Please try again.';
    if (authError.code === 'auth/email-already-in-use') {
      friendlyMessage = 'This email address is already in use.';
    } else if (authError.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    } else if (authError.code === 'auth/weak-password') {
      friendlyMessage = 'Password is too weak. Please choose a stronger password.';
    }
    if (!friendlyMessage.startsWith('Registration failed:')) {
      throw new Error(friendlyMessage);
    } else {
      throw authError;
    }
  }
};

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
    let friendlyMessage = 'Login failed. Please check your credentials.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      friendlyMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = 'Please enter a valid email address.';
    }
    throw new Error(friendlyMessage);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Logout failed. Please try again.');
  }
};

export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Google sign in successful:", result.user.uid);

    if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
      const email = result.user.email;
      const baseUsername = email.split('@')[0];
      let availableUsername = baseUsername;
      let count = 1;

      while (await checkUsernameExists(availableUsername)) {
        availableUsername = `${baseUsername}${count}`;
        count++;
      }

      await createUserProfile(result.user.uid, availableUsername, email);
      console.log("User profile created in Firestore for new Google user:", result.user.uid);
    }
    return result.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw new Error("Google sign in failed.");
  }
};


export const linkGoogleAccount = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in");
    const result = await linkWithPopup(user, provider);
    console.log("Google account linked:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("Link Google account error:", error);
    throw new Error("Linking Google account failed.");
  }
};

export const unlinkGoogleAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in");
    await user.unlink("google.com");
    console.log("Google account unlinked successfully:", user.uid);
    return user;
  } catch (error) {
    console.error("Unlink Google account error:", error);
    throw new Error("Unlinking Google account failed.");
  }
};


export const updateUserProfile = async (updates) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in");
  try {
    if (updates.username) {
      await updateProfile(user, { displayName: updates.username });
    }
    if (updates.email && updates.email !== user.email) {
      await updateEmail(user, updates.email);
    }
    if (updates.password) {
      await updatePassword(user, updates.password);
    }
    return user;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update profile.");
  }
};
