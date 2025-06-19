'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';

const LivingEssay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const [sampleEssay, setSampleEssay] = useState({
    title: "Your Living Essay",
    lastUpdated: new Date(),
    sections: [
      {
        heading: "Current Reflection",
        content: "Lately, I've been feeling a quiet mix of curiosity and restlessness — sensing that something new wants to emerge, but not yet knowing its full shape. My thoughts have often returned to the idea of building something gentle and human in technology: an AI that reflects, listens, and holds space without judgment. This feels deeply important to me — not just as a project, but as a way to bring honesty, care, and craftsmanship into my work. At the same time, there's a quiet tension pulling at the edges — the desire to make this system perfect and thoughtful, weighed against the need to keep it simple, light, and possible within the hackathon's limits. I've noticed moments of joy when clarity arrives — like when the idea of the Living Essay clicked into place, or when I imagined the tree of memory unfolding gently. These sparks remind me why I build. Underneath it all, there's a steady thread of wanting to create something real — not just clever, but meaningful — something that feels like a mirror to my own experience. I wonder, softly, how to balance ambition with grace, vision with rest. For now, I am leaning toward simplicity, toward trusting the small beginnings. I am slowly letting go of the need to control every detail — making space for growth, for surprise. And in this, I am changing: becoming a little more open, a little more at ease with uncertainty."
      },
    ],
    insights: [
      "Increased emotional vocabulary and self-awareness",
      "Growing comfort with uncertainty and imperfection",
      "Developing healthy boundaries in relationships",
      "Shift from fixed to growth mindset in challenges"
    ],
    nextFocus: "Continuing to strengthen the connection between mindfulness practices and daily decision-making, while exploring deeper themes of personal values and long-term goals."
  });

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call to regenerate essay
    setTimeout(() => {
      setSampleEssay({
        ...sampleEssay,
        lastUpdated: new Date()
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleEdit = (index: number) => {
    setEditingSection(index);
    setEditedContent(sampleEssay.sections[index].content);
  };

  const handleSave = (index: number) => {
    const updatedSections = [...sampleEssay.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      content: editedContent
    };
    setSampleEssay({
      ...sampleEssay,
      sections: updatedSections,
      lastUpdated: new Date()
    });
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const summarySections = [
    {
      key: "Mood",
      title: "Mood",
      description: "A single phrase capturing the user's recent emotional state.",
      example: "Quietly thoughtful, with a layer of uncertainty mixed with drive — searching for clarity in building something new."
    },
    {
      key: "Focus",
      title: "Focus",
      description: "What the user is most preoccupied with lately.",
      example: "Creating a meaningful, human-centered AI companion that feels gentle, honest, and alive — not just functional or trendy."
    },
    {
      key: "Value",
      title: "Value",
      description: "A core desire, pull, or principle surfacing in the user's life.",
      example: "A deep pull toward authenticity, care, and craftsmanship — wanting technology to feel human, not hollow or forced."
    },
    {
      key: "Tension",
      title: "Tension",
      description: "A quiet conflict or unresolved feeling present.",
      example: "Balancing the excitement of creative vision with the grounded demands of shipping a working MVP in limited time."
    },
    {
      key: "Joy",
      title: "Joy",
      description: "What recently sparked lightness, energy, or ease.",
      example: "The moment when the 'Living Essay' idea felt true — like finding the right metaphor that unlocks everything."
    },
    {
      key: "Future",
      title: "Future",
      description: "A simple drift, hope, or leaning toward the future.",
      example: "Hoping to explore the real relationship between humans and AI — dreaming of projects where tech reflects, not manipulates."
    },
    {
      key: "Echo",
      title: "Echo",
      description: "A recurring thought, memory, or old pattern resurfacing.",
      example: "A quiet question: can something built in code truly feel human, or will it always fall short without soul?"
    },
    {
      key: "Shift",
      title: "Shift",
      description: "One small way the user has changed or grown lately.",
      example: "Leaning into simplicity — realizing that doing less, gently, might speak louder than trying to do everything perfectly."
    },
  ];

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
          <h1 className="font-tenor text-3xl text-brand-primary mb-3">{sampleEssay.title}</h1>
          <div className="flex items-center justify-center space-x-4 text-brand-tertiary text-sm">
            <span>Last updated: {sampleEssay.lastUpdated.toLocaleDateString()}</span>
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
            {sampleEssay.sections.map((section, index) => (
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
                    <p className="font-inter text-brand-primary/80 leading-relaxed text-base">
                      {section.content}
                    </p>
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

        {/* Key Insights & Areas of Focus replaced with new expandable summary sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {summarySections.map((section) => (
            <Card key={section.key} className="bg-gradient-to-br from-brand-secondary/10 to-brand-highlight/10 border-brand-tertiary p-6">
              <div className="flex items-center justify-between select-none">
                <h3 className="font-tenor text-lg text-brand-primary mb-0">{section.title}</h3>
              </div>
              <div className="mt-2">
                <div className="font-inter text-brand-primary/90 text-base leading-relaxed mb-1">{section.example}</div>
                <p className="text-brand-secondary text-xs italic">{section.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Essay Evolution Timeline */}
        <Card className="bg-white/60 backdrop-blur-sm border-brand-tertiary p-6">
          <h3 className="font-tenor text-lg text-brand-primary mb-4">Essay Evolution</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-brand-secondary"></div>
              <div>
                <span className="font-inter text-sm text-brand-primary">Latest Version</span>
                <span className="text-brand-tertiary text-xs ml-2">Today</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-brand-tertiary"></div>
              <div>
                <span className="font-inter text-sm text-brand-primary/70">Previous Version</span>
                <span className="text-brand-tertiary text-xs ml-2">3 days ago</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-brand-highlight"></div>
              <div>
                <span className="font-inter text-sm text-brand-primary/70">Initial Essay</span>
                <span className="text-brand-tertiary text-xs ml-2">1 week ago</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LivingEssay; 