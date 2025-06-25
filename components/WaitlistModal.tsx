'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingSlots: number;
  clerkUserId?: string | null;
}

export default function WaitlistModal({ isOpen, onClose, remainingSlots, clerkUserId }: WaitlistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!response) {
      toast({
        title: "Missing information",
        description: "Please tell us how Fred can help you.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response, clerkUserId }),
      });

      if (res.ok) {
        toast({
          title: "Success!",
          description: "You've been added to the waitlist. We'll be in touch soon!",
        });
        setResponse('');
        onClose();
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to join waitlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Join the Waitlist</CardTitle>
          <CardDescription className="text-center">
            Fred AI is currently in limited release.   Only {remainingSlots} slots remaining!<br />

            <span className="text-xs text-gray-500">After July 2, we're inviting 50 founders to grow with Fred as we supercharge his capabilities.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="response" className="block text-sm font-medium mb-1">
                How do you think Fred can help you achieve your goals? *
              </label>
              <Textarea
                id="response"
                placeholder="Tell us about your goals and how Fred might help..."
                required
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-highlight text-white font-bold shadow-lg hover:bg-brand-highlight/90 border-none text-base py-2 px-4 rounded-md transition-all duration-150"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 