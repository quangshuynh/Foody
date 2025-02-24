import React, { useState } from 'react';
import styled from 'styled-components';

const RatingContainer = styled.div`
  margin: 10px 0;
`;

const RatingButton = styled.button`
  background: #00bcd4;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 5px;
  &:hover {
    background: #00a1b5;
  }
`;

const RatingDisplay = styled.span`
  margin-right: 10px;
  color: #f5f5f5;
`;

function Rating({ rating, onRatingChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(rating);

  const handleRatingClick = (value) => {
    setTempRating(value);
  };

  const handleSave = () => {
    onRatingChange(tempRating);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <RatingContainer>
        {[1, 2, 3, 4, 5].map((value) => (
          <RatingButton
            key={value}
            onClick={() => handleRatingClick(value)}
            style={{ background: tempRating === value ? '#00a1b5' : '#00bcd4' }}
          >
            {value}
          </RatingButton>
        ))}
        <RatingButton onClick={handleSave}>Save</RatingButton>
        <RatingButton onClick={() => setIsEditing(false)}>Cancel</RatingButton>
      </RatingContainer>
    );
  }

  return (
    <RatingContainer>
      <RatingDisplay>Rating: {rating}/5</RatingDisplay>
      <RatingButton onClick={() => setIsEditing(true)}>Change Rating</RatingButton>
    </RatingContainer>
  );
}

export default Rating;
