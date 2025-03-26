// src/services/recommendedService.js - Firestore Version
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Collection reference - Assuming a top-level collection for public recommendations
const recommendedCollectionRef = collection(db, 'recommendedRestaurants');

// Fetch all recommended restaurants (public data)
export const fetchRecommendedRestaurants = async () => {
  try {
    const querySnapshot = await getDocs(recommendedCollectionRef);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Assuming recommended items might also have a dateAdded or similar field
      dateAdded: doc.data().dateAdded?.toDate ? doc.data().dateAdded.toDate().toISOString() : null,
      recommended: true // Explicitly mark as recommended if needed by map/UI
    }));
    // Optional: Sort recommended restaurants if needed
    // restaurants.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    return restaurants;
  } catch (error) {
    console.error('Fetch recommended restaurants error:', error);
    return [];
  }
};
