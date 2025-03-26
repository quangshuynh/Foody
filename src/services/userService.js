import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const usersCollectionRef = collection(db, 'users');

/**
 * Checks if a username already exists.
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} True if the username exists, false otherwise.
 */
export const checkUsernameExists = async (username) => {
  if (!username) return false; // Cannot check empty username
  const normalizedUsername = username.toLowerCase(); // Use lowercase for uniqueness check
  const usernameDocRef = doc(db, 'usernames', normalizedUsername);
  try {
    const docSnap = await getDoc(usernameDocRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking username existence:", error);
    // Treat error as username potentially existing to be safe, or rethrow
    throw new Error("Failed to verify username availability.");
  }
};

/**
 * Creates the user profile document and the username uniqueness document.
 * Uses a batch write to ensure both succeed or fail together.
 * @param {string} userId - The Firebase Auth user ID.
 * @param {string} username - The chosen username.
 * @param {string} email - The user's email.
 * @returns {Promise<object>} The created user profile data.
 */
export const createUserProfile = async (userId, username, email) => {
  if (!userId || !username || !email) {
    throw new Error("User ID, username, and email are required to create profile.");
  }

  const normalizedUsername = username.toLowerCase(); // Store lowercase for consistency
  const userDocRef = doc(db, 'users', userId);
  const usernameDocRef = doc(db, 'usernames', normalizedUsername);

  // Check existence again just before writing (though rules should also prevent duplicates)
  const usernameExists = await checkUsernameExists(normalizedUsername);
  if (usernameExists) {
    throw new Error("Username is already taken.");
  }

  const profileData = {
    username: username, // Store the original casing for display
    username_lowercase: normalizedUsername, // Store lowercase for queries if needed
    email: email,
    createdAt: new Date() // Use client-side timestamp or serverTimestamp()
    // Add other profile fields as needed later
  };

  try {
    const batch = writeBatch(db);

    // Set the user profile document
    batch.set(userDocRef, profileData);

    // Set the username uniqueness document
    batch.set(usernameDocRef, { userId: userId });

    // Commit the batch
    await batch.commit();

    console.log("User profile and username document created successfully for:", userId);
    return profileData;
  } catch (error) {
    console.error("Error creating user profile:", error);
    // Attempt to clean up if one part failed? Difficult with batch errors.
    // Rely on rules and potential manual cleanup if inconsistency occurs.
    throw new Error("Failed to create user profile.");
  }
};

/**
 * Fetches a user's profile data by their user ID.
 * @param {string} userId - The Firebase Auth user ID.
 * @returns {Promise<object|null>} The user profile data or null if not found.
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No user profile found for:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile.");
  }
};

/**
 * Fetches multiple user profiles based on a list of user IDs.
 * Useful for displaying usernames for comments, etc.
 * @param {Array<string>} userIds - An array of user IDs.
 * @returns {Promise<object>} An object mapping userId to username (or null if not found).
 */
export const getUsernamesByIds = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return {};
  }
  // Firestore 'in' query supports up to 30 items per query
  // For more, you'd need multiple queries.
  const uniqueUserIds = [...new Set(userIds)].slice(0, 30); // Get unique IDs, limit for safety

  const usersMap = {};

  try {
    const q = query(usersCollectionRef, where('__name__', 'in', uniqueUserIds));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data()?.username || null; // Store username or null
    });

    // For any IDs not found in the query result, explicitly set them to null
    uniqueUserIds.forEach(id => {
      if (!usersMap.hasOwnProperty(id)) {
        usersMap[id] = null;
      }
    });

    return usersMap;
  } catch (error) {
    console.error("Error fetching usernames by IDs:", error);
    // Return empty map or throw? Returning empty might be safer for UI.
    return {};
  }
};
