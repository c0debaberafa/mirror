'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceChat from '@/components/VoiceChat';
import LivingEssay from '../../../components/LivingEssay';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCachedUserData, useCachedTidbits } from '@/hooks/use-cached-data';
import { CacheInvalidator } from '@/components/CacheInvalidator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface Tidbit {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  lastUsedAt: string;
  relevanceScore: number;
}

// Helper function to get tidbit type emoji
const getTidbitTypeEmoji = (type: string): string => {
  const typeMap: Record<string, string> = {
    Mood: '😌',
    Focus: '🎯',
    Value: '💎',
    Tension: '⚡',
    Joy: '✨',
    Future: '🔮',
    Echo: '🔄',
    Shift: '🔄',
  }
  
  return typeMap[type] || '💭'
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('voice-chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldInvalidateCache, setShouldInvalidateCache] = useState(false);
  const { user } = useUser();

  // VAPI configuration
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

  // Get the full Clerk user ID
  const clerkUserId = user?.id;
  
  // Use cached data hooks
  const { data: dbUser } = useCachedUserData(clerkUserId);
  const { data: tidbits, isLoading: isLoadingTidbits } = useCachedTidbits(clerkUserId);

  // Use the database userId if available, otherwise fall back to clerkUserId
  const userId = dbUser?.id || clerkUserId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Handle cache invalidation after call ends
  const handleCallEnded = () => {
    setShouldInvalidateCache(true);
    // Reset the trigger after a short delay
    setTimeout(() => setShouldInvalidateCache(false), 100);
  };

  return (
    <div className="min-h-screen bg-brand-background relative">
      {/* Cache Invalidator - handles cache invalidation when new data is available */}
      <CacheInvalidator 
        clerkUserId={clerkUserId}
        trigger={shouldInvalidateCache}
        onInvalidated={() => console.log('Caches invalidated successfully')}
      />

      {/* Background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flowing-ellipse absolute -top-20 -left-20 w-64 h-32 opacity-10"></div>
        <div className="flowing-ellipse-alt absolute top-1/4 -right-32 w-48 h-72 opacity-8"></div>
        <div className="flowing-ellipse absolute bottom-10 left-1/4 w-56 h-28 opacity-12"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Message with Tidbits */}
        {clerkUserId && (
          <Card className="mb-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Welcome back, {user?.firstName || 'there'}! 👋
              </CardTitle>
              <CardDescription className="text-center">
                Revisit these insights from your past conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {isLoadingTidbits ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-left p-3 bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg border border-brand-tertiary/20 animate-pulse">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : tidbits && tidbits.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {tidbits.map((tidbit: Tidbit) => (
                    <div key={tidbit.id} className="text-left p-3 bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg border border-brand-tertiary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTidbitTypeEmoji(tidbit.type)}</span>
                        <span className="font-medium text-brand-primary">{tidbit.type}</span>
                      </div>
                      <div className="text-gray-700 leading-relaxed">{tidbit.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-xs">
                  No insights yet. Speak with Fred to generate your first insights!
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs 
          defaultValue="voice-chat" 
          className="max-w-6xl mx-auto"
          onValueChange={(value: string) => setActiveTab(value)}
        >
          <div className="relative mb-8">
            <TabsList className="grid w-full grid-cols-2 relative rounded-lg p-1">
              <TabsTrigger 
                value="voice-chat" 
                className="font-inter relative z-10 data-[state=active]:text-white transition-colors duration-200 data-[state=active]:bg-transparent"
              >
                Voice Chat
              </TabsTrigger>
              <TabsTrigger 
                value="living-essay" 
                className="font-inter relative z-10 data-[state=active]:text-white transition-colors duration-200 data-[state=active]:bg-transparent"
              >
                Living Essay
              </TabsTrigger>
              {/* Sliding highlight */}
              <div 
                className={`absolute top-0 h-full w-1/2 transition-all duration-300 ease-in-out rounded-md ${
                  activeTab === 'voice-chat' 
                    ? 'left-0 bg-[#2F3E4D]' 
                    : 'left-1/2 bg-[#E89C94]'
                }`}
              />
            </TabsList>
          </div>

          <TabsContent value="voice-chat" className="h-[calc(100vh-200px)]">
            <VoiceChat 
              vapiApiKey={apiKey} 
              assistantId={assistantId}
              userId={userId}
              clerkUserId={clerkUserId}
              onCallEnded={handleCallEnded}
            />
          </TabsContent>

          <TabsContent value="living-essay" className="h-[calc(100vh-200px)]">
            <LivingEssay />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
} 