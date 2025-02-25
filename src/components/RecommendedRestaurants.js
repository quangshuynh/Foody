import React from 'react';
import styled from 'styled-components';
import { FiCopy } from 'react-icons/fi';

const Container = styled.div`
  margin: 20px 0;
`;

const RecommendedItem = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
`;

function capitalizeWords(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function RecommendedRestaurants({ recommendedRestaurants }) {
  return (
    <Container>
      {recommendedRestaurants.length === 0 ? (
        <p>Loading recommended restaurants...</p>
      ) : (
        recommendedRestaurants.map((restaurant) => (
          <RecommendedItem key={restaurant.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h3
                style={{
                  fontFamily: "'aligarh', sans-serif",
                  color: '#f5f5f5',
                  fontSize: '1.7rem',
                  letterSpacing: '1px',
                  marginBottom: '2px'
                }}
              >
                {restaurant.name}
              </h3>
            </div>
            {restaurant.address && (
              <p
                style={{
                  fontFamily: "'playfair', sans-serif",
                  fontSize: '1.1rem',
                  color: '#fff',
                  marginTop: '0',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#b4c2fa', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  {capitalizeWords(restaurant.address)}
                </a>
                <FiCopy
                  onClick={() => {
                    navigator.clipboard.writeText(restaurant.address);
                    alert('Address copied to clipboard!');
                  }}
                  title="Copy address to clipboard"
                  style={{ color: '#00bcd4', cursor: 'pointer', marginLeft: '10px', fontSize: '1rem' }}
                />
              </p>
            )}
          </RecommendedItem>
        ))
      )}
    </Container>
  );
}

export default RecommendedRestaurants;
