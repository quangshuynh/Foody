import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: 20px 0;
`;

const RecommendedItem = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
`;

function RecommendedRestaurants({ recommendedRestaurants }) {
  return (
    <Container>
      {recommendedRestaurants.length === 0 ? (
        <p>Loading recommended restaurants...</p>
      ) : (
        recommendedRestaurants.map((restaurant) => (
          <RecommendedItem key={restaurant.id}>
            <h3>{restaurant.name}</h3>
            {restaurant.address && <p>{restaurant.address}</p>}
          </RecommendedItem>
        ))
      )}
    </Container>
  );
}

export default RecommendedRestaurants;
