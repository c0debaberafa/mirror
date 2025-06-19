'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ChatHeader from './components/ChatHeader';
import TypingIndicator from './components/TypingIndicator';
import VapiWidget from '../components/VapiWidget';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface User {
  id: string;
  clerkUserId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastSignInAt?: string;
  isActive: boolean;
  metadata?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // VAPI configuration
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

  // Get the full Clerk user ID
  const clerkUserId = user?.id;
  
  // Fetch user data from database
  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${clerkUserId}`);
        if (response.ok) {
          const userData = await response.json();
          setDbUser(userData);
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [clerkUserId]);

  // Use the database userId if available, otherwise fall back to clerkUserId
  const userId = dbUser?.id || clerkUserId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize with welcome message
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: Message = {
        id: '1',
        text: "Hello! I'm your AI companion. I'm here to listen, chat, and support you. How are you feeling today?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const generateResponse = (): string => {
    const responses = [
      "That sounds really meaningful. Can you tell me more about how that makes you feel?",
      "I appreciate you sharing that with me. It takes courage to open up.",
      "Thank you for trusting me with your thoughts. I'm here to listen.",
      "That's an interesting perspective. What led you to feel that way?",
      "I can sense there's a lot behind what you're saying. Would you like to explore that together?",
      "Your feelings are completely valid. It's okay to feel this way.",
      "I'm grateful you're comfortable sharing this with me. How can I best support you right now?",
      "It sounds like you're processing a lot. Take your time - I'm here with you.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (messageText: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-4xl mx-auto">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isTyping}
      />

      {/* VAPI Widget - only show if API key is configured */}
      {apiKey && assistantId && (
        <VapiWidget 
          apiKey={apiKey}
          assistantId={assistantId}
          userId={userId}
          clerkUserId={clerkUserId}
        />
      )}
    </div>
  );
}
