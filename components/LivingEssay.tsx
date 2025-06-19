'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EssaySection {
  heading: string;
  content: string;
}

interface EssayDelta {
  added: string[];
  removed: string[];
  modified: {
    before: string;
    after: string;
  }[];
}

interface LivingEssayData {
  id: string;
  version: number;
  sections: EssaySection[];
  createdAt: string;
  delta?: EssayDelta;
}

interface Tidbit {
  id: string;
  type: string;
  content: string;
  description: string;
}

const LivingEssay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [essays, setEssays] = useState<LivingEssayData[]>([]);
  const [currentEssay, setCurrentEssay] = useState<LivingEssayData | null>(null);
  const [relevantTidbits, setRelevantTidbits] = useState<Tidbit[]>([]);

  useEffect(() => {
    fetchEssayData();
  }, []);

  const fetchEssayData = async () => {
    try {
      const response = await fetch('/api/living-essay');
      const data = await response.json();
      setEssays(data.essays);
      setCurrentEssay(data.essays[0]); // Most recent essay
      setRelevantTidbits(data.tidbits);
    } catch (error) {
      console.error('Error fetching essay data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
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
      const newEssay = await response.json();
      setEssays([newEssay, ...essays]);
      setCurrentEssay(newEssay);
      await fetchEssayData(); // Refresh tidbits as well
    } catch (error) {
      console.error('Error refreshing essay:', error);
    } finally {
      setIsLoading(false);
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
      const newEssay = await response.json();
      setEssays([newEssay, ...essays]);
      setCurrentEssay(newEssay);
    } catch (error) {
      console.error('Error saving essay:', error);
    }

    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleVersionSelect = (essay: LivingEssayData) => {
    setCurrentEssay(essay);
  };

  const highlightDelta = (content: string): React.ReactElement => {
    if (!currentEssay?.delta) return <>{content}</>;

    let highlightedContent = content;
    const { added, modified } = currentEssay.delta;

    // Highlight modified content
    modified.forEach(({ after }) => {
      highlightedContent = highlightedContent.replace(
        after,
        `<span class="bg-yellow-100 dark:bg-yellow-800/30">${after}</span>`
      );
    });

    // Highlight added content
    added.forEach((addedText) => {
      highlightedContent = highlightedContent.replace(
        addedText,
        `<span class="bg-green-100 dark:bg-green-800/30">${addedText}</span>`
      );
    });

    return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  if (!currentEssay) {
    return <div>Loading...</div>;
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
              {isLoading ? 'Updating...' : 'Refresh Essay'}
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
                        className="bg-brand-secondary hover:bg-brand-secondary/90"
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
                      {highlightDelta(section.content)}
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
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {relevantTidbits.map((tidbit) => (
            <Card key={tidbit.id} className="bg-gradient-to-br from-brand-secondary/10 to-brand-highlight/10 border-brand-tertiary p-6">
              <div className="flex items-center justify-between select-none">
                <h3 className="font-tenor text-lg text-brand-primary mb-0">{tidbit.type}</h3>
              </div>
              <div className="mt-2">
                <div className="font-inter text-brand-primary/90 text-base leading-relaxed mb-1">{tidbit.content}</div>
                <p className="text-brand-secondary text-xs italic">{tidbit.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Essay Evolution Timeline */}
        <Card className="bg-white/60 backdrop-blur-sm border-brand-tertiary p-6">
          <h3 className="font-tenor text-lg text-brand-primary mb-4">Essay Evolution</h3>
          <div className="space-y-3">
            {essays.slice(0, 5).map((essay, index) => (
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
                  <span className="text-brand-tertiary text-xs ml-2">
                    {new Date(essay.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {currentEssay.id === essay.id && (
                  <div className="ml-auto">
                    <History className="w-4 h-4 text-brand-secondary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LivingEssay; 