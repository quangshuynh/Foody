import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Rating from './Rating';
import Comments from './Comments';
import TagDisplay from './TagDisplay'; 
import { FaTrash, FaEdit, FaStar, FaComment, FaMapMarkerAlt, FaTags } from 'react-icons/fa'; 
import { FiCopy } from 'react-icons/fi';
import RatingModal from './RatingModal';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';
import { db } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from '../services/auditLogService';
import { toast } from 'react-toastify'; 

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  position: relative;
  
  @media (max-width: 480px) {
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

const DateText = styled.p`
  font-size: 0.8rem;
  color: #aaa;
  margin: 0;
  text-align: center;
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

function formatDate(date) {
  if (!date) return 'N/A';
  if (typeof date === 'string' || date instanceof Date) {
    return new Date(date).toLocaleString();
  }
  if (typeof date === 'object' && typeof date.toDate === 'function') {
    return date.toDate().toLocaleString();
  }
  return new Date(date).toLocaleString();
}

function RestaurantItem({ restaurant, openEditModal, removeRestaurant }) {
  const [showComments, setShowComments] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTags, setShowTags] = useState(false); // State for showing tags
  const { user, isAuthenticated } = useAuth();
  const { focusLocation } = useMap();
  const itemRef = useRef(null); // Add a ref for the item container

  const handleMapFocus = (location) => {
    if (location) {
      focusLocation(location); // Trigger map flyTo
      // Scroll the item into view
      if (itemRef.current) {
        // Use a slight delay to allow map animation to start
        setTimeout(() => {
          itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } else {
      console.warn("Attempted to focus map with no location data.");
    }
  };

  const handleRatingSubmit = async (rating, wouldReturn, comment = '') => {
    if (!user) {
      alert('Please log in to rate this restaurant.');
      return;
    }

    const restaurantDocRef = doc(db, 'visitedRestaurants', restaurant.id);

    try {
      // Fetch the current document to get the latest ratings array
      const docSnap = await getDoc(restaurantDocRef);
      if (!docSnap.exists()) {
        throw new Error("Restaurant document not found.");
      }
      const currentData = docSnap.data();
      const currentRatings = currentData.ratings || [];

      // Find existing rating by the current user
      const existingRating = currentRatings.find(r => r.userId === user.uid);

      const newRatingData = {
        userId: user.uid, // Use uid
        userEmail: user.email, // Store email (or displayName if available)
        rating,
        wouldReturn,
        comment: comment.trim(), // Trim comment
        date: Timestamp.fromDate(new Date()) // Use Firestore Timestamp
      };

      let ratingsUpdate = [];
      let averageRating = 0;

      if (existingRating) {
        await updateDoc(restaurantDocRef, {
          ratings: arrayRemove(existingRating),
          updatedAt: Timestamp.fromDate(new Date())
        });
        await updateDoc(restaurantDocRef, {
          ratings: arrayUnion(newRatingData),
          updatedAt: Timestamp.fromDate(new Date())
        });
        const updatedDocSnap = await getDoc(restaurantDocRef);
        ratingsUpdate = updatedDocSnap.data().ratings || [];
      } else {
        await updateDoc(restaurantDocRef, {
          ratings: arrayUnion(newRatingData),
          updatedAt: Timestamp.fromDate(new Date())
        });
        ratingsUpdate = [...currentRatings, newRatingData]; 
      }

      // Calculate new average rating
      if (ratingsUpdate.length > 0) {
        averageRating = ratingsUpdate.reduce((acc, r) => acc + r.rating, 0) / ratingsUpdate.length;
      }

      // Update the average rating in Firestore and update updatedAt
      await updateDoc(restaurantDocRef, {
        averageRating: Math.round(averageRating * 10) / 10,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Log the audit event after successful rating update/add
      await logAuditEvent(
        existingRating ? 'UPDATE_RATING' : 'CREATE_RATING',
        'visitedRestaurants',
        restaurant.id,
        { rating: newRatingData.rating, wouldReturn: newRatingData.wouldReturn, commentProvided: !!newRatingData.comment }
      );

      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to update rating:', error);
      toast.error(`Failed to update rating: ${error.message}. Please try again.`);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeRestaurant(restaurant.id);
    }
  };

  const handleEditClick = () => {
    if (openEditModal) {
      openEditModal(restaurant);
    }
  };

  return (
    <ItemContainer ref={itemRef} id={`restaurant-item-${restaurant.id}`}>
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
        {/* Add Tags button - always visible */}
        <FaTags onClick={() => setShowTags(!showTags)} title="Show Tags" />
        <FaComment onClick={() => setShowComments(!showComments)} title="Comments" />
      </IconContainer>

      {showRatingModal && (
        <RatingModal
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
          // Use user.uid to find the current user's rating
          currentRating={(restaurant.ratings || []).find(r => r?.userId === user?.uid)?.rating || 0}
        />
      )}

      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{
            fontFamily: "'aligarh', sans-serif", 
            color: '#f5f5f5', 
            fontSize: '1.7rem',
            letterSpacing: '1px',
            marginBottom: '2px'
          }}>
            {restaurant.name}
          </h3>
        </div>
        {restaurant.address && (
          <p style={{ 
            fontFamily: "'playfair', sans-serif", 
            fontSize: '1.1rem', 
            color: '#fff',
            marginTop: '0',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
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
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <DateWrapper>
            <DateText>Added on: {formatDate(restaurant.dateAdded)}</DateText>
            {restaurant.updatedAt && (
              <Tooltip className="tooltip">
                Updated on: {formatDate(restaurant.updatedAt)}
              </Tooltip>
            )}
          </DateWrapper>
        </div>
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <Rating rating={restaurant.averageRating} />
        </div>
        {showTags && (
          <TagDisplay tags={restaurant.tags} />
        )}
        {showComments && (
          <Comments
            comments={(restaurant.ratings || [])
              .filter(r => r?.comment)
              .sort((a, b) => new Date(b.date) - new Date(a.date))}
          />
        )}
      </>
    </ItemContainer>
  );
}

export default RestaurantItem;
