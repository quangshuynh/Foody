import React from 'react';
import RestaurantItem from './RestaurantItem';
import styled from 'styled-components';

const ListContainer = styled.div`
  margin: 20px 0;
`;

function RestaurantList({ restaurants, updateRestaurant, removeRestaurant }) {
  return (
    <ListContainer>
      {restaurants.map((restaurant) => (
        <RestaurantItem
          key={restaurant.id}
          restaurant={restaurant}
          updateRestaurant={updateRestaurant}
          removeRestaurant={removeRestaurant}
        />
      ))}
    </ListContainer>
  );
}

export default RestaurantList;
import React from 'react';
import RestaurantItem from './RestaurantItem';
import styled from 'styled-components';

const ListContainer = styled.div`
  margin: 20px 0;
`;

function RestaurantList({ restaurants, updateRestaurant, removeRestaurant, isPoopMode }) {
  return (
    <ListContainer>
      {restaurants.map((restaurant) => (
        <RestaurantItem
          key={restaurant.id}
          restaurant={isPoopMode ? {
            ...restaurant,
            name: "Poop",
            address: "123 Poop Ave"
          } : restaurant}
          updateRestaurant={updateRestaurant}
          removeRestaurant={removeRestaurant}
        />
      ))}
      {restaurants.length === 0 && (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '20px', 
          borderRadius: '8px', 
          margin: '15px auto',
          width: '80%',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          No restaurants found
        </div>
      )}
    </ListContainer>
  );
}

export default RestaurantList;
