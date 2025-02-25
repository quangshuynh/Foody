import React from 'react';
import styled from 'styled-components';
import AddToVisit from './AddToVisit';
import VisitItem from './VisitItem';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  margin: 20px 0;
`;

function RestaurantsToVisit({ restaurantsToVisit, addToVisit, removeToVisit }) {
  const { isAuthenticated } = useAuth();
  
  return (
    <Container>
      {isAuthenticated && <AddToVisit addToVisit={addToVisit} />}
      {restaurantsToVisit.map((restaurant) => (
        <VisitItem key={restaurant.id} restaurant={restaurant} removeToVisit={removeToVisit} />
      ))}
    </Container>
  );
}

export default RestaurantsToVisit;
