import { db, auth } from '../firebaseConfig'; // Import Firestore DB and Auth
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { logAuditEvent } from './auditLogService'; // Import audit log service

// Collection reference
const restaurantsCollectionRef = collection(db, 'visitedRestaurants');

// Fetch ALL visited restaurants (public read)
export const fetchVisitedRestaurants = async () => {
  // No user check needed for public read
  try {
    // Create a query against the collection (no user filter)
    const querySnapshot = await getDocs(restaurantsCollectionRef);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id, // Use Firestore document ID
      ...doc.data(),
      // Convert Firestore Timestamps to JS Date objects if needed, or handle in component
      dateAdded: doc.data().dateAdded?.toDate ? doc.data().dateAdded.toDate().toISOString() : null
    }));
    // Sort by dateAdded descending (newest first)
    restaurants.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    return restaurants;
  } catch (error) {
    console.error('Fetch restaurants error:', error);
    return [];
  }
}; // <-- Closing brace was missing

// Update an existing restaurant document in Firestore
export const updateRestaurant = async (restaurant) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  if (!restaurant.id) throw new Error('Restaurant ID is required for update');

  try {
    const restaurantDocRef = doc(db, 'visitedRestaurants', restaurant.id);
    // Prepare data for update, ensuring we don't overwrite userId and potentially dateAdded
   // Add an updatedAt timestamp
   const updateData = {
     ...restaurant,
     updatedAt: serverTimestamp(),
     tags: restaurant.tags || {} // Ensure tags field is included/updated
   };
   // Remove id and potentially userId/dateAdded if they shouldn't be updated
   delete updateData.id;
    // delete updateData.userId; // Keep userId check in Firestore rules
    // delete updateData.dateAdded;

    await updateDoc(restaurantDocRef, updateData);
    // Log the audit event *after* successful update
    await logAuditEvent('UPDATE', 'visitedRestaurants', restaurant.id, { updatedFields: Object.keys(updateData) });

    // Return the updated restaurant data (or just success)
    // Fetching the updated doc might be needed if serverTimestamp is crucial immediately
    // Convert updatedAt to ISO string for consistency with fetch
    return { ...restaurant, updatedAt: new Date().toISOString() }; // Return optimistic update as ISO string
  } catch (error) {
    console.error('Update restaurant error:', error);
    throw error; // Re-throw error after logging failure or handling
  }
}; // <-- Closing brace was missing

// Add a new restaurant document to Firestore
export const addRestaurant = async (restaurant) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');

  try {
    // Add userId and dateAdded timestamp to the restaurant data
    const newRestaurantData = {
      ...restaurant,
     userId: user.uid,
     dateAdded: serverTimestamp(),
     ratings: restaurant.ratings || [], // Ensure ratings array exists
     averageRating: restaurant.averageRating || 0, // Ensure averageRating exists
     tags: restaurant.tags || {} // Ensure tags field exists (can be empty object)
   };

   const docRef = await addDoc(restaurantsCollectionRef, newRestaurantData);

    // Log the audit event *after* successful add
    await logAuditEvent('CREATE', 'visitedRestaurants', docRef.id, { name: newRestaurantData.name, address: newRestaurantData.address });

    // Return the new restaurant data including the Firestore generated ID
    return { ...newRestaurantData, id: docRef.id, dateAdded: new Date() }; // Return optimistic update
  } catch (error) {
    console.error('Add restaurant error:', error);
    throw error; // Re-throw error after logging failure or handling
  }
}; // <-- Closing brace was missing

// Delete a restaurant document from Firestore
export const removeRestaurant = async (id) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  if (!id) throw new Error('Restaurant ID is required for deletion');

  try {
    const restaurantDocRef = doc(db, 'visitedRestaurants', id);
    // Consider fetching the doc name/address before deleting if needed for the log details
    await deleteDoc(restaurantDocRef);

    // Log the audit event *after* successful delete
    await logAuditEvent('DELETE', 'visitedRestaurants', id);

    // Firestore rules should ensure only the owner can delete
    return true; // Indicate success
  } catch (error) {
    console.error('Delete restaurant error:', error);
    throw error; // Re-throw error after logging failure or handling
  }
};
