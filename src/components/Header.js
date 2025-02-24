import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #262626, #1f1f1f);
  padding: 30px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
`;

const NavbarContainer = styled.div`
  align-self: stretch;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-family: 'eracake', sans-serif;
  font-size: 3.5rem;
  color: #00bcd4;
  text-align: center;
  margin: 0;
`;

function Header({ title, selectedSection, setSelectedSection, onShowLogin, onShowRegister, onLogout }) {
  return (
    <HeaderWrapper>
      <NavbarContainer>
        <Navbar
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          onShowLogin={onShowLogin}
          onShowRegister={onShowRegister}
          onLogout={onLogout}
        />
      </NavbarContainer>
      <Title>{title}</Title>
    </HeaderWrapper>
  );
}

export default Header;
