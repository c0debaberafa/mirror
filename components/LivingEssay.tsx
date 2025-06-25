'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, History, MessageCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLivingEssay } from '@/hooks/use-cached-data';

interface EssaySection {
  heading: string;
  content: string;
}

interface LivingEssayData {
  id: string;
  version: number;
  sections: EssaySection[];
  createdAt: string;
}

interface Tidbit {
  id: string;
  type: string;
  content: string;
  description: string;
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

// Skeleton Loading Components
const EssaySkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="text-center mb-8">
      <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
    </div>
    
    <Card className="bg-white/70 backdrop-blur-sm border-brand-tertiary p-8 mb-8">
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-gradient-to-br from-brand-secondary/10 to-brand-highlight/10 border-brand-tertiary p-6">
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      ))}
    </div>

    <Card className="bg-white/60 backdrop-blur-sm border-brand-tertiary p-6">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center max-w-md mx-auto">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
        <MessageCircle className="w-12 h-12 text-brand-secondary" />
      </div>
      <h2 className="font-tenor text-2xl text-brand-primary mb-3">No Living Essay Yet</h2>
      <p className="text-brand-tertiary mb-6 leading-relaxed">
        Your living essay will appear here after your first conversation with Fred. 
        Start talking to capture your thoughts and insights.
      </p>
      <Button 
        className="bg-brand-secondary hover:bg-brand-secondary/90 text-white"
        onClick={() => window.location.href = '/'}
      >
        Start Your First Conversation
      </Button>
    </div>
  </div>
);

