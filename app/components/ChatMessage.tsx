import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full mb-4 gentle-bounce",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-2xl message-shadow",
        isUser 
          ? "warm-gradient text-white rounded-br-md" 
          : "bg-card text-card-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed">{message}</p>
        {timestamp && (
          <p className={cn(
            "text-xs mt-1 opacity-70",
            isUser ? "text-white" : "text-muted-foreground"
          )}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 