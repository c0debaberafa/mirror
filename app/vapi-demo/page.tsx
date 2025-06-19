'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import VapiWidget from '../../components/VapiWidget';

interface User {
  id: string;
  clerkUserId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastSignInAt?: string;
  isActive: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}

export default function VapiDemoPage() {
  const { user } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // You'll need to set these environment variables
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || 'your_public_api_key';
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || 'your_assistant_id';

  // Get the full Clerk user ID
  const clerkUserId = user?.id;
  
  // Fetch user data from database
  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${clerkUserId}`);
        if (response.ok) {
          const userData = await response.json();
          setDbUser(userData);
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [clerkUserId]);

  // Use the database userId if available, otherwise fall back to clerkUserId
  const userId = dbUser?.id || clerkUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VAPI Voice Assistant Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience real-time voice conversations with AI. Click the microphone button 
            in the bottom right corner to start talking with your VAPI assistant.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How to Use
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>Click the &ldquo;🎤 Talk to Assistant&rdquo; button in the bottom right corner</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>Allow microphone permissions when prompted</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>Start speaking naturally - the assistant will respond in real-time</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <p>Click &ldquo;End Call&rdquo; when you&apos;re finished</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Environment Variables</h3>
              <p className="text-gray-600 mb-3">
                Make sure to set these environment variables in your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <code className="text-sm">
                    NEXT_PUBLIC_VAPI_API_KEY=your_public_api_key_here
                  </code>
                </div>
                <div>
                  <code className="text-sm">
                    NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
                  </code>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You need a VAPI account and API key to use this feature</li>
                <li>• The assistant ID should be created in your VAPI dashboard</li>
                <li>• Make sure your browser supports microphone access</li>
                <li>• The widget will appear in the bottom right corner of this page</li>
              </ul>
            </div>

            {/* User Information Display */}
            {!isLoading && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">👤 User Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>Clerk User ID:</strong> {clerkUserId || 'Not available'}</div>
                  <div><strong>Database User ID:</strong> {dbUser?.id || 'Not found in database'}</div>
                  <div><strong>Email:</strong> {dbUser?.email || 'Not available'}</div>
                  <div><strong>Name:</strong> {dbUser?.firstName && dbUser?.lastName ? `${dbUser.firstName} ${dbUser.lastName}` : 'Not available'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VAPI Widget */}
      <VapiWidget 
        apiKey={apiKey}
        assistantId={assistantId}
        userId={userId}
        clerkUserId={clerkUserId}
      />
    </div>
  );
} 