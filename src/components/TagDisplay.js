import React from 'react';
import styled from 'styled-components';
import { tagCategories, getCategoryOrder } from '../config/tagsConfig';

const DisplayContainer = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #333; /* Match Comments background */
  border-radius: 8px;
`;

const CategoryTitle = styled.h5`
  color: #00bcd4;
  margin-bottom: 5px;
  margin-top: 10px;
  font-size: 0.9rem;
  border-bottom: 1px solid #444;
  padding-bottom: 3px;
`;

const TagList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagItem = styled.li`
  background: #4a4a4a;
  color: #f5f5f5;
  border-radius: 15px;
  padding: 4px 10px;
  font-size: 0.8rem;
`;

function TagDisplay({ tags }) {
  if (!tags || Object.keys(tags).length === 0) {
    return (
      <DisplayContainer>
        <p>No tags selected.</p>
      </DisplayContainer>
    );
  }

  // Get ordered categories that actually have tags selected
  const relevantCategories = getCategoryOrder().filter(key => tags[key] && tags[key].length > 0);

  return (
    <DisplayContainer>
      <h4>Tags</h4>
      {relevantCategories.map(categoryKey => (
        <div key={categoryKey}>
          <CategoryTitle>{tagCategories[categoryKey].name}</CategoryTitle>
          <TagList>
            {tags[categoryKey].map(tag => (
              <TagItem key={tag}>{tag}</TagItem>
            ))}
          </TagList>
        </div>
      ))}
    </DisplayContainer>
  );
}

export default TagDisplay;
