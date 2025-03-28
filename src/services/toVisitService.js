// src/services/toVisitService.js - Firestore Version
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore'; // Added updateDoc
import { logAuditEvent } from './auditLogService'; // Import audit log service

// Collection reference
const toVisitCollectionRef = collection(db, 'toVisitRestaurants');

// Fetch ALL 'to visit' restaurants (public read)
export const fetchToVisitRestaurants = async () => {
  // No user check needed for public read
  try {
    // Create a query against the collection (no user filter)
    const querySnapshot = await getDocs(toVisitCollectionRef);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateAdded: doc.data().dateAdded?.toDate ? doc.data().dateAdded.toDate().toISOString() : null
    }));
    restaurants.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    return restaurants;
  } catch (error) {
    console.error("Fetch 'to visit' restaurants error:", error);
    return [];
  }
};

// Add a restaurant to the 'to visit' list
export const addToVisit = async (restaurant) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');

  // Basic check for essential fields (can be expanded)
  if (!restaurant || !restaurant.name || !restaurant.address) {
    throw new Error('Restaurant name and address are required.');
  }

  try {
   const newToVisitData = {
     ...restaurant, // Include name, address, location etc.
     userId: user.uid,
     dateAdded: Timestamp.fromDate(new Date()),
     tags: restaurant.tags || {} // Ensure tags field exists
   };
   // Remove any temporary 'id' if it exists from the input
   delete newToVisitData.id;

    const docRef = await addDoc(toVisitCollectionRef, newToVisitData);

    // Log the audit event *after* successful add
    await logAuditEvent('CREATE', 'toVisitRestaurants', docRef.id, { name: newToVisitData.name, address: newToVisitData.address });

    return { ...newToVisitData, id: docRef.id, dateAdded: new Date() }; // Optimistic update
  } catch (error) {
    console.error("Add 'to visit' restaurant error:", error);
    throw error; // Re-throw error after logging failure or handling
  }
};

// Update an existing 'to visit' restaurant document in Firestore
export const updateToVisit = async (restaurant) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  if (!restaurant.id) throw new Error('Restaurant ID is required for update');

  try {
    const restaurantDocRef = doc(db, 'toVisitRestaurants', restaurant.id);
   // Prepare data for update, adding an updatedAt timestamp
   const updateData = {
     ...restaurant,
     updatedAt: Timestamp.fromDate(new Date()), // Use client-side Timestamp for consistency or serverTimestamp()
     tags: restaurant.tags || {} // Ensure tags field is included/updated
   };
   // Remove id and potentially userId/dateAdded if they shouldn't be updated
   delete updateData.id;
    // delete updateData.userId; // Keep userId check in Firestore rules
    // delete updateData.dateAdded;

    await updateDoc(restaurantDocRef, updateData);
    // Log the audit event *after* successful update
    await logAuditEvent('UPDATE', 'toVisitRestaurants', restaurant.id, { updatedFields: Object.keys(updateData) });

    // Return the updated restaurant data (or just success)
    // Convert updatedAt to ISO string for consistency with fetch
    return { ...restaurant, updatedAt: new Date().toISOString() }; // Return optimistic update as ISO string
  } catch (error) {
    console.error("Update 'to visit' restaurant error:", error);
    throw error; // Re-throw error after logging failure or handling
  }
};

// Remove a restaurant from the 'to visit' list
export const removeToVisit = async (id) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  if (!id) throw new Error('Restaurant ID is required for deletion');

  try {
    const restaurantDocRef = doc(db, 'toVisitRestaurants', id);
    // Consider fetching the doc name/address before deleting if needed for the log details
    await deleteDoc(restaurantDocRef);

    // Log the audit event *after* successful delete
    await logAuditEvent('DELETE', 'toVisitRestaurants', id);

    // Firestore rules should ensure only the owner can delete
    return true; // Indicate success
  } catch (error) {
    console.error("Delete 'to visit' restaurant error:", error);
    throw error; // Re-throw error after logging failure or handling
  }
};
