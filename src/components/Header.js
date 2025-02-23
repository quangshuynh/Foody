import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  background-color: #262626;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.5);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00bcd4;
  margin: 0;
`;

function Header({ title }) {
  return (
    <HeaderWrapper>
      <Title>{title}</Title>
    </HeaderWrapper>
  );
}

export default Header;
