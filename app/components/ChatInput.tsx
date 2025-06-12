import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-card/50 backdrop-blur-sm border-t border-border">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 rounded-full border-border/50 bg-background/70 focus:bg-background transition-colors"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 transition-opacity shadow-sm"
      >
        <Send size={16} />
      </Button>
    </form>
  );
};

export default ChatInput; 