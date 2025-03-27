import React from 'react';
import styled from 'styled-components';
import AddToVisit from './AddToVisit';
import VisitItem from './VisitItem';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  margin: 20px 0;
`;

// Added updateToVisit prop
function RestaurantsToVisit({ restaurantsToVisit, addToVisit, removeToVisit, updateToVisit }) {
  const { isAuthenticated } = useAuth();

  return (
    <Container>
      {isAuthenticated && <AddToVisit addToVisit={addToVisit} />}
      {restaurantsToVisit.map((restaurant) => (
        <VisitItem
          key={restaurant.id}
          restaurant={restaurant}
          removeToVisit={isAuthenticated ? removeToVisit : null} // Ensure functions are passed only if authenticated
          updateToVisit={isAuthenticated ? updateToVisit : null} // Pass update function
        />
      ))}
    </Container>
  );
}

export default RestaurantsToVisit;
