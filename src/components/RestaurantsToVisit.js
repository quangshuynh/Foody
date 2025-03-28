import React from 'react';
import styled from 'styled-components';
// Removed AddToVisit import
import VisitItem from './VisitItem';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  margin: 20px 0;
`;

// Removed addToVisit, updateToVisit props, added openEditModal
function RestaurantsToVisit({ restaurantsToVisit, removeToVisit, openEditModal, isPoopMode }) {
  const { isAuthenticated } = useAuth();

  // Poop mode logic similar to RestaurantList
  let uniqueNames = [];
  let uniqueAddresses = [];
  if (isPoopMode) {
    let availableAdjectives = [
      "Stinky", "Smelly", "Funky", "Mushy", "Gross", "Foul",
      "Pungent", "Odorous", "Rank", "Noxious", "Putrid",
      "Moldy", "Slimy", "Fetid", "Stenchy", "Noisome", "Rancid",
      "Gag-worthy", "Revolting", "Disgusting", "Sordid", "Vile", "Moist",
      "Musty", "Spoiled", "Tainted", "Contaminated", "Yucky", "Icky",
      "Nasty", "Horrid", "Ghastly", "Grimy", "Filthy", "Mucky",
      "Scummy", "Polluted", "Defiled", "Soiled", "Feculent", "Putrescent",
      "Mephitic", "Miasmic", "Pesty", "Sickening", "Offensive", "Unpleasant",
      "Repugnant", "Abominable", "Loathsome", "Obnoxious", "Cringey", "Barf"
    ];
    let availableNouns = [
      "Dumpster", "Sewer", "Latrine", "Outhouse", "Swamp", "Bog",
      "Cesspool", "Gutter", "Trashcan", "Landfill", "Compost", "Manure",
      "Sludge", "Slime", "Gunk", "Muck", "Grime", "Scum",
      "Dregs", "Refuse", "Garbage", "Waste", "Effluent", "Excrement",
      "Vomit", "Bile", "Phlegm", "Snot", "Pus", "Boil",
      "Fungus", "Mildew", "Mold", "Bacteria", "Germs", "Virus",
      "Infestation", "Plague", "Scourge", "Blight", "Cancer", "Rot",
      "Decay", "Decomposition", "Putrefaction", "Fetor", "Stench", "Odor",
      "Reek", "Fart", "Burp", "Poop", "Sock", "Shoe", "Foot"
    ];

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    uniqueNames = Array.from({ length: restaurantsToVisit.length }, () => {
      let name;
      do {
        name = `${getRandomElement(availableAdjectives)} ${getRandomElement(availableNouns)}`;
      } while (uniqueNames.includes(name));
      return name;
    });

    uniqueAddresses = Array.from({ length: restaurantsToVisit.length }, () => {
      let address;
      do {
        address = `${getRandomElement(availableAdjectives)} ${getRandomElement(availableNouns)} St`;
      } while (uniqueAddresses.includes(address));
      return address;
    });
  }

 return (
   <Container>
     {/* Removed AddToVisit component */}
     {restaurantsToVisit.map((restaurant, index) => (
       <VisitItem
         key={restaurant.id}
         // Apply poop mode overrides if active
         restaurant={isPoopMode ? { ...restaurant, name: uniqueNames[index], address: uniqueAddresses[index] } : restaurant}
         removeToVisit={isAuthenticated ? removeToVisit : null}
         openEditModal={isAuthenticated ? openEditModal : null} // Pass edit modal trigger
         // Pass updateToVisit prop specifically for rating updates if needed
         // For now, let's assume rating updates are handled within VisitItem or via App.js re-render
       />
     ))}
    </Container>
  );
}

export default RestaurantsToVisit;
