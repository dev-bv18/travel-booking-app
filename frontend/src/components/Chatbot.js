import React, { useState } from 'react';
import styled from 'styled-components';
import ChatBotWindow from './ChatBotWindow';
import BotIcon from '../assests/rb.png'; 

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BotContainer>
      {isOpen && <ChatBotWindow />}
      <BotWrapper onClick={() => setIsOpen(!isOpen)}>
        <BotImage src={BotIcon} alt="Chatbot" />
      </BotWrapper>
    </BotContainer>
  );
};

export default Chatbot;

// --- Styled Components ---

const BotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
`;

const BotWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const BotImage = styled.img`
  width: 180px;  /* ➡️ Made bigger */
  height: 180px; /* ➡️ Made bigger */
  object-fit: contain;
  animation: float 2.5s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
`;