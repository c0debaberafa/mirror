'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceChat from '@/components/VoiceChat';
import LivingEssay from '../components/LivingEssay';

export default function Home() {
  const [activeTab, setActiveTab] = useState('voice-chat');
  const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;

  return (
    <div className="min-h-screen bg-brand-background relative">
      {/* Background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flowing-ellipse absolute -top-20 -left-20 w-64 h-32 opacity-10"></div>
        <div className="flowing-ellipse-alt absolute top-1/4 -right-32 w-48 h-72 opacity-8"></div>
        <div className="flowing-ellipse absolute bottom-10 left-1/4 w-56 h-28 opacity-12"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header - Simplified */}
        <div className="text-center mb-8">
          <h1 className="font-tenor text-4xl text-brand-primary mb-3 font-bold">Fred</h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-brand-secondary to-brand-highlight mx-auto mt-4"></div>
        </div>

        {/* Main Content */}
        <Tabs 
          defaultValue="voice-chat" 
          className="max-w-6xl mx-auto"
          onValueChange={(value) => setActiveTab(value)}
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
            <VoiceChat vapiApiKey={vapiApiKey} />
          </TabsContent>

          <TabsContent value="living-essay" className="h-[calc(100vh-200px)]">
            <LivingEssay />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
