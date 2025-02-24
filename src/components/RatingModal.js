import React, { useState } from 'react';
import styled from 'styled-components';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const StarContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
`;

const Button = styled.button`
  background: ${props => props.primary ? '#00bcd4' : '#ff4081'};
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  &:hover {
    opacity: 0.9;
  }
`;

function RatingModal({ onSubmit, onClose, currentRating = 0 }) {
  const [rating, setRating] = useState(currentRating);
  const [wouldReturn, setWouldReturn] = useState(true);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(rating, wouldReturn, comment);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Rate this Restaurant</h3>
        <StarContainer>
          {[1, 2, 3, 4, 5].map(value => (
            <FaStar
              key={value}
              size={30}
              color={value <= rating ? '#ffd700' : '#4a4a4a'}
              style={{ cursor: 'pointer' }}
              onClick={() => setRating(value)}
            />
          ))}
        </StarContainer>
        <div>
          <Button 
            onClick={() => setWouldReturn(true)}
            primary={wouldReturn}
          >
            <FaThumbsUp /> Would Return
          </Button>
          <Button 
            onClick={() => setWouldReturn(false)}
            primary={!wouldReturn}
          >
            <FaThumbsDown /> Would Not Return
          </Button>
        </div>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your comment (optional)..."
        />
        <div style={{ marginTop: '20px' }}>
          <Button primary onClick={handleSubmit}>Submit Rating</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

export default RatingModal;
