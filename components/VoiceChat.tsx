import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

import Vapi from '@vapi-ai/web';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QueuedMessage {
  timestamp: Date;
  content: {
    type: string;
    role: string;
    transcript: string;
  };
}

interface VoiceChatProps {
  vapiApiKey?: string;
  assistantId?: string;
  userId?: string;
  clerkUserId?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ 
  vapiApiKey,
  assistantId,
  userId,
  clerkUserId
}) => {
  const { toast } = useToast();
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // Used for managing voice chat state updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    firstName: string | null;
    lastName: string | null;
    onboardingArchetypes: string;
    callSummaries: any[];
  } | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user data when component mounts
  useEffect(() => {
    if (clerkUserId) {
      setIsLoadingUserData(true);
      fetch(`/api/users/${clerkUserId}/voice-chat-data`)
        .then(response => response.json())
        .then((data: { firstName: string | null; lastName: string | null; onboardingArchetypes: string; callSummaries: any[] }) => {
          setUserData(data);
        })
        .catch((err: Error) => {
          console.error('Error fetching user data:', err);
          setUserData({
            firstName: null,
            lastName: null,
            onboardingArchetypes: 'No onboarding data available.',
            callSummaries: []
          });
        })
        .finally(() => {
          setIsLoadingUserData(false);
        });
    }
  }, [clerkUserId]);

  useEffect(() => {
    if (vapiApiKey) {
      const vapiInstance = new Vapi(vapiApiKey);
      setVapi(vapiInstance);

      let lastEventTime = Date.now();
      let messageQueue: QueuedMessage[] = [];

      // Event listeners
      vapiInstance.on('call-start', () => {
        const now = Date.now();
        console.log('Call started, time since last event:', now - lastEventTime, 'ms');
        lastEventTime = now;
        setIsActive(true);
        setIsConnecting(false);
        setIsListening(true);
        setCurrentTranscript('');
        messageQueue = []; // Reset queue on new call
      });

      vapiInstance.on('call-end', () => {
        const now = Date.now();
        console.log('Call ended, time since last event:', now - lastEventTime, 'ms');
        lastEventTime = now;
        console.log('Final message queue:', messageQueue);
        setIsActive(false);
        setIsConnecting(false);
        setIsListening(false);
        setIsSpeaking(false);
        setCurrentTranscript('');

        const { id: toastId, update, dismiss } = toast({
          title: "Updating your Living Essay...",
          description: "This will take a few moments.",
        });

        // TODO: Replace with actual webhook event handling
        setTimeout(() => {
          update({
            id: toastId,
            title: "Your Living Essay is ready to view.",
            description: "Click here to view it.", // Making it more actionable
            action: <ToastAction altText="View Essay">View</ToastAction>,
          });

          // Automatically dismiss after a few seconds
          setTimeout(() => {
            dismiss();
          }, 5000);
        }, 5000); // Simulate a 5-second processing time
      });

      vapiInstance.on('speech-start', () => {
        const now = Date.now();
        console.log('Speech started, time since last event:', now - lastEventTime, 'ms');
        lastEventTime = now;
        setIsSpeaking(true);
        setIsListening(false);
      });

      vapiInstance.on('speech-end', () => {
        const now = Date.now();
        console.log('Speech ended, time since last event:', now - lastEventTime, 'ms');
        lastEventTime = now;
        setIsSpeaking(false);
        setIsListening(true);
      });

      vapiInstance.on('message', (message) => {
        const now = Date.now();
        console.log('Message received:', {
          timeSinceLastEvent: now - lastEventTime,
          type: message.type,
          role: message.role,
          transcript: message.transcript,
          raw: message
        });
        lastEventTime = now;

        if (message.type === 'transcript') {
          // Only process messages with actual transcript content
          if (!message.transcript) return;

          messageQueue.push({
            timestamp: new Date(),
            content: message
          });
          
          if (message.role === 'user') {
            console.log('User message queue:', messageQueue.filter(m => m.content.role === 'user'));
            setCurrentTranscript(message.transcript);
          } else {
            console.log('Assistant message queue:', messageQueue.filter(m => m.content.role === 'assistant'));
            
            // Check if this is a new complete message or just an update
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && !message.transcript.includes(lastMessage.text)) {
              // This is a new message, add it to the state
              setMessages(prev => {
                const newMessages = [...prev, {
                  id: Date.now().toString(),
                  text: message.transcript,
                  isUser: false,
                  timestamp: new Date()
                }];
                console.log('Updated messages state:', newMessages);
                return newMessages;
              });
            } else if (!lastMessage) {
              // This is the first message
              setMessages([{
                id: Date.now().toString(),
                text: message.transcript,
                isUser: false,
                timestamp: new Date()
              }]);
            }
            // If it's just an update to the last message, ignore it
            setCurrentTranscript('');
          }
        }
      });

      vapiInstance.on('error', (error) => {
        const now = Date.now();
        console.error('Vapi error:', error, 'time since last event:', now - lastEventTime, 'ms');
        lastEventTime = now;
        setIsConnecting(false);
        setError('An error occurred with the voice chat. Please try again.');
      });

      return () => {
        console.log('Cleaning up Vapi instance, final message queue:', messageQueue);
        vapiInstance?.stop();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vapiApiKey]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleStartCall = async () => {
    if (!vapiApiKey) {
      setError("Please provide your Vapi AI API key to start the voice chat.");
      return;
    }

    if (!assistantId) {
      setError("Please provide a Vapi assistant ID to start the voice chat.");
      return;
    }

    setError(null);
    setIsConnecting(true);
    
    if (vapi) {
      // Format call summaries for the assistant - only use summary field
      const callSummariesText = userData?.callSummaries.length 
        ? userData.callSummaries.map((summary, index) => 
            `Call ${index + 1} (${new Date(summary.createdAt).toLocaleDateString()}):\n${summary.summary || 'No summary available'}`
          ).join('\n\n')
        : 'No previous call summaries available.';

      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          userId: userId || 'anonymous',
          clerkUserId: clerkUserId || 'anonymous',
          user_name: userData?.firstName && userData?.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData?.firstName || userData?.lastName || 'anonymous',
          call_summaries: callSummariesText,
          onboarding_archetypes: userData?.onboardingArchetypes || 'No onboarding data available.',
        },
        metadata: {
          userId: userId,
          clerkUserId: clerkUserId,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          callSummaries: userData?.callSummaries || [],
          onboardingArchetypes: userData?.onboardingArchetypes || '',
        }
      };
      
      vapi.start(assistantId, assistantOverrides);
    }
  };

  const handleEndCall = () => {
    if (vapi) {
      vapi.stop();
    }
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
        <div className="flex flex-col items-center justify-center mb-8 mt-8">
          {!isActive ? (
            // Initial single circle state
            <div 
              onClick={isConnecting || isLoadingUserData ? undefined : handleStartCall}
              className={`w-20 h-20 bg-brand-tertiary rounded-full transition-all duration-500 flex items-center justify-center group ${
                isConnecting || isLoadingUserData
                  ? 'animate-pulse' 
                  : 'cursor-pointer hover:scale-110'
              }`}
            >
              <div className="w-16 h-16 bg-brand-secondary rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            </div>
          ) : (
            <>
              {/* Active ellipsis logo state */}
              <div className="flex items-center justify-center space-x-2 mb-8">
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

              {/* Fred's latest message */}
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-2xl font-light text-brand-primary leading-relaxed">
                  {messages.length > 0 ? messages[messages.length - 1].text : ''}
                </p>
              </div>
            </>
          )}

          {/* Loading indicator for user data */}
          {isLoadingUserData && (
            <div className="mt-4 text-sm text-brand-primary/60">
              Loading your conversation history...
            </div>
          )}
        </div>

        {/* End Chat Button - Only show when active */}
        {isActive && (
          <div className="flex justify-center mt-8">
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
      </div>
    </div>
  );
};

export default VoiceChat; 