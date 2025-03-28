import React, { useState } from 'react';
import styled from 'styled-components';
import { tagCategories, getCategoryOrder } from '../config/tagsConfig';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const SelectorContainer = styled.div`
  margin-top: 15px;
  border-top: 1px solid #444;
  padding-top: 15px;
`;

const CategorySection = styled.div`
  margin-bottom: 15px;
`;

const CategoryHeader = styled.button.attrs({ type: 'button' })` // Explicitly set type="button"
  background: none;
  border: none;
  color: #00bcd4;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 5px 0;
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    color: #00a1b5;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  max-height: 200px; /* Limit height */
  overflow-y: auto; /* Allow scrolling if needed */
  padding: 5px;
  background: #202020; /* Slightly different background */
  border-radius: 4px;
`;

const TagButton = styled.button.attrs({ type: 'button' })` // Explicitly set type="button"
  background: ${props => props.$isSelected ? '#00bcd4' : '#4a4a4a'};
  color: ${props => props.$isSelected ? '#1a1a1a' : '#f5f5f5'};
  border: none;
  border-radius: 15px; /* Pill shape */
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, transform 0.1s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);

  &:hover {
    transform: translateY(-1px);
    background: ${props => props.$isSelected ? '#00a1b5' : '#5a5a5a'};
  }
`;

function TagSelector({ selectedTags, onTagsChange }) {
  const [openCategory, setOpenCategory] = useState(null); // Only one category open at a time

  const handleTagClick = (categoryKey, tag) => {
    const currentCategoryTags = selectedTags[categoryKey] || [];
    let updatedCategoryTags;

    if (currentCategoryTags.includes(tag)) {
      updatedCategoryTags = currentCategoryTags.filter(t => t !== tag);
    } else {
      updatedCategoryTags = [...currentCategoryTags, tag];
    }

    // If the updated list is empty, remove the category key entirely
    const updatedTags = { ...selectedTags };
    if (updatedCategoryTags.length === 0) {
      delete updatedTags[categoryKey];
    } else {
      updatedTags[categoryKey] = updatedCategoryTags;
    }

    onTagsChange(updatedTags);
  };

  const toggleCategory = (categoryKey) => {
    setOpenCategory(prev => (prev === categoryKey ? null : categoryKey));
  };

  return (
    <SelectorContainer>
      <h4>Select Tags</h4>
      {getCategoryOrder().map(categoryKey => {
        const category = tagCategories[categoryKey];
        const isOpen = openCategory === categoryKey;
        return (
          <CategorySection key={categoryKey}>
            <CategoryHeader onClick={() => toggleCategory(categoryKey)}>
              {category.name}
              {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </CategoryHeader>
            {isOpen && (
              <TagsContainer>
                {category.tags.map(tag => (
                  <TagButton
                    key={tag}
                    $isSelected={(selectedTags[categoryKey] || []).includes(tag)}
                    onClick={() => handleTagClick(categoryKey, tag)}
                  >
                    {tag}
                  </TagButton>
                ))}
              </TagsContainer>
            )}
          </CategorySection>
        );
      })}
    </SelectorContainer>
  );
}

export default TagSelector;
