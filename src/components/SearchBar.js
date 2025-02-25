import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  width: 100%;
  max-width: 500px;
  border: 2px solid #00bcd4;
  border-radius: 8px;
  background-color: #262626;
  color: #f5f5f5;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #00bcd4;
  }
`;

function SearchBar({ searchRestaurants }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchRestaurants(value);
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search added visited restaurants..."
        value={query}
        onChange={handleSearch}
      />
    </SearchContainer>
  );
}

export default SearchBar;
