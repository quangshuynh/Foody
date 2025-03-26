// src/services/toVisitService.js - Firestore Version
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

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
      dateAdded: serverTimestamp()
    };
    // Remove any temporary 'id' if it exists from the input
    delete newToVisitData.id;

    const docRef = await addDoc(toVisitCollectionRef, newToVisitData);
    return { ...newToVisitData, id: docRef.id, dateAdded: new Date() }; // Optimistic update
  } catch (error) {
    console.error("Add 'to visit' restaurant error:", error);
    throw error;
  }
};

// Remove a restaurant from the 'to visit' list
export const removeToVisit = async (id) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  if (!id) throw new Error('Restaurant ID is required for deletion');

  try {
    const restaurantDocRef = doc(db, 'toVisitRestaurants', id);
    await deleteDoc(restaurantDocRef);
    // Firestore rules should ensure only the owner can delete
    return true; // Indicate success
  } catch (error) {
    console.error("Delete 'to visit' restaurant error:", error);
    throw error;
  }
};
