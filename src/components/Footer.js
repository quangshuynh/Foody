import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  margin-top: 40px;
  padding: 10px;
  background: #262626;
  color: #00bcd4;
  border-radius: 5px;
  font-size: 0.9rem;
  text-align: center;
`;

const StyledLink = styled.a`
  color: #00bcd4;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

function Footer() {
  return (
    <FooterWrapper>
      © {new Date().getFullYear()}{' '}
      <StyledLink href="https://quangshuynh.github.io/portfolio/" target="_blank" rel="noopener noreferrer">
        Quang H.
      </StyledLink>{' '}
      &{' '}
      <StyledLink href="https://www.linkedin.com/in/olivier-couthaud/" target="_blank" rel="noopener noreferrer">
        Olivier C.
      </StyledLink>
    </FooterWrapper>
  );
}

export default Footer;
