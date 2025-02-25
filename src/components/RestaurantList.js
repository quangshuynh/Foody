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
      if (wordCount === 1) {
        const oneWordOptions = ["Poop", "Doo-doo"];
        const randomIndex = Math.floor(Math.random() * oneWordOptions.length);
        uniqueNames.push(oneWordOptions[randomIndex]);
      } else if (wordCount === 2) {
        const adjectiveIdx = Math.floor(Math.random() * availableAdjectives.length);
        const adjective = availableAdjectives[adjectiveIdx];
        availableAdjectives.splice(adjectiveIdx, 1);

        const nameIdx = Math.floor(Math.random() * availableNames.length);
        const name = availableNames[nameIdx];
        availableNames.splice(nameIdx, 1);

        uniqueNames.push(`${adjective} ${name}`);
      } else if (wordCount === 3) {
        const adjectiveIdx1 = Math.floor(Math.random() * availableAdjectives.length);
        const adjective1 = availableAdjectives[adjectiveIdx1];
        availableAdjectives.splice(adjectiveIdx1, 1);

        const adjectiveIdx2 = Math.floor(Math.random() * availableAdjectives.length);
        const adjective2 = availableAdjectives[adjectiveIdx2];
        availableAdjectives.splice(adjectiveIdx2, 1);

        const nameIdx = Math.floor(Math.random() * availableNames.length);
        const name = availableNames[nameIdx];
        availableNames.splice(nameIdx, 1);

        uniqueNames.push(`${adjective1} ${adjective2} ${name}`);
      }
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
