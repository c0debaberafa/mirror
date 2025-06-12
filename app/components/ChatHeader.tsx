import React from 'react';

const ChatHeader = () => {
  return (
    <div className="p-6 border-b border-border/50 soft-gradient">
      <div className="text-center">
        <h1 className="text-lg font-medium text-foreground mb-1">
          Your AI Companion
        </h1>
        <p className="text-sm text-muted-foreground">
          Here to listen and chat whenever you need
        </p>
      </div>
    </div>
  );
};

export default ChatHeader; 