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
