import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext'; 

const NavContainer = styled.nav`
  background-color: #1a1a1a;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    padding: 10px 20px;
  }
`;

const Logo = styled.div`
  font-family: 'eracake', sans-serif;
  font-size: 1.8rem;
  color: #00bcd4;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  margin-right: 20px;
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
`;

const NavItem = styled.button`
  background: transparent;
  border: none;
  color: #f5f5f5;
  font-size: 1.1rem;
  margin: 0 10px;
  cursor: pointer;
  padding: 10px 15px;
  border-bottom: ${(props) =>
    props.$active ? '3px solid #00bcd4' : '3px solid transparent'};
  transition: color 0.3s ease, transform 0.3s ease, border-bottom 0.3s ease;

  &:hover {
    color: #00bcd4;
    transform: translateY(-2px);
    border-bottom: 3px solid #00bcd4;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 600px) {
    margin-top: 10px;
  }
`;

const AuthButton = styled.button`
  background: ${props => props.$primary ? '#00bcd4' : 'transparent'};
  color: #f5f5f5;
  border: ${props => props.$primary ? 'none' : '1px solid #00bcd4'};
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.$primary ? '#00a1b5' : 'rgba(0, 188, 212, 0.1)'};
  }
`;

const Navbar = ({ selectedSection, setSelectedSection, onShowLogin, onShowRegister, onLogout }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <NavContainer>
      <Logo>Foody</Logo>
      <NavItems>
        <NavItem
          $active={selectedSection === 'visited'}
          onClick={() => setSelectedSection('visited')}
        >
          Visited
        </NavItem>
        <NavItem
          $active={selectedSection === 'toVisit'}
          onClick={() => setSelectedSection('toVisit')}
        >
          To Visit
        </NavItem>
        <NavItem
          $active={selectedSection === 'recommended'}
          onClick={() => setSelectedSection('recommended')}
        >
          Recommended
        </NavItem>
      </NavItems>
      <AuthButtons>
        {!isAuthenticated ? (
          <>
            <AuthButton onClick={onShowLogin}>Login</AuthButton>
            <AuthButton $primary onClick={onShowRegister}>Register</AuthButton>
          </>
        ) : (
          <AuthButton onClick={onLogout}>Logout</AuthButton>
        )}
      </AuthButtons>
    </NavContainer>
  );
};

export default Navbar;
