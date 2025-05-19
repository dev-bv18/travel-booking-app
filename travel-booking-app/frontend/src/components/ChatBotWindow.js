import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const ChatBotWindow = () => {
  const [messages, setMessages] = useState([
    { text: 'Hi! 👋 Ask me anything ✈️', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [showIntentPicker, setShowIntentPicker] = useState(true);
  const messagesEndRef = useRef(null);

  const sendMessage = async (customInput = null) => {
    const messageText = customInput || input.trim();
    if (!messageText) return;

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowIntentPicker(false);

    try {
      const loadingMessage = { text: 'Typing...', sender: 'bot', loading: true };
      setMessages(prev => [...prev, loadingMessage]);

      const userId = localStorage.getItem('user-id');

      const res = await axios.post('http://localhost:5006/custom-nlp', {
        message: messageText,
        userId: userId
      });

      setTimeout(() => {
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages.pop(); // remove Typing...
          return [...updatedMessages, { text: res.data.reply, sender: 'bot' }];
        });
      }, 800);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { text: 'Oops, something went wrong. 🚫', sender: 'bot' }
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const intentOptions = [
    '🔍 Search Packages',
    '📋 Check Booking',
    '💳 Payment Help',
    '❓ FAQs'
  ];

  return (
    <ChatWrapper>
      <ChatWindow>
        <Messages>
          {showIntentPicker && (
            <IntentContainer>
              <IntroText>Choose an option to begin:</IntroText>
              {intentOptions.map((intent, index) => (
                <IntentButton key={index} onClick={() => sendMessage(intent)}>
                  {intent}
                </IntentButton>
              ))}
            </IntentContainer>
          )}

          {messages.map((msg, i) => (
            <Message key={i} isUser={msg.sender === 'user'}>
              {msg.loading ? <TypingLoader>🌀 Typing...</TypingLoader> : msg.text}
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </Messages>

        <InputContainer>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <SendButton onClick={() => sendMessage()}>➤</SendButton>
        </InputContainer>
      </ChatWindow>
    </ChatWrapper>
  );
};

export default ChatBotWindow;

// ---------------- Styled Components ----------------

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ChatWrapper = styled.div`
  position: absolute;
  bottom: 220px; /* ⬆️ was 200px, now increased */
  right: 0;
  z-index: 1000;
`;


const ChatWindow = styled.div`
  width: 400px;
  height: 450px;
  background: linear-gradient(to bottom right, #f0f8ff, #e6f7ff);
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Messages = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div`
  background: ${({ isUser }) => (isUser ? '#dcf8c6' : '#ffffff')};
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 80%;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.3s ease forwards;
  white-space: pre-wrap;
`;

const TypingLoader = styled.div`
  font-style: italic;
  color: gray;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  background: white;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border-radius: 25px;
  border: 1px solid #ccc;
  margin-right: 10px;
  outline: none;
  font-size: 1rem;
`;

const SendButton = styled.button`
  background: teal;
  color: white;
  border: none;
  padding: 0 18px;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: darkcyan;
  }
`;

const IntentContainer = styled.div`
  background: #ffffff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const IntentButton = styled.button`
  background: teal;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darkcyan;
  }
`;

const IntroText = styled.p`
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  margin-bottom: 5px;
`;
