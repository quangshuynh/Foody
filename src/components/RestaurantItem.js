import React, { useState } from 'react';
import styled from 'styled-components';
import Rating from './Rating';
import { FaTrash, FaEdit } from 'react-icons/fa';

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

function RestaurantItem({ restaurant, updateRestaurant, removeRestaurant }) {
  const [localRating, setLocalRating] = useState(restaurant.rating);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(restaurant.name);
  const [editAddress, setEditAddress] = useState(restaurant.address);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleRatingChange = (newRating) => {
    setLocalRating(newRating);
    updateRestaurant({ ...restaurant, rating: newRating });
  };

  const toggleGoAgain = () => {
    updateRestaurant({ ...restaurant, goAgain: !restaurant.goAgain });
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
      // geocode the new address if changed
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
        // if the address wasnt changed, just update the name
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
        <FaEdit onClick={handleEdit} title="Edit" />
        <FaTrash onClick={handleRemove} title="Remove" />
      </IconContainer>
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
          <h3>{restaurant.name}</h3>
          {restaurant.address && <p>{restaurant.address}</p>}
          <Rating rating={localRating} onRatingChange={handleRatingChange} />
          <p>{restaurant.goAgain ? 'Would go again!' : 'Not planning a return.'}</p>
          <Button onClick={toggleGoAgain}>
            {restaurant.goAgain ? 'Change to No' : 'Change to Yes'}
          </Button>
        </>
      )}
    </ItemContainer>
  );
}

export default RestaurantItem;
