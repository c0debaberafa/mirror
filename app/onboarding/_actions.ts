'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth()

  if (!userId) {
    return { message: 'No Logged In User' }
  }

  const client = await clerkClient()

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        dream_home_archetype: formData.get('dream_home_archetype'),
        calendar_style: formData.get('calendar_style'),
        spirit_animal_archetype: formData.get('spirit_animal_archetype'),
        peak_moment_trigger: formData.get('peak_moment_trigger'),
      },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { error: 'There was an error updating the user metadata.' }
  }
} 