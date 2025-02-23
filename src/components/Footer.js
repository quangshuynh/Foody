import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  margin-top: 40px;
  padding: 10px;
  background: #262626;
  color: #00bcd4;
  border-radius: 5px;
  font-size: 0.9rem;
`;

function Footer() {
  return (
    <FooterWrapper>
      © {new Date().getFullYear()} <strong>Quang Huynh</strong>
    </FooterWrapper>
  );
}

export default Footer;
