import React, { useState } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  padding: 12px;
  width: 60%;
  max-width: 500px;
  border: 2px solid #00bcd4;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #262626;
  color: #f5f5f5;
  font-size: 1rem;
`;

function SearchBar({ searchRestaurants }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchRestaurants(value);
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Search local restaurants in Rochester, NY..."
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
}

export default SearchBar;
