# VAPI Voice Assistant Setup

This guide will help you set up the VAPI voice assistant feature in your application.

## Prerequisites

1. A VAPI account (sign up at [vapi.ai](https://vapi.ai))
2. A VAPI API key
3. A VAPI assistant ID

## Setup Instructions

### 1. Get Your VAPI Credentials

1. Go to [vapi.ai](https://vapi.ai) and create an account
2. Navigate to your dashboard
3. Create a new assistant or use an existing one
4. Copy your API key and assistant ID

### 2. Configure Environment Variables

Create a `.env.local` file in your project root and add the following variables:

```bash
# VAPI Configuration
NEXT_PUBLIC_VAPI_API_KEY=your_public_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
```

Replace `your_public_api_key_here` and `your_assistant_id_here` with your actual VAPI credentials.

### 3. Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Usage

### Main Page Integration

The VAPI widget will automatically appear on the main page (bottom right corner) if the environment variables are properly configured.

### Dedicated Demo Page

Visit `/vapi-demo` to see a dedicated page with the VAPI widget and detailed instructions.

## Features

- **Real-time Voice Conversations**: Talk naturally with your AI assistant
- **Visual Feedback**: See when the assistant is listening or speaking
- **Conversation History**: View the transcript of your conversation
- **Easy Controls**: Simple start/stop functionality

## Troubleshooting

### Widget Not Appearing

1. Check that your environment variables are set correctly
2. Ensure you're using the public API key (not the secret key)
3. Verify your assistant ID is correct
4. Restart your development server

### Microphone Issues

1. Make sure your browser supports microphone access
2. Allow microphone permissions when prompted
3. Check that your microphone is working in other applications

### Connection Issues

1. Verify your internet connection
2. Check that your VAPI account has sufficient credits
3. Ensure your assistant is properly configured in the VAPI dashboard

## API Reference

The VAPI widget uses the following events:

- `call-start`: Triggered when a call begins
- `call-end`: Triggered when a call ends
- `speech-start`: Triggered when the assistant starts speaking
- `speech-end`: Triggered when the assistant stops speaking
- `message`: Triggered when a transcript message is received
- `error`: Triggered when an error occurs

## Customization

You can customize the VAPI widget by modifying the `VapiWidget.tsx` component. The widget uses Tailwind CSS classes for styling and can be easily adapted to match your application's design.

## Support

For issues with VAPI integration:
- Check the [VAPI documentation](https://docs.vapi.ai)
- Visit the [VAPI community](https://community.vapi.ai)
- Contact VAPI support through their dashboard 