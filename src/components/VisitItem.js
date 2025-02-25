import React from 'react';
import styled from 'styled-components';
import { FaTrash } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';

const ItemContainer = styled.div`
  background: #2a2a2a;
  margin: 15px auto;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  svg {
    cursor: pointer;
    color: #00bcd4;
    transition: color 0.3s;
    &:hover {
      color: #00a1b5;
    }
  }
`;

const DateText = styled.p`
  font-size: 0.8rem;
  color: #aaa;
`;

function VisitItem({ restaurant, removeToVisit }) {
  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this restaurant?')) {
      removeToVisit(restaurant.id);
    }
  };

  return (
    <ItemContainer>
      <IconContainer>
        <FaTrash onClick={handleRemove} title="Remove" />
      </IconContainer>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ 
              fontFamily: "'aligarh', sans-serif", 
              color: '#f5f5f5', 
              fontSize: '1.7rem',
              letterSpacing: '1px',
              marginBottom: '2px'
            }}>
              {restaurant.name}
            </h3>
          </div>
          {restaurant.address && (
            <p style={{ 
              fontFamily: "'playfair', sans-serif", 
              fontSize: '1.1rem', 
              color: '#fff',
              marginTop: '0',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#b4c2fa', textDecoration: 'none', fontWeight: 'bold' }}>
                {restaurant.address}
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
      {restaurant.dateAdded && (
        <DateText>Added on: {new Date(restaurant.dateAdded).toLocaleString()}</DateText>
      )}
    </ItemContainer>
  );
}

export default VisitItem;
