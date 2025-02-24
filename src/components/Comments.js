import React, { useState } from 'react';
import styled from 'styled-components';
import { FaThumbsUp, FaThumbsDown, FaStar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const CommentsContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #333;
  border-radius: 8px;
`;

const CommentItem = styled.div`
  padding: 10px;
  margin: 10px 0;
  border-bottom: 1px solid #444;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
`;

const TextArea = styled.textarea`
  background: #262626;
  color: #f5f5f5;
  border: 1px solid #00bcd4;
  border-radius: 5px;
  padding: 10px;
  margin: 5px 0;
`;

const Button = styled.button`
  background: #00bcd4;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #00a1b5;
  }
`;

function Comments({ comments, onAddComment, onUpdateComment }) {
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [wouldReturn, setWouldReturn] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to add a comment');
      return;
    }
    onAddComment({
      userId: user.id,
      username: user.username,
      comment: newComment,
      rating,
      wouldReturn,
      date: new Date().toISOString()
    });
    setNewComment('');
  };

  return (
    <CommentsContainer>
      <h4>Comments</h4>
      {comments.map((comment, index) => (
        <CommentItem key={index}>
          <strong>{comment.username}</strong> - {new Date(comment.date).toLocaleDateString()}
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} color={star <= comment.rating ? '#ffd700' : '#4a4a4a'} />
            ))}
          </div>
          <p>{comment.comment}</p>
          {comment.wouldReturn ? (
            <FaThumbsUp color="#00bcd4" />
          ) : (
            <FaThumbsDown color="#ff4081" />
          )}
        </CommentItem>
      ))}
      
      {isAuthenticated && (
        <CommentForm onSubmit={handleSubmit}>
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add your comment..."
          />
          <div>
            Rating:
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                style={{ cursor: 'pointer', marginRight: '5px' }}
                color={star <= rating ? '#ffd700' : '#4a4a4a'}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <div>
            <Button type="button" onClick={() => setWouldReturn(!wouldReturn)}>
              {wouldReturn ? <FaThumbsUp /> : <FaThumbsDown />}
              {wouldReturn ? ' Would Return' : ' Would Not Return'}
            </Button>
          </div>
          <Button type="submit">Add Comment</Button>
        </CommentForm>
      )}
    </CommentsContainer>
  );
}

export default Comments;
