import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const NavContainer = styled.nav`
  background-color: #1a1a1a;
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-family: 'eracake', sans-serif;
  font-size: 3rem;
  color: #00bcd4;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: #f5f5f5;
  font-size: 2rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopMenu = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div`
  background: #1a1a1a;
  width: 100%;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  background: rgba(26, 26, 26, 0.8);
  padding: 5px;
  border-radius: 8px;
  margin-left: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    margin: 0;
  }
`;

const NavItem = styled.button`
  background: ${(props) =>
    props.$active ? 'rgba(0, 188, 212, 0.2)' : 'transparent'};
  border: none;
  color: ${(props) => (props.$active ? '#00bcd4' : '#f5f5f5')};
  font-size: 1.1rem;
  margin: 0 10px;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  border-bottom: ${(props) =>
    props.$active ? '3px solid #00bcd4' : '3px solid transparent'};
  transition: all 0.3s ease;
  font-weight: ${(props) => (props.$active ? '500' : 'normal')};
  box-shadow: ${(props) =>
    props.$active ? '0 2px 4px rgba(0, 0, 0, 0.3)' : 'none'};
  font-family: 'donutsmatcha', sans-serif;
  letter-spacing: 1px;

  &:hover {
    color: #00bcd4;
    transform: translateY(-2px);
    background: rgba(0, 188, 212, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    margin: 5px 0;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: center;
  }
`;

const AuthButton = styled.button`
  background: ${(props) => (props.$primary ? '#00bcd4' : 'transparent')};
  color: #f5f5f5;
  border: ${(props) =>
    props.$primary ? 'none' : '1px solid #00bcd4'};
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: 'saucetomato', sans-serif;
  letter-spacing: 1px;
  font-weight: 400;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$primary ? '#00a1b5' : 'rgba(0, 188, 212, 0.1)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const UserInfo = styled.span`
  color: #00bcd4;
  margin-right: 15px;
  font-size: 1.05rem;
  font-family: 'saucetomato', sans-serif;
  font-weight: 500;
  
  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const Navbar = ({
  selectedSection,
  setSelectedSection,
  onShowLogin,
  onShowRegister,
  onLogout,
}) => {
  const { isAuthenticated, userProfile } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <NavContainer>
        <Logo>Foody</Logo>
        <DesktopMenu>
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
                <AuthButton $primary onClick={onShowRegister}>
                  Register
                </AuthButton>
              </>
            ) : (
              <>
                {userProfile && (
                  <UserInfo>Hi, {userProfile.username}!</UserInfo>
                )}
                <AuthButton onClick={onLogout}>Logout</AuthButton>
              </>
            )}
          </AuthButtons>
        </DesktopMenu>
        <HamburgerButton onClick={toggleMobileMenu}>
          ☰
        </HamburgerButton>
      </NavContainer>
      {isMobileMenuOpen && (
        <MobileMenu>
          <NavItems>
            <NavItem
              $active={selectedSection === 'visited'}
              onClick={() => {
                setSelectedSection('visited');
                setMobileMenuOpen(false);
              }}
            >
              Visited
            </NavItem>
            <NavItem
              $active={selectedSection === 'toVisit'}
              onClick={() => {
                setSelectedSection('toVisit');
                setMobileMenuOpen(false);
              }}
            >
              To Visit
            </NavItem>
            <NavItem
              $active={selectedSection === 'recommended'}
              onClick={() => {
                setSelectedSection('recommended');
                setMobileMenuOpen(false);
              }}
            >
              Recommended
            </NavItem>
          </NavItems>
          <AuthButtons>
            {!isAuthenticated ? (
              <>
                <AuthButton onClick={onShowLogin}>Login</AuthButton>
                <AuthButton $primary onClick={onShowRegister}>
                  Register
                </AuthButton>
              </>
            ) : (
              <>
                {userProfile && (
                  <UserInfo>Hi, {userProfile.username}!</UserInfo>
                )}
                <AuthButton onClick={onLogout}>Logout</AuthButton>
              </>
            )}
          </AuthButtons>
        </MobileMenu>
      )}
    </>
  );
};

export default Navbar;
