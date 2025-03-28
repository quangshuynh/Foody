import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaTrash, FaMapMarkerAlt, FaEdit, FaStar, FaTags } from 'react-icons/fa'; 
import { FiCopy } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';
import Rating from './Rating';
import RatingModal from './RatingModal'; 
import TagDisplay from './TagDisplay'; 
import { db } from '../firebaseConfig'; 
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from '../services/auditLogService';
import { toast } from 'react-toastify'; 

export default VisitItem;

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5); // Added shadow like RestaurantItem

  @media (max-width: 480px) { // Added responsive width like RestaurantItem
    width: 95%;
    padding: 15px;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
  svg {
    cursor: pointer;
    color: #00bcd4;
    transition: color 0.3s;
    &:hover {
      color: #00a1b5;
    }
  }
`;

const DateText = styled.p`
  font-size: 0.8rem;
  color: #aaa;
  margin: 0; // Reset margin
  text-align: center; // Center align
`;

const DateWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin-top: 5px;

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  visibility: hidden;
  background-color: rgba(50, 50, 50, 0.85);
  color: #fff;
  text-align: center;
  border-radius: 8px;
  padding: 10px 12px;
  position: absolute;
  z-index: 1;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  min-width: 220px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px;
    border-style: solid;
    border-color: rgba(50, 50, 50, 0.85) transparent transparent transparent;
  }
`;


function capitalizeWords(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function VisitItem({ restaurant, removeToVisit, openEditModal }) {
  const { user, isAuthenticated } = useAuth(); 
  const { focusLocation } = useMap();
  const itemRef = useRef(null); 

  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeToVisit(restaurant.id);
    }
 };

 const handleMapFocus = (location) => {
    if (location) {
      focusLocation(location); 
      if (itemRef.current) {
        setTimeout(() => {
          itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
   } else {
     console.warn("Attempted to focus map with no location data.");
   }
 };

  const handleEditClick = () => {
    if (openEditModal) {
      openEditModal(restaurant);
    }
 };

 const handleRatingSubmit = async (rating) => { 
   if (!user) {
      alert('Please log in to rate this restaurant.');
      return;
    }

    const restaurantDocRef = doc(db, 'toVisitRestaurants', restaurant.id);

    try {
      const docSnap = await getDoc(restaurantDocRef);
      if (!docSnap.exists()) throw new Error("Restaurant document not found.");

      const currentData = docSnap.data();
      const currentRatings = currentData.ratings || [];
      const existingRating = currentRatings.find(r => r.userId === user.uid);

      // Simplified rating data - no comment or wouldReturn
      const newRatingData = {
        userId: user.uid,
        userEmail: user.email,
        rating,
        date: Timestamp.fromDate(new Date())
        // Removed wouldReturn and comment
      };

      let ratingsUpdate = [];
      let averageRating = 0;

      if (existingRating) {
        // Create a new rating object without the old comment/wouldReturn if they existed
        const updatedExistingRating = { ...existingRating, rating: newRatingData.rating, date: newRatingData.date };
        delete updatedExistingRating.comment;
        delete updatedExistingRating.wouldReturn;

        await updateDoc(restaurantDocRef, { ratings: arrayRemove(existingRating) });
        await updateDoc(restaurantDocRef, { ratings: arrayUnion(updatedExistingRating) });
        const updatedDocSnap = await getDoc(restaurantDocRef);
        ratingsUpdate = updatedDocSnap.data().ratings || [];
      } else {
        await updateDoc(restaurantDocRef, { ratings: arrayUnion(newRatingData) });
        ratingsUpdate = [...currentRatings, newRatingData];
      }

      if (ratingsUpdate.length > 0) {
        averageRating = ratingsUpdate.reduce((acc, r) => acc + r.rating, 0) / ratingsUpdate.length;
      }

      await updateDoc(restaurantDocRef, {
       averageRating: Math.round(averageRating * 10) / 10
     });

     // NOTE: Removed direct call to updateToVisit prop here.
     // The parent component (App.js) should re-render based on the Firestore update.

     await logAuditEvent(
       existingRating ? 'UPDATE_RATING' : 'CREATE_RATING',
       'toVisitRestaurants',
        restaurant.id,
        { rating: newRatingData.rating } // Simplified log details
      );

      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to update rating for to-visit:', error);
      toast.error(`Failed to update rating: ${error.message}. Please try again.`); // Use toast.error
    }
  };


  return (
    // Attach the ref and an ID to the main container
    <ItemContainer ref={itemRef} id={`restaurant-item-${restaurant.id}`}>
      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          onSubmit={handleRatingSubmit} // Pass simplified handler
          onClose={() => setShowRatingModal(false)}
          currentRating={(restaurant.ratings || []).find(r => r?.userId === user?.uid)?.rating || 0}
          isSimpleMode={true} // Add prop to hide comment/wouldReturn
        />
      )}

      <IconContainer>
        <FaMapMarkerAlt
          onClick={() => handleMapFocus(restaurant.location)}
          title="Show on Map"
         style={{ color: '#ff4081' }}
       />
       {isAuthenticated && (
         <>
           <FaEdit onClick={handleEditClick} title="Edit" /> 
           <FaStar onClick={() => setShowRatingModal(true)} title="Rate" />
           <FaTrash onClick={handleRemove} title="Remove" />
         </>
       )}
       <FaTags onClick={() => setShowTags(!showTags)} title="Show Tags" /> 
     </IconContainer>

       <>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <h3
         style={{
           fontFamily: "'aligarh', sans-serif",
           color: '#f5f5f5',
           fontSize: '1.7rem',
           letterSpacing: '1px',
           marginBottom: '2px'
         }}
       >
             {restaurant.name}
           </h3>
         </div>
         {restaurant.address && (
           <p
         style={{
           fontFamily: "'playfair', sans-serif",
           fontSize: '1.1rem',
           color: '#fff',
           marginTop: '0',
           textAlign: 'center',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }}
       >
         <a
   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)} ${encodeURIComponent(restaurant.address)}`}
           target="_blank"
           rel="noopener noreferrer"
           style={{ color: '#b4c2fa', textDecoration: 'none', fontWeight: 'bold' }}
         >
           {capitalizeWords(restaurant.address)}
         </a>
         <FiCopy
           onClick={() => {
             navigator.clipboard.writeText(restaurant.address);
             toast.info('Address copied to clipboard!'); 
           }}
           title="Copy address to clipboard"
           style={{ color: '#00bcd4', cursor: 'pointer', marginLeft: '10px', fontSize: '1rem' }}
             />
           </p>
         )}
         <div style={{ textAlign: 'center', margin: '8px 0' }}>
           <Rating rating={restaurant.averageRating} />
         </div>
         <div style={{ textAlign: 'center', marginTop: '10px' }}>
           <DateWrapper>
             <DateText>Added on: {restaurant.dateAdded ? (restaurant.dateAdded.toDate ? restaurant.dateAdded.toDate().toLocaleString() : new Date(restaurant.dateAdded).toLocaleString()) : 'N/A'}</DateText>
             {restaurant.updatedAt && (
               <Tooltip className="tooltip"> Updated on: {restaurant.updatedAt ? (restaurant.updatedAt.toDate ? restaurant.updatedAt.toDate().toLocaleString() : new Date(restaurant.updatedAt).toLocaleString()) : 'N/A'}</Tooltip>
             )}
          </DateWrapper>
        </div>
        {showTags && (
          <TagDisplay tags={restaurant.tags} />
        )}
      </>
    </ItemContainer>
  );
 }
