import React, { useState } from 'react';
import styled from 'styled-components';
import Rating from './Rating';
import Comments from './Comments';
import { FaTrash, FaEdit, FaStar, FaComment, FaMapMarkerAlt } from 'react-icons/fa';
import RatingModal from './RatingModal';
import { useAuth } from '../contexts/AuthContext';
import { useMap } from '../contexts/MapContext';
import { updateRestaurant as updateRestaurantApi } from '../services/restaurantService';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  position: relative;
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

const Button = styled.button`
  background: #00bcd4;
  border: none;
  color: #fff;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
  &:hover {
    background: #00a1b5;
  }
`;

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  width: 90%;
  border: 1px solid #00bcd4;
  border-radius: 5px;
  background: #262626;
  color: #f5f5f5;
`;

const DateText = styled.p`
  font-size: 0.8rem;
  color: #aaa;
`;

function RestaurantItem({ restaurant, updateRestaurant, removeRestaurant }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(restaurant.name);
  const [editAddress, setEditAddress] = useState(restaurant.address);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { focusLocation } = useMap();

  const handleRatingSubmit = async (rating, wouldReturn, comment = '') => {
    if (!user) {
      alert('Please log in to rate this restaurant');
      return;
    }

    const newRating = {
      userId: user.id,
      username: user.username,
      rating,
      wouldReturn,
      comment,
      date: new Date().toISOString()
    };

    const ratings = restaurant.ratings || [];
    const existingRatingIndex = ratings.findIndex(r => r.userId === user.id);
    let updatedRatings;
    
    if (existingRatingIndex !== -1) {
      updatedRatings = [...ratings];
      updatedRatings[existingRatingIndex] = newRating;
    } else {
      updatedRatings = [...ratings, newRating];
    }

    const averageRating = updatedRatings.reduce((acc, r) => acc + r.rating, 0) / updatedRatings.length;

    const updatedRestaurant = {
      ...restaurant,
      ratings: updatedRatings,
      averageRating: Math.round(averageRating * 10) / 10
    };

    try {
      await updateRestaurantApi(updatedRestaurant);
      updateRestaurant(updatedRestaurant);
      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to update rating:', error);
      alert('Failed to update rating. Please try again.');
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeRestaurant(restaurant.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName(restaurant.name);
    setEditAddress(restaurant.address);
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editName || !editAddress) {
      setEditError('Please fill in all fields');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      if (editAddress !== restaurant.address) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editAddress)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          updateRestaurant({
            ...restaurant,
            name: editName,
            address: editAddress,
            location: { lat: parseFloat(lat), lng: parseFloat(lon) },
          });
          setIsEditing(false);
        } else {
          setEditError('Address not found. Please enter a valid address.');
        }
      } else {
        updateRestaurant({ ...restaurant, name: editName });
        setIsEditing(false);
      }
    } catch (err) {
      setEditError('Error fetching location. Please try again.');
    }
    setEditLoading(false);
  };

  return (
    <ItemContainer>
      <IconContainer>
        <FaMapMarkerAlt 
          onClick={() => focusLocation(restaurant.location)} 
          title="Show on Map"
          style={{ color: '#ff4081' }}
        />
        {isAuthenticated && (
          <>
            <FaEdit onClick={handleEdit} title="Edit" />
            <FaStar onClick={() => setShowRatingModal(true)} title="Rate" />
            <FaComment onClick={() => setShowComments(!showComments)} title="Comments" />
            <FaTrash onClick={handleRemove} title="Remove" />
          </>
        )}
      </IconContainer>

      {showRatingModal && (
        <RatingModal
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
          currentRating={(restaurant.ratings || []).find(r => r?.userId === user?.id)?.rating || 0}
        />
      )}

      {isEditing ? (
        <>
          <Input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Restaurant Name"
          />
          <Input
            type="text"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            placeholder="Street Address (e.g., 123 Main St, Rochester, NY)"
          />
          {editError && <p style={{ color: '#ff4081' }}>{editError}</p>}
          <Button onClick={handleEditSave} disabled={editLoading}>
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleEditCancel} style={{ marginLeft: '10px', background: '#ff4081' }}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <h3 style={{ 
            fontFamily: "'eracake', 'Roboto', sans-serif", 
            color: '#f5f5f5', 
            fontSize: '1.6rem',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>{restaurant.name}</h3>
          {restaurant.address && <p>{restaurant.address}</p>}
          <DateText>Added on: {new Date(restaurant.dateAdded).toLocaleString()}</DateText>
          <Rating rating={restaurant.averageRating} />
          {showComments && (
            <Comments
              comments={(restaurant.ratings || []).filter(r => r?.comment)}
              onAddComment={(comment) => handleRatingSubmit(comment.rating, comment.wouldReturn, comment.comment)}
              restaurantId={restaurant.id}
            />
          )}
        </>
      )}
    </ItemContainer>
  );
}

export default RestaurantItem;
