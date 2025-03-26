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
  font-size: 2.5rem;
  color: #00bcd4;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  margin-right: 20px;
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  background: rgba(26, 26, 26, 0.8);
  padding: 5px;
  border-radius: 8px;
  margin-left: 10px;
`;

const NavItem = styled.button`
  background: ${(props) => props.$active ? 'rgba(0, 188, 212, 0.2)' : 'transparent'};
  border: none;
  color: ${(props) => props.$active ? '#00bcd4' : '#f5f5f5'};
  font-size: 1.1rem;
  margin: 0 10px;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  border-bottom: ${(props) =>
    props.$active ? '3px solid #00bcd4' : '3px solid transparent'};
  transition: all 0.3s ease;
  font-weight: ${(props) => props.$active ? '500' : 'normal'};
  box-shadow: ${(props) => props.$active ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'};
  font-family: 'donutsmatcha', sans-serif;
  letter-spacing: 1px;

  &:hover {
    color: #00bcd4;
    transform: translateY(-2px);
    background: rgba(0, 188, 212, 0.1);
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
  font-family: 'saucetomato', sans-serif;
  letter-spacing: 1px;
  font-weight: 400;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$primary ? '#00a1b5' : 'rgba(0, 188, 212, 0.1)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

// New styled component for username display
const UserInfo = styled.span`
  color: #ccc; /* Lighter color for username */
  margin-right: 15px;
  font-size: 0.95rem;
  font-family: 'CircularSpotifyText-Bold', sans-serif; /* Using an existing font */
  font-weight: 500;
  
  @media (max-width: 600px) {
    margin-right: 0;
    margin-bottom: 5px; /* Add space below on mobile */
    display: block; /* Make it block on mobile */
    text-align: right; /* Align to right on mobile */
  }
`;


const Navbar = ({ selectedSection, setSelectedSection, onShowLogin, onShowRegister, onLogout }) => {
  // Get userProfile along with isAuthenticated
  const { isAuthenticated, userProfile } = useAuth();

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
          <>
            {/* Display username if profile exists */}
            {userProfile && <UserInfo>Hi, {userProfile.username}!</UserInfo>}
            <AuthButton onClick={onLogout}>Logout</AuthButton>
          </>
        )}
      </AuthButtons>
    </NavContainer>
  );
};

export default Navbar;
