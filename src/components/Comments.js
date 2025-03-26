import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaThumbsUp, FaThumbsDown, FaStar } from 'react-icons/fa';
import { getUsernamesByIds } from '../services/userService'; // Import service

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
  const [usernames, setUsernames] = useState({}); // State to store fetched usernames { userId: username }
  const [loadingUsernames, setLoadingUsernames] = useState(false);

  // Fetch usernames when comments change
  useEffect(() => {
    const fetchUsernames = async () => {
      if (!comments || comments.length === 0) {
        setUsernames({}); // Clear usernames if no comments
        return;
      }

      // Extract unique user IDs from comments
      const userIds = [...new Set(comments.map(comment => comment.userId).filter(Boolean))];

      if (userIds.length > 0) {
        setLoadingUsernames(true);
        try {
          const fetchedUsernames = await getUsernamesByIds(userIds);
          setUsernames(fetchedUsernames);
        } catch (error) {
          console.error("Failed to fetch usernames for comments:", error);
          // Keep existing usernames or clear? Decide based on desired behavior.
        } finally {
          setLoadingUsernames(false);
        }
      } else {
        setUsernames({}); // Clear if no valid user IDs found
      }
    };

    fetchUsernames();
  }, [comments]); // Re-run when comments array changes


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
      <h4>Comments</h4>
      {loadingUsernames && <p>Loading usernames...</p>}
      {comments && comments.length > 0 ? (
        comments.map((comment, index) => {
          // Get username from state, fallback to email, then generic user
          const displayName = usernames[comment.userId] || comment.userEmail || `User (${comment.userId?.substring(0, 6)}...)`;
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
