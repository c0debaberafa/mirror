# VAPI Voice Assistant Setup

This guide will help you set up the VAPI voice assistant feature in your application.

## Prerequisites

1. A VAPI account (sign up at [vapi.ai](https://vapi.ai))
2. A VAPI API key
3. A VAPI assistant ID
4. A webhook secret for secure webhook verification

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
VAPI_WEBHOOK_SECRET=your_webhook_secret_here
```

Replace the values with your actual VAPI credentials:
- `your_public_api_key_here`: Your VAPI public API key
- `your_assistant_id_here`: Your VAPI assistant ID
- `your_webhook_secret_here`: A secure random string for webhook verification

### 3. Configure Webhook in VAPI Dashboard

1. In your VAPI dashboard, go to your assistant settings
2. Set the **Server URL** to: `https://your-domain.com/api/webhooks/vapi`
3. Set the **Webhook Secret** to the same value you used for `VAPI_WEBHOOK_SECRET`

### 4. Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Usage

### Main Page Integration

The VAPI widget will automatically appear on the main page (bottom right corner) if the environment variables are properly configured.

### Dedicated Demo Page

Visit `/vapi-demo` to see a dedicated page with the VAPI widget and detailed instructions.

## User Tracking and Call Reports

### Automatic User Association

The VAPI widget automatically associates calls with authenticated users:

- **Authenticated Users**: When a user is signed in with Clerk, their user ID is automatically passed to VAPI
- **Anonymous Users**: Calls from unauthenticated users are marked as "anonymous"
- **User Data**: Both `userId` and `clerkUserId` are passed to VAPI via `assistantOverrides`

### End-of-Call Reports

The system automatically prints complete end-of-call reports for debugging and analysis:

#### Client-Side Logging
When a call ends, the entire report is logged to the browser console:
```javascript
=== ENTIRE END OF CALL REPORT ===
{
  "call": {
    "id": "call_123",
    "status": "ended",
    "variableValues": {
      "userId": "user_456",
      "clerkUserId": "user_456"
    },
    "metadata": {
      "userId": "user_456",
      "clerkUserId": "user_456"
    }
  },
  "summary": "Call summary...",
  "transcript": "Full conversation transcript...",
  "messages": [...]
}
=== END OF CALL REPORT ===
```

#### Server-Side Logging
The webhook handler also logs the complete report:
```javascript
=== ENTIRE END OF CALL REPORT (WEBHOOK) ===
{
  "message": {
    "type": "end-of-call-report",
    "call": {...},
    "summary": "...",
    "transcript": "...",
    "messages": [...]
  }
}
=== END OF CALL REPORT (WEBHOOK) ===
```

### Database Storage

All call data is automatically stored in the database with user associations:

- **Call ID**: Unique VAPI call identifier
- **User ID**: Associated user (if authenticated)
- **Clerk User ID**: Clerk user identifier for easy queries
- **Full Call Data**: Complete call object stored as JSON
- **Transcript & Summary**: Conversation text and AI summary
- **Metadata**: User information, assistant ID, recording URL, etc.

### Example Usage

The VAPI widget automatically handles user tracking:

```typescript
// The widget automatically passes user information
<VapiWidget 
  apiKey={apiKey}
  assistantId={assistantId}
  userId={user?.id}        // Clerk user ID
  clerkUserId={user?.id}   // Same as userId for consistency
/>
```

When a call starts, the user information is passed to VAPI:
```typescript
const assistantOverrides = {
  recordingEnabled: false,
  variableValues: {
    userId: userId || 'anonymous',
    clerkUserId: clerkUserId || 'anonymous',
  },
  metadata: {
    userId: userId,
    clerkUserId: clerkUserId,
  }
};

vapi.start(assistantId, assistantOverrides);
```

## Features

- **Real-time Voice Conversations**: Talk naturally with your AI assistant
- **Visual Feedback**: See when the assistant is listening or speaking
- **Conversation History**: View the transcript of your conversation
- **Easy Controls**: Simple start/stop functionality
- **User Tracking**: Automatic association of calls with authenticated users
- **Complete Call Reports**: Full logging of all call data for analysis
- **Database Storage**: Persistent storage of all call information

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

### User Tracking Issues

1. Check browser console for end-of-call reports
2. Verify webhook logs in your server console
3. Check database for stored call data
4. Ensure Clerk authentication is working properly

## API Reference

The VAPI widget uses the following events:

- `call-start`: Triggered when a call begins
- `call-end`: Triggered when a call ends
- `speech-start`: Triggered when the assistant starts speaking
- `speech-end`: Triggered when the assistant stops speaking
- `message`: Triggered when a transcript message is received
- `end-of-call-report`: Triggered when a call ends (prints full report)
- `error`: Triggered when an error occurs

## Customization

You can customize the VAPI widget by modifying the `VapiWidget.tsx` component. The widget uses Tailwind CSS classes for styling and can be easily adapted to match your application's design.

## Support

For issues with VAPI integration:
- Check the [VAPI documentation](https://docs.vapi.ai)
- Visit the [VAPI community](https://community.vapi.ai)
- Contact VAPI support through their dashboard 