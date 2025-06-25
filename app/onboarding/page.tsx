'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { SignOutButton } from '@clerk/nextjs'

interface Question {
  id: string
  title: string
  subtitle: string
  fieldName: string
  options: {
    id: string
    emoji: string
    title: string
    description: string
  }[]
}

const questions: Question[] = [
  {
    id: 'dream_home',
    title: 'Where do you dream of landing?',
    subtitle: 'Your emotional endgame in one line.',
    fieldName: 'dream_home_archetype',
    options: [
      { id: 'manhattan', emoji: '🌃', title: 'Penthouse in Manhattan', description: 'Sharp suits, sharper dinners' },
      { id: 'seaside', emoji: '🌊', title: 'Seaside villa', description: 'Slow days, long mornings' },
      { id: 'family', emoji: '🏡', title: 'Family home', description: 'Warmth, mess, meaning' },
      { id: 'nomadic', emoji: '🌍', title: 'Nomadic life', description: 'New cities, new energy' },
      { id: 'nature', emoji: '🌳', title: 'Nature retreat', description: 'Green sights, clear mind' },
      { id: 'system', emoji: '❓', title: 'No home, just a system', description: 'Still figuring it out' }
    ]
  },
  {
    id: 'calendar',
    title: 'How do you run your calendar?',
    subtitle: 'Your relationship to time and structure.',
    fieldName: 'calendar_style',
    options: [
      { id: 'back_to_back', emoji: '🎯', title: 'Back-to-back', description: 'Speed is clarity' },
      { id: 'fully_blocked', emoji: '⛓️', title: 'Fully blocked', description: 'Focus is protection' },
      { id: 'rhythmic', emoji: '🔁', title: 'Rhythmic', description: 'Rituals, then flow' },
      { id: 'wide_open', emoji: '🧘', title: 'Wide open', description: 'I move with energy' },
      { id: 'light_reactive', emoji: '📬', title: 'Light and reactive', description: 'Keep it loose' },
      { id: 'figuring_out', emoji: '❓', title: 'Still figuring it out', description: 'Finding my rhythm' }
    ]
  },
  {
    id: 'spirit_animal',
    title: 'Which spirit animal are you at your best?',
    subtitle: 'How you move through the world when it\'s all clicking.',
    fieldName: 'spirit_animal_archetype',
    options: [
      { id: 'fox', emoji: '🦊', title: 'Fox', description: 'Sharp, strategic, always ahead' },
      { id: 'horse', emoji: '🐎', title: 'Horse', description: 'Fast, intense, won\'t slow down' },
      { id: 'whale', emoji: '🐋', title: 'Whale', description: 'Calm, deep, shifts the tide' },
      { id: 'parrot', emoji: '🦜', title: 'Parrot', description: 'Charming, bright, cuts through noise' },
      { id: 'dragon', emoji: '🐉', title: 'Dragon', description: 'Fierce, visionary, commands space' },
      { id: 'becoming', emoji: '❓', title: 'Still becoming', description: 'Discovering my power' }
    ]
  },
  {
    id: 'peak_moment',
    title: 'What kind of moment lights you up?',
    subtitle: 'The feeling that reminds you why you\'re here.',
    fieldName: 'peak_moment_trigger',
    options: [
      { id: 'starting', emoji: '🌅', title: 'Starting something no one believes in', description: 'Pioneering the impossible' },
      { id: 'cracking', emoji: '🧠', title: 'Cracking a stuck problem', description: 'Breakthrough clarity' },
      { id: 'pitching', emoji: '🎤', title: 'Pitching and feeling the room shift', description: 'Moving hearts and minds' },
      { id: 'hearing', emoji: '👁', title: 'Hearing "this changed how I think"', description: 'Impact that lasts' },
      { id: 'flow', emoji: '⚡️', title: 'Hitting flow on the edge of chaos', description: 'Peak performance' },
      { id: 'finding', emoji: '❓', title: 'Haven\'t found it yet', description: 'Still discovering' }
    ]
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed = answers[currentQuestion?.fieldName]

  const handleOptionSelect = (fieldName: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [fieldName]: optionId }))
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      Object.entries(answers).forEach(([field, value]) => {
        formData.append(field, value)
      })
      
      const res = await completeOnboarding(formData)
      if (res?.message) {
        await user?.reload()
        toast({
          title: "Onboarding Complete!",
          description: "You're all set up to have your first conversation wtih Fred.",
        })
        router.push('/')
      }
      if (res?.error) {
        setError(res.error)
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        })
      }
    } catch {
      setError('An unexpected error occurred')
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-background relative overflow-hidden">
      {/* Subtle sign-out button */}
      <div className="absolute top-6 right-6 z-20">
        <SignOutButton>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-white/20 backdrop-blur-sm border border-white/10"
          >
            Sign out
          </Button>
        </SignOutButton>
      </div>

      {/* Background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="flowing-ellipse absolute -top-20 -left-20 w-64 h-32 opacity-10"></div>
        <div className="flowing-ellipse-alt absolute top-1/4 -right-32 w-48 h-72 opacity-8"></div>
        <div className="flowing-ellipse absolute bottom-10 left-1/4 w-56 h-28 opacity-12"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in fade-in duration-500">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-brand-primary mb-2">
                Welcome to Fred AI
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-brand-secondary to-brand-highlight mx-auto mb-4"></div>
              
              {/* Progress indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-brand-highlight w-6' 
                        : index < currentStep 
                        ? 'bg-brand-secondary' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-brand-primary mb-2">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {currentQuestion.subtitle}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(currentQuestion.fieldName, option.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    answers[currentQuestion.fieldName] === option.id
                      ? 'border-brand-highlight bg-brand-highlight/5 shadow-md'
                      : 'border-gray-200 hover:border-brand-secondary/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <h3 className="font-medium text-brand-primary">{option.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-gray-500 hover:text-brand-primary"
              >
                Back
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-8 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Setting up...</span>
                  </div>
                ) : isLastStep ? (
                  'Finish'
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 