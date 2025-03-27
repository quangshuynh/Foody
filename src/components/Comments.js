import React from 'react'; // Removed useState, useEffect
import styled from 'styled-components';
import { FaThumbsUp, FaThumbsDown, FaStar } from 'react-icons/fa';
// Removed userService import

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

function Comments({ comments }) {
  // Removed username fetching state and effect

  // Helper to format Firestore Timestamp or ISO string date
  const formatDate = (dateInput) => {
    if (!dateInput) return 'Unknown date';
    // Check if it's a Firestore Timestamp
    if (dateInput.toDate) {
      return dateInput.toDate().toLocaleString();
    }
    // Otherwise, assume it's an ISO string or Date object
    return new Date(dateInput).toLocaleString();
  };

  return (
    <CommentsContainer>
      <h4>Comments</h4>
      {/* Removed loading indicator */}
      {comments && comments.length > 0 ? (
        comments.map((comment, index) => {
          // Display email directly, fallback to generic user ID
          const displayName = comment.userEmail || `User (${comment.userId?.substring(0, 6)}...)`;
          return (
            <CommentItem key={index}>
              <strong>{displayName}</strong> - {formatDate(comment.date)}
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} color={star <= comment.rating ? '#ffd700' : '#4a4a4a'} />
                ))}
              </div>
              {comment.comment && <p>{comment.comment}</p>}
              {comment.wouldReturn ? (
                <FaThumbsUp color="#00bcd4" title="Would Return" />
              ) : (
                <FaThumbsDown color="#ff4081" title="Would Not Return" />
              )}
            </CommentItem>
          );
        })
      ) : (
        <p>No comments yet.</p>
      )}
      {/* Removed duplicated closing block below */}
    </CommentsContainer>
  );
}

export default Comments;
