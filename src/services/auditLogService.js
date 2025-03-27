import { db, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const auditLogsCollectionRef = collection(db, 'auditLogs');

/**
 * Creates an audit log entry.
 * @param {string} action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'RATE').
 * @param {string} collectionName - The name of the collection affected (e.g., 'visitedRestaurants').
 * @param {string} docId - The ID of the document affected.
 * @param {object} [details] - Optional additional details about the change.
 * @returns {Promise<void>}
 */
export const logAuditEvent = async (action, collectionName, docId, details = {}) => {
  const user = auth.currentUser;
  if (!user) {
    console.warn("Attempted to log audit event without authenticated user.");
    // Decide if this should throw an error or just return
    return; // Don't log if no user
  }

  if (!action || !collectionName || !docId) {
    console.error("Missing required parameters for audit log.", { action, collectionName, docId });
    throw new Error("Missing required parameters for audit log.");
  }

  try {
    const logData = {
      userId: user.uid,
      userEmail: user.email, // Include email for easier identification initially
      action: action.toUpperCase(), // Standardize action case
      collectionName: collectionName,
      docId: docId,
      timestamp: serverTimestamp(), // Use server timestamp for accuracy
      details: details // Store any extra info (e.g., previous value, new value)
    };

    await addDoc(auditLogsCollectionRef, logData);
    console.log(`Audit log created: ${action} on ${collectionName}/${docId} by ${user.uid}`);

  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
