import React, { useState, useEffect } from 'react';
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
  align-items: center;
  justify-content: space-between;
`;

const LogoLink = styled.a`
  text-decoration: none;
`;

const Logo = styled.div`
  font-family: 'eracake', sans-serif;
  font-size: 3rem;
  color: #00bcd4;
  cursor: pointer;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const CenterMenu = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: #f5f5f5;
  font-size: 2rem;
  cursor: pointer;
  display: none;
  margin-bottom: 3px;
  margin-right: -5px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  background: rgba(26, 26, 26, 0.8);
  padding: 5px;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
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
    align-items: center;
    width: 100%;
  }
`;

const MobileAuthButtons = styled(AuthButtons)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: auto;
    margin-left: 320px;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileAuthButton = styled(AuthButtons)`
  background: ${(props) => (props.$primary ? '#00bcd4' : 'transparent')};
  color: #f5f5f5;
  border: ${(props) =>
    props.$primary ? 'none' : '1px solid #00bcd4'};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
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

const MobileMenu = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  background: #1a1a1a;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 999;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <NavContainer>
        <LogoLink href="https://foody-rit.web.app/">
          <Logo>Foody</Logo>
        </LogoLink>
        <CenterMenu>
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
        </CenterMenu>
        <RightMenu>
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
        </RightMenu>
        {/* Mobile version: auth buttons to the left of the hamburger menu */}
        <MobileAuthButtons>
          {!isAuthenticated ? (
            <>
              <MobileAuthButton onClick={onShowLogin}>Login</MobileAuthButton>
              <MobileAuthButton $primary onClick={onShowRegister}>
                Register
              </MobileAuthButton>
            </>
          ) : (
            <>
              {userProfile && (
                <UserInfo>Hi, {userProfile.username}!</UserInfo>
              )}
              <MobileAuthButton onClick={onLogout}>Logout</MobileAuthButton>
            </>
          )}
        </MobileAuthButtons>
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
        </MobileMenu>
      )}
    </>
  );
};

export default Navbar;
