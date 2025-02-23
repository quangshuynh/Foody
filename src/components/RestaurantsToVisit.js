import React from 'react';
import styled from 'styled-components';
import AddToVisit from './AddToVisit';
import VisitItem from './VisitItem';

const Container = styled.div`
  margin: 20px 0;
`;

function RestaurantsToVisit({ restaurantsToVisit, addToVisit, removeToVisit }) {
  return (
    <Container>
      <AddToVisit addToVisit={addToVisit} />
      {restaurantsToVisit.map((restaurant) => (
        <VisitItem key={restaurant.id} restaurant={restaurant} removeToVisit={removeToVisit} />
      ))}
    </Container>
  );
}

export default RestaurantsToVisit;
