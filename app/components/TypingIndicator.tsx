import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-card text-card-foreground px-4 py-3 rounded-2xl rounded-bl-md message-shadow">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator; 