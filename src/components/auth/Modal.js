import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  position: relative;
`;

function Modal({ onClose, children }) {
  const [mouseDownTarget, setMouseDownTarget] = useState(null);

  const handleMouseDown = (e) => {
    setMouseDownTarget(e.target);
  };

  const handleMouseUp = (e) => {
    if (mouseDownTarget === e.currentTarget && e.target === e.currentTarget) {
      onClose();
    }
    setMouseDownTarget(null);
  };

  return (
    <ModalOverlay onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <ModalContent>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
}

export default Modal;
