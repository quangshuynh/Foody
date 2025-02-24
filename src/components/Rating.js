import React from 'react';
import styled from 'styled-components';
import { FaStar } from 'react-icons/fa';

const StarsContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;

const StarIcon = styled(FaStar)`
  color: ${props => props.$filled ? '#ffd700' : '#4a4a4a'};
  margin: 0 2px;
`;

function Rating({ rating }) {
  return (
    <StarsContainer>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon 
          key={star} 
          $filled={star <= rating} 
        />
      ))}
    </StarsContainer>
  );
}

export default Rating;
