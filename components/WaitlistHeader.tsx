'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';
import WaitlistModal from './WaitlistModal';
import { useUser } from '@clerk/nextjs';

export default function WaitlistHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remainingSlots, setRemainingSlots] = useState(50);
  const { user } = useUser();

  useEffect(() => {
    fetchWaitlistStats();
  }, []);

  const fetchWaitlistStats = async () => {
    try {
      const response = await fetch('/api/waitlist');
      if (response.ok) {
        const data = await response.json();
        setRemainingSlots(data.remainingSlots);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist stats:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 px-2 py-1 bg-white/70 rounded-lg shadow-sm border border-brand-tertiary/20">
        <CountdownTimer />
        <span className="hidden md:inline-block h-6 w-px bg-gray-300 mx-2" />
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          size="sm"
          className="bg-brand-highlight text-white hover:bg-brand-highlight/90 font-semibold shadow-md px-4 py-2 rounded-md transition-all duration-150"
        >
          Join Waitlist ({remainingSlots} slots left)
        </Button>
      </div>

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        remainingSlots={remainingSlots}
        clerkUserId={user?.id}
      />
    </>
  );
} 