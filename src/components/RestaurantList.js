import React from 'react';
import RestaurantItem from './RestaurantItem';
import styled from 'styled-components';

const ListContainer = styled.div`
  margin: 20px 0;
`;

function RestaurantList({ restaurants, updateRestaurant, removeRestaurant, isPoopMode }) {
  let uniqueNames = [];
  let uniqueAddresses = [];

  if (isPoopMode) {
    let availableAdjectives = [
      "Stinky", "Smelly", "Funky", "Mushy", "Gross", "Foul",
      "Pungent", "Odorous", "Rank", "Noxious", "Putrid",
      "Moldy", "Slimy", "Fetid", "Stenchy", "Noisome", "Rancid",
      "Gag-worthy", "Revolting", "Disgusting", "Sordid", "Vile", "Moist", 
      "Poopy"
    ];
    let availableNames = [
      "Palace", "Tavern", "Bistro", "Cafe", "Diner", "Joint",
      "Grill", "Eatery", "Kitchen", "Lounge", "Pit", "Bar",
      "Stop", "Shack", "House", "Corner", "Spot", "Depot",
      "Station", "Canteen", "Buffet"
    ];

    restaurants.forEach(() => {
      const wordCount = Math.floor(Math.random() * 3) + 1; 
      let parts = [];
      for (let i = 0; i < wordCount; i++) {
        let useAdjective = Math.random() < 0.5;
        if (useAdjective && availableAdjectives.length === 0) {
          useAdjective = false;
        }
        if (!useAdjective && availableNames.length === 0) {
          useAdjective = true;
        }
        if (useAdjective) {
          const idx = Math.floor(Math.random() * availableAdjectives.length);
          const word = availableAdjectives[idx];
          parts.push(word);
          availableAdjectives.splice(idx, 1);
        } else {
          const idx = Math.floor(Math.random() * availableNames.length);
          const word = availableNames[idx];
          parts.push(word);
          availableNames.splice(idx, 1);
        }
      }
      uniqueNames.push(parts.join(" "));
    });

    const streetNames = ["Poop", "Doo-doo", "Poo", "Dung", "Caca"];
    const streetSuffixes = ["Ave", "St", "Rd", "Blvd", "Way", "Lane"];
    let usedAddresses = new Set();

    restaurants.forEach(() => {
      let address;
      do {
        const randomNumber = Math.floor(Math.random() * 99999) + 1;
        const randomStreetName = streetNames[Math.floor(Math.random() * streetNames.length)];
        const randomStreetSuffix = streetSuffixes[Math.floor(Math.random() * streetSuffixes.length)];
        address = `${randomNumber} ${randomStreetName} ${randomStreetSuffix}`;
      } while (usedAddresses.has(address));
      usedAddresses.add(address);
      uniqueAddresses.push(address);
    });
  }

  return (
    <ListContainer>
      {restaurants.map((restaurant, index) => (
        <RestaurantItem
          key={restaurant.id}
          restaurant={
            isPoopMode
              ? {
                  ...restaurant,
                  name: uniqueNames[index],
                  address: uniqueAddresses[index],
                }
              : restaurant
          }
          updateRestaurant={updateRestaurant}
          removeRestaurant={removeRestaurant}
        />
      ))}
      {restaurants.length === 0 && (
        <div
          style={{
            background: "#2a2a2a",
            padding: "20px",
            borderRadius: "8px",
            margin: "15px auto",
            width: "80%",
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          No restaurants found
        </div>
      )}
    </ListContainer>
  );
}

export default RestaurantList;
