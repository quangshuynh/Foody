import React from 'react';
import StarRatingComponent from 'react-star-rating-component';

function Rating({ rating, onRatingChange }) {
  return (
    <div>
      <StarRatingComponent
        name="restaurantRating"
        starCount={5}
        value={rating}
        onStarClick={onRatingChange}
      />
    </div>
  );
}

export default Rating;
