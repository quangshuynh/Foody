import React from 'react';
import RestaurantItem from './RestaurantItem';
import styled from 'styled-components';

const ListContainer = styled.div`
  margin: 20px 0;
`;

function getRandomPoopAddress() {
  const randomNumber = Math.floor(Math.random() * 99999) + 1;
  const streetNames = ["Poop", "Doo-doo", "Poo", "Dung", "Caca"];
  const streetSuffixes = ["Ave", "St", "Rd", "Blvd", "Way", "Lane"];
  const randomStreetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const randomStreetSuffix = streetSuffixes[Math.floor(Math.random() * streetSuffixes.length)];
  return `${randomNumber} ${randomStreetName} ${randomStreetSuffix}`;
}

function getRandomPoopRestaurantName() {
  const adjectives = [
    "Stinky", "Smelly", "Funky", "Mushy", "Gross", "Foul",
    "Pungent", "Odorous", "Rank", "Noxious", "Putrid",
    "Moldy", "Slimy", "Fetid", "Stenchy", "Noisome", "Rancid",
    "Gag-worthy", "Revolting", "Disgusting", "Sordid", "Vile", "Moist"
  ];
  const names = [
    "Palace", "Tavern", "Bistro", "Cafe", "Diner", "Joint",
    "Grill", "Eatery", "Kitchen", "Lounge", "Pit", "Bar",
    "Stop", "Shack", "House", "Corner", "Spot", "Depot",
    "Station", "Canteen", "Buffet"
  ];
  
  const wordCount = Math.floor(Math.random() * 3) + 1;
  let parts = [];
  
  for (let i = 0; i < wordCount; i++) {
    if (Math.random() < 0.5) {
      parts.push(adjectives[Math.floor(Math.random() * adjectives.length)]);
    } else {
      parts.push(names[Math.floor(Math.random() * names.length)]);
    }
  }
  
  return parts.join(" ");
}

function RestaurantList({ restaurants, updateRestaurant, removeRestaurant, isPoopMode }) {
  return (
    <ListContainer>
      {restaurants.map((restaurant) => (
        <RestaurantItem
          key={restaurant.id}
          restaurant={isPoopMode ? {
            ...restaurant,
            name: getRandomPoopRestaurantName(),
            address: getRandomPoopAddress()
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
