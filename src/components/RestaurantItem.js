import React, { useState } from 'react';
import styled from 'styled-components';
import Rating from './Rating';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
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

function RestaurantItem({ restaurant, updateRestaurant }) {
  const [localRating, setLocalRating] = useState(restaurant.rating);

  const handleRatingChange = (newRating) => {
    setLocalRating(newRating);
    updateRestaurant({ ...restaurant, rating: newRating });
  };

  const toggleGoAgain = () => {
    updateRestaurant({ ...restaurant, goAgain: !restaurant.goAgain });
  };

  return (
    <ItemContainer>
      <h3>{restaurant.name}</h3>
      {restaurant.address && <p>{restaurant.address}</p>}
      <Rating rating={localRating} onRatingChange={handleRatingChange} />
      <p>{restaurant.goAgain ? 'Would go again!' : 'Not planning a return.'}</p>
      <Button onClick={toggleGoAgain}>
        {restaurant.goAgain ? 'Change to No' : 'Change to Yes'}
      </Button>
    </ItemContainer>
  );
}

export default RestaurantItem;
