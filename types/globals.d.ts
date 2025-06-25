export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      applicationName?: string
      applicationType?: string
      dream_home_archetype?: string
      calendar_style?: string
      spirit_animal_archetype?: string
      peak_moment_trigger?: string
    }
  }
} 