import { db, auth } from '../firebaseConfig'; // Import Firestore DB and Auth
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

// Collection reference
const restaurantsCollectionRef = collection(db, 'visitedRestaurants');

// Fetch restaurants for the current logged-in user
export const fetchVisitedRestaurants = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user logged in, cannot fetch visited restaurants.");
    return []; // Return empty array if no user is logged in
  }

  try {
    // Create a query against the collection, filtering by userId
    const q = query(restaurantsCollectionRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
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
      updatedAt: serverTimestamp()
    };
    // Remove id and potentially userId/dateAdded if they shouldn't be updated
    delete updateData.id;
    // delete updateData.userId; // Keep userId check in Firestore rules
    // delete updateData.dateAdded;

    await updateDoc(restaurantDocRef, updateData);
    // Return the updated restaurant data (or just success)
    // Fetching the updated doc might be needed if serverTimestamp is crucial immediately
    return { ...restaurant, updatedAt: new Date() }; // Return optimistic update
  } catch (error) {
    console.error('Update restaurant error:', error);
    throw error;
  }
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
      averageRating: restaurant.averageRating || 0 // Ensure averageRating exists
    };

    const docRef = await addDoc(restaurantsCollectionRef, newRestaurantData);
    // Return the new restaurant data including the Firestore generated ID
    return { ...newRestaurantData, id: docRef.id, dateAdded: new Date() }; // Return optimistic update
  } catch (error) {
    console.error('Add restaurant error:', error);
    throw error;
  }
// Delete a restaurant document from Firestore
export const removeRestaurant = async (id) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  if (!id) throw new Error('Restaurant ID is required for deletion');

  try {
    const restaurantDocRef = doc(db, 'visitedRestaurants', id);
    await deleteDoc(restaurantDocRef);
    // Firestore rules should ensure only the owner can delete
    return true; // Indicate success
  } catch (error) {
    console.error('Delete restaurant error:', error);
    throw error;
  }
};
