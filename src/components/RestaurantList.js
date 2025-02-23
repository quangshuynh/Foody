import React from 'react';
import RestaurantItem from './RestaurantItem';
import AddRestaurant from './AddRestaurant';
import styled from 'styled-components';

const ListContainer = styled.div`
  margin: 20px 0;
`;

function RestaurantList({ restaurants, updateRestaurant, addRestaurant }) {
  return (
    <ListContainer>
      <AddRestaurant addRestaurant={addRestaurant} />
      {restaurants.map((restaurant) => (
        <RestaurantItem
          key={restaurant.id}
          restaurant={restaurant}
          updateRestaurant={updateRestaurant}
        />
      ))}
    </ListContainer>
  );
}

export default RestaurantList;
