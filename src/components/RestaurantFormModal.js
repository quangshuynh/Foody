import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalOverlay from './ModalOverlay';
import TagSelector from './TagSelector';
import { toast } from 'react-toastify';

const ModalContent = styled.div`
  background: #2a2a2a;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 650px; /* Increased max-width */
  max-height: 85vh; /* Limit height */
  overflow-y: auto; /* Allow scrolling */
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #f5f5f5;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 5px;
  &:hover {
    color: #ff4081;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px; /* Increased margin */
  border: 1px solid #00bcd4;
  border-radius: 5px;
  font-size: 1rem;
  background: #262626;
  color: #f5f5f5;
  box-sizing: border-box; /* Include padding in width */

  &:focus {
    border-color: #ff4081;
    box-shadow: 0 0 8px rgba(255, 64, 129, 0.5);
    outline: none;
  }
`;

const Button = styled.button`
  background: #00bcd4;
  border: none;
  color: #fff;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 15px; /* Increased margin */
  transition: background 0.3s;
  width: 100%; /* Make button full width */

  &:hover {
    background: #00a1b5;
  }
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4081;
  margin: 10px 0;
  text-align: center;
`;

// restaurantToEdit will be null for adding, or contain restaurant data for editing
// onSubmit is the function to call (addRestaurant, updateRestaurant, etc.)
// listType is 'visited' or 'toVisit'
function RestaurantFormModal({ restaurantToEdit, onSubmit, onClose, listType }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!restaurantToEdit;
  const title = isEditing ? `Edit ${listType === 'visited' ? 'Visited' : 'To Visit'} Restaurant` : `Add ${listType === 'visited' ? 'Visited' : 'To Visit'} Restaurant`;

  useEffect(() => {
    if (isEditing) {
      setName(restaurantToEdit.name || '');
      setAddress(restaurantToEdit.address || '');
      setTags(restaurantToEdit.tags || {}); // Load existing tags
    } else {
      // Reset form for adding
      setName('');
      setAddress('');
      setTags({});
    }
    setError(''); // Clear errors when modal opens or restaurant changes
    setLoading(false);
  }, [restaurantToEdit, isEditing]); // Rerun effect when restaurantToEdit changes

  const handleTagsChange = (newTags) => {
    setTags(newTags);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address) {
      setError('Please fill in Name and Address fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let location = restaurantToEdit?.location; // Keep existing location if editing and address hasn't changed

      // Only fetch new coordinates if address changed or adding new
      if (!isEditing || address !== restaurantToEdit.address) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          location = { lat: parseFloat(lat), lng: parseFloat(lon) };
        } else {
          setError('Address not found. Please enter a valid address.');
          setLoading(false);
          return;
        }
      }

      const restaurantData = {
        ...(isEditing ? restaurantToEdit : {}), // Include existing data if editing
        name: name.trim(),
        address: address.trim(),
        location: location,
        tags: tags, // Add the selected tags
      };

      await onSubmit(restaurantData); // Call the appropriate service function (add or update)
      onClose(); // Close modal on success

    } catch (err) {
      console.error("Error submitting restaurant form:", err);
      setError(err.message || 'Error saving restaurant. Please try again.');
      toast.error(`Error: ${err.message || 'Could not save restaurant.'}`); // Show toast on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
        <h3 style={{ textAlign: 'center', marginTop: 0, marginBottom: '20px', color: '#00bcd4' }}>{title}</h3>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Restaurant Name (e.g., Dogtown)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Street Address (e.g., 691 Monroe Ave)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <TagSelector selectedTags={tags} onTagsChange={handleTagsChange} />

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Restaurant')}
          </Button>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default RestaurantFormModal;
