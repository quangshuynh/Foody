import React from 'react';
import styled from 'styled-components';
import { FaTrash } from 'react-icons/fa';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  svg {
    cursor: pointer;
    color: #00bcd4;
    transition: color 0.3s;
    &:hover {
      color: #00a1b5;
    }
  }
`;

function VisitItem({ restaurant, removeToVisit }) {
  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeToVisit(restaurant.id);
    }
  };

  return (
    <ItemContainer>
      <IconContainer>
        <FaTrash onClick={handleRemove} title="Remove" />
      </IconContainer>
      <h3>{restaurant.name}</h3>
      {restaurant.address && <p>{restaurant.address}</p>}
    </ItemContainer>
  );
}

export default VisitItem;
