import React, { useState } from 'react';
import styled from 'styled-components';

const Title = styled.h3`
  font-family: 'Circular-Bold', sans-serif;
`;

const FormContainer = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
`;

const Input = styled.input`
  padding: 12px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  width: calc(100% - 24px);
  font-size: 1rem;
  background: #262626;
  color: #f5f5f5;
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

function AddRestaurant({ addRestaurant }) {
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
          rating: 0,
          goAgain: false,
        };
        addRestaurant(newRestaurant);
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
      <Title>Add a Restaurant</Title>
      {error && <p style={{ color: '#ff4081' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="Restaurant Name (e.g., Dogtown)" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          type="text"
          placeholder="Street Address (e.g., 691 Monroe Ave)" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Restaurant'}
        </Button>
      </form>
    </FormContainer>
  );
}

export default AddRestaurant;
