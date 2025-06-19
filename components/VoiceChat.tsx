import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VoiceChatProps {
  vapiApiKey?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ vapiApiKey }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Fred, your AI companion. I'm here to listen and support you through our conversation. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartCall = async () => {
    if (!vapiApiKey) {
      setError("Please provide your Vapi AI API key to start the voice chat.");
      return;
    }

    setError(null);
    console.log("Starting Vapi call with API key:", vapiApiKey);
    setIsActive(true);
    setIsListening(true);
    
    // Simulate conversation flow for demo
    setTimeout(() => {
      setIsListening(false);
      setIsSpeaking(true);
      
      setTimeout(() => {
        setIsSpeaking(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "I understand. It sounds like you're going through a challenging time. Would you like to talk more about what's been on your mind?",
          isUser: false,
          timestamp: new Date()
        }]);
      }, 2000);
    }, 3000);
  };

  const handleEndCall = () => {
    setIsListening(false);
    setIsSpeaking(false);
    setIsActive(false);
    setCurrentTranscript('');
    console.log("Ending Vapi call");
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Floating background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flowing-ellipse absolute top-10 left-10 w-32 h-20 opacity-30"></div>
        <div className="flowing-ellipse-alt absolute top-32 right-16 w-24 h-40 opacity-20"></div>
        <div className="flowing-ellipse absolute bottom-20 left-1/3 w-40 h-24 opacity-25"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Central Logo/Control */}
        <div className="flex justify-center mb-8 mt-8">
          {!isActive ? (
            // Initial single circle state
            <div 
              onClick={handleStartCall}
              className="w-20 h-20 bg-brand-tertiary rounded-full cursor-pointer transition-all duration-500 hover:scale-110 flex items-center justify-center group"
            >
              <div className="w-16 h-16 bg-brand-secondary rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>
          ) : (
            // Active ellipsis logo state
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-16 h-16 rounded-full transition-all duration-700 ${
                isListening ? 'bg-brand-secondary listening-pulse' :
                isSpeaking ? 'bg-brand-highlight speaking-pulse' :
                'bg-brand-tertiary'
              }`}></div>
              <div className={`w-16 h-16 rounded-full transition-all duration-700 delay-150 ${
                isListening ? 'bg-brand-secondary listening-pulse' :
                isSpeaking ? 'bg-brand-highlight speaking-pulse' :
                'bg-brand-tertiary'
              }`}></div>
              <div className={`w-16 h-16 rounded-full transition-all duration-700 delay-300 ${
                isListening ? 'bg-brand-secondary listening-pulse' :
                isSpeaking ? 'bg-brand-highlight speaking-pulse' :
                'bg-brand-tertiary'
              }`}></div>
            </div>
          )}
        </div>

        {/* Conversation History - Only show when active */}
        {isActive && (
          <div className="flex-1 overflow-hidden mb-6">
            <Card className="h-full bg-white/60 backdrop-blur-sm border-brand-tertiary">
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.isUser
                          ? 'bg-brand-secondary text-white'
                          : 'bg-white border border-brand-tertiary text-brand-primary'
                      }`}
                    >
                      <p className="font-inter text-sm leading-relaxed">{message.text}</p>
                      <span className={`text-xs mt-1 block ${
                        message.isUser ? 'text-white/70' : 'text-brand-tertiary'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Live transcript */}
                {currentTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-brand-secondary/50 border border-brand-secondary">
                      <p className="font-inter text-sm text-brand-primary italic">{currentTranscript}</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </Card>
          </div>
        )}

        {/* End Chat Button - Only show when active */}
        {isActive && (
          <div className="flex justify-center">
            <Button
              onClick={handleEndCall}
              variant="outline"
              className="border-brand-tertiary text-brand-primary hover:bg-brand-tertiary/20 px-6 py-3 rounded-full transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              End Chat
            </Button>
          </div>
        )}

        {/* Demo buttons for testing - Only show when active */}
        {isActive && (
          <div className="mt-4 flex justify-center space-x-2">
            <Button
              onClick={() => addUserMessage("I've been feeling anxious lately about work.")}
              variant="ghost"
              size="sm"
              className="text-brand-tertiary hover:text-brand-primary"
            >
              Demo: Add User Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChat; 