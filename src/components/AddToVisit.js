import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  width: 80%;
  max-width: 600px;
`;

const Input = styled.input`
  padding: 12px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  width: calc(100% - 24px);
  font-size: 1rem;
`;

const Button = styled.button`
  background: #00bcd4;
  border: none;
  color: #fff;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 10px;
  &:hover {
    background: #00a1b5;
  }
`;

function AddToVisit({ addToVisit }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newRestaurant = {
          name,
          address,
          location: { lat: parseFloat(lat), lng: parseFloat(lon) },
        };
        addToVisit(newRestaurant);
        setName('');
        setAddress('');
      } else {
        setError('Address not found. Please enter a valid address.');
      }
    } catch (err) {
      setError('Error fetching location. Please try again.');
    }
    setLoading(false);
  };

  return (
    <FormContainer>
      <h3>Add a Restaurant to Visit</h3>
      {error && <p style={{ color: '#ff4081' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Restaurant Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          type="text"
          placeholder="Street Address (e.g., 123 Main St, Rochester, NY)" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add to Visit'}
        </Button>
      </form>
    </FormContainer>
  );
}

export default AddToVisit;
