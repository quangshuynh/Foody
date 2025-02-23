import React from 'react';
import styled from 'styled-components';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
`;

function VisitItem({ restaurant }) {
  return (
    <ItemContainer>
      <h3>{restaurant.name}</h3>
      {restaurant.address && <p>{restaurant.address}</p>}
    </ItemContainer>
  );
}

export default VisitItem;
