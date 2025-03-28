import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCopy } from 'react-icons/fi';

const Container = styled.div`
  margin: 20px auto;
  padding: 20px;
  max-width: 800px;
  background: #1e1e2f;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  color: #f5f5f5;
  font-family: 'Helvetica Neue', sans-serif;
`;

const Form = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
`;

const Button = styled.button`
  background: #00bcd4;
  color: #fff;
  border: none;
  padding: 12px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: #0097a7;
  }
  align-self: center;
  height: fit-content;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: #2a2a2a;
  margin: 15px 0;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RestaurantName = styled.h3`
  font-family: 'Aligarh', sans-serif;
  color: #f5f5f5;
  font-size: 1.7rem;
  letter-spacing: 1px;
  margin-bottom: 10px;
`;

const RestaurantAddress = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #fff;
  margin-top: 0;
  text-align: center;
  a {
    color: #b4c2fa;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s ease;
    &:hover {
      color: #fff;
    }
  }
`;

const RecommendedRestaurants = () => {
  const [zipcode, setZipcode] = useState("14623");
  const [radius, setRadius] = useState("3");
  const [cuisinesInput, setCuisinesInput] = useState("Italian, Chinese, Mexican, Japanese, Indian, American, Thai, French");
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoordinates = async (zip) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!response.ok) throw new Error("Invalid Zip Code");
      const data = await response.json();
      const { latitude, longitude } = data.places[0];
      return { lat: parseFloat(latitude), lon: parseFloat(longitude) };
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return { lat: 43.1566, lon: -77.6088 };
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    const { lat, lon } = await fetchCoordinates(zipcode);
    const userCuisines = cuisinesInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const cuisineRegex = userCuisines.length ? userCuisines.join("|") : "Italian|Chinese|Mexican|Japanese|Indian|American|Thai|French";

    const radiusInMeters = parseFloat(radius) * 1609.34;
    const overpassQuery = `
      [out:json];
      (
        node(around:${radiusInMeters},${lat},${lon})["amenity"="restaurant"]["cuisine"~"${cuisineRegex}",i];
        way(around:${radiusInMeters},${lat},${lon})["amenity"="restaurant"]["cuisine"~"${cuisineRegex}",i];
        relation(around:${radiusInMeters},${lat},${lon})["amenity"="restaurant"]["cuisine"~"${cuisineRegex}",i];
      );
      out center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      const data = await response.json();
      const uniqueRestaurants = Array.from(new Map(data.elements.map(r => [r.id, r])).values());
      const shuffled = uniqueRestaurants.sort(() => 0.5 - Math.random());
      setRecommendedRestaurants(shuffled.slice(0, 5));
    } catch (err) {
      console.error("Error fetching recommended restaurants:", err);
      setError("Failed to fetch restaurants. Please try again.");
    }
    setLoading(false);
  };

  const getAddress = (tags) => {
    if (!tags) return '';
    const { "addr:housenumber": houseNumber, "addr:street": street, "addr:city": city, "addr:state": state, "addr:postcode": postcode } = tags;
    if (!houseNumber && !street && !city && !state && !postcode) return '';
    return `${houseNumber ? houseNumber + ' ' : ''}${street ? street + ', ' : ''}${city ? city + ', ' : ''}${state ? state + ' ' : ''}${postcode ? postcode : ''}`.trim();
  };

  return (
    <Container>
      <Form>
        <InputWrapper>
          <Label htmlFor="zipcode">Zip Code:</Label>
          <Input
            id="zipcode"
            type="text"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
          />
        </InputWrapper>
        <InputWrapper>
          <Label htmlFor="radius">Radius (miles):</Label>
          <Input
            id="radius"
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          />
        </InputWrapper>
        <InputWrapper style={{ flexBasis: '100%' }}>
          <Label htmlFor="cuisines">Cuisines (comma separated):</Label>
          <Input
            id="cuisines"
            type="text"
            value={cuisinesInput}
            onChange={(e) => setCuisinesInput(e.target.value)}
          />
        </InputWrapper>
        <Button onClick={fetchRecommendations}>Randomize Recommendations</Button>
      </Form>
      {loading && <p>Loading recommendations...</p>}
      {error && <p>{error}</p>}
      {!loading && recommendedRestaurants.length === 0 && (
        <p>No recommendations yet. Click the button to randomize!</p>
      )}
      <List>
        {recommendedRestaurants.map((restaurant) => (
          <ListItem key={restaurant.id}>
            <RestaurantName>
              {restaurant.tags && restaurant.tags.name ? restaurant.tags.name : "Unnamed Restaurant"}
            </RestaurantName>
            {getAddress(restaurant.tags) && (
              <RestaurantAddress>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.tags && restaurant.tags.name ? restaurant.tags.name : "")} ${encodeURIComponent(getAddress(restaurant.tags))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getAddress(restaurant.tags)}
                </a>
                <FiCopy
                  onClick={() => {
                    navigator.clipboard.writeText(getAddress(restaurant.tags));
                    alert('Address copied to clipboard!');
                  }}
                  title="Copy address to clipboard"
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                />
              </RestaurantAddress>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default RecommendedRestaurants;