const LivingEssay: React.FC = () => {
  console.log('LivingEssay: Component rendering...');
  
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Use non-cached data hook
  const { 
    data: essayData, 
    isLoading, 
    error: fetchError, 
    refresh: refreshEssay,
    isStale 
  } = useLivingEssay();

  console.log('LivingEssay: Hook data:', { essayData, isLoading, fetchError, isStale });

  const essays = essayData?.essays || [];
  const currentEssay = essays[0] || null;
  const relevantTidbits = essayData?.tidbits || [];

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/living-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: currentEssay?.sections || [],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh essay');
      }
      
      const newEssay = await response.json();
      // Refresh the data
      await refreshEssay();
    } catch (error) {
      console.error('Error refreshing essay:', error);
      setError('Failed to refresh your essay. Please try again.');
    }
  };

  const handleEdit = (index: number) => {
    setEditingSection(index);
    setEditedContent(currentEssay?.sections[index].content || '');
  };

  const handleSave = async (index: number) => {
    if (!currentEssay) return;

    const updatedSections = [...currentEssay.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      content: editedContent,
    };

    try {
      const response = await fetch('/api/living-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: updatedSections,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save essay');
      }
      
      // Refresh the data
      await refreshEssay();
    } catch (error) {
      console.error('Error saving essay:', error);
      setError('Failed to save your changes. Please try again.');
    }

    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleVersionSelect = (essay: LivingEssayData) => {
    // Refresh the data to get the latest version
    refreshEssay();
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="flowing-ellipse-alt absolute top-20 right-8 w-28 h-44 opacity-20"></div>
          <div className="flowing-ellipse absolute top-60 left-12 w-36 h-20 opacity-25"></div>
          <div className="flowing-ellipse-alt absolute bottom-32 right-1/4 w-32 h-32 opacity-15"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <EssaySkeleton />
        </div>
      </div>
    );
  }

  // Show error if fetch failed
  if (fetchError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <MessageCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="font-tenor text-2xl text-brand-primary mb-3">Error Loading Essay</h2>
          <p className="text-brand-tertiary mb-6 leading-relaxed">
            {fetchError}
          </p>
          <Button 
            className="bg-brand-secondary hover:bg-brand-secondary/90 text-white"
            onClick={() => refreshEssay()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state if no essays
  if (!currentEssay || essays.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="flowing-ellipse-alt absolute top-20 right-8 w-28 h-44 opacity-20"></div>
          <div className="flowing-ellipse absolute top-60 left-12 w-36 h-20 opacity-25"></div>
          <div className="flowing-ellipse-alt absolute bottom-32 right-1/4 w-32 h-32 opacity-15"></div>
        </div>
        <div className="relative z-10">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Floating background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flowing-ellipse-alt absolute top-20 right-8 w-28 h-44 opacity-20"></div>
        <div className="flowing-ellipse absolute top-60 left-12 w-36 h-20 opacity-25"></div>
        <div className="flowing-ellipse-alt absolute bottom-32 right-1/4 w-32 h-32 opacity-15"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="sm"
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-tenor text-3xl text-brand-primary mb-3">Your Living Essay</h1>
          <div className="flex items-center justify-center space-x-4 text-brand-tertiary text-sm">
            <span>Last updated: {new Date(currentEssay.createdAt).toLocaleDateString()}</span>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-brand-secondary hover:text-brand-primary"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                'Refresh Essay'
              )}
            </Button>
          </div>
        </div>

        {/* Essay Content */}
        <Card className="bg-white/70 backdrop-blur-sm border-brand-tertiary p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            {currentEssay.sections.map((section, index) => (
              <div key={index} className="mb-8 group relative">
                <h2 className="font-tenor text-xl text-brand-primary mb-4 border-b border-brand-tertiary/30 pb-2">
                  {section.heading}
                </h2>
                {editingSection === index ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-2 border border-brand-tertiary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary min-h-[100px] font-inter text-brand-primary/80"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleSave(index)}
                        size="sm"
                        className="bg-brand-secondary hover:bg-brand-secondary/90 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        size="sm"
                        variant="ghost"
                        className="text-brand-tertiary hover:text-brand-primary"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-inter text-brand-primary/80 leading-relaxed text-base">
                      {section.content}
                    </div>
                    <Button
                      onClick={() => handleEdit(index)}
                      size="sm"
                      variant="ghost"
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-brand-tertiary hover:text-brand-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Relevant Tidbits */}
        {relevantTidbits.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {relevantTidbits.map((tidbit: Tidbit) => (
              <Card key={tidbit.id} className="bg-gradient-to-br from-brand-secondary/10 to-brand-highlight/10 border-brand-tertiary p-6">
                <div className="flex items-center justify-between select-none">
                  <h3 className="font-tenor text-lg text-brand-primary mb-0 flex items-center gap-2">
                    <span className="text-xl">{getTidbitTypeEmoji(tidbit.type)}</span>
                    {tidbit.type}
                  </h3>
                </div>
                <div className="mt-2">
                  <div className="font-inter text-brand-primary/90 text-base leading-relaxed mb-1">{tidbit.content}</div>
                  <p className="text-brand-secondary text-xs italic">{tidbit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Essay Evolution Timeline */}
        {essays.length > 1 && (
          <Card className="bg-white/60 backdrop-blur-sm border-brand-tertiary p-6">
            <h3 className="font-tenor text-lg text-brand-primary mb-4">Essay Evolution</h3>
            <div className="space-y-3">
              {essays.slice(0, 5).map((essay: LivingEssayData, index: number) => (
                <button
                  key={essay.id}
                  onClick={() => handleVersionSelect(essay)}
                  className={cn(
                    "flex items-center space-x-3 w-full text-left hover:bg-brand-secondary/5 p-2 rounded-md transition-colors",
                    currentEssay.id === essay.id && "bg-brand-secondary/10"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 ? "bg-brand-secondary" :
                    index === 1 ? "bg-brand-tertiary" :
                    "bg-brand-highlight"
                  )}></div>
                  <div>
                    <span className="font-inter text-sm text-brand-primary">
                      {index === 0 ? "Latest Version" :
                       index === 1 ? "Previous Version" :
                       `Version ${essays.length - index}`}
                    </span>
                    <span className="block text-xs text-brand-tertiary">
                      {new Date(essay.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LivingEssay; 