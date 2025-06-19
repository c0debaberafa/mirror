import { NextRequest, NextResponse } from 'next/server';
import { createCallSummary, getCallSummaryByCallId } from '@/lib/db/client';

// Types for Vapi webhook data
interface VapiCall {
  id: string;
  status: string;
  endedReason?: string;
  assistantId: string;
  assistantOverrides?: {
    metadata?: {
      userId?: string;
      clerkUserId?: string;
    };
    variableValues?: {
      userId?: string;
      clerkUserId?: string;
    };
  };
  user?: {
    id?: string;
  };
}

interface VapiFunctionCall {
  name: string;
  parameters: string;
}

interface VapiMessage {
  type: string;
  call: VapiCall;
  functionCall?: VapiFunctionCall;
  status?: string;
  endedReason?: string;
  recordingUrl?: string;
  summary?: string;
  transcript?: string;
  messages?: Array<{
    role: string;
    message: string;
  }>;
  assistant?: {
    variableValues?: {
      userId?: string;
      clerkUserId?: string;
    };
    metadata?: {
      userId?: string;
      clerkUserId?: string;
    };
  };
}

interface VapiWebhookPayload {
  message: VapiMessage;
}

export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const payload = await req.text();
    
    // Parse the JSON payload
    const body: VapiWebhookPayload = JSON.parse(payload);

    // Handle different message types
    switch (body.message.type) {
      case 'function-call':
        await handleFunctionCall(body.message);
        break;
        
      case 'assistant-request':
        await handleAssistantRequest(body.message);
        break;
        
      case 'status-update':
        await handleStatusUpdate(body.message);
        break;
        
      case 'end-of-call-report':
        await handleEndOfCallReport(body.message);
        break;
        
      case 'hang':
        await handleHang(body.message);
        break;
        
      default:
        // Silently ignore unhandled message types
        break;
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process webhook' 
    }, { status: 500 });
  }
}

async function handleFunctionCall(_message: VapiMessage): Promise<void> {
  // Function call handling will be implemented in the future
}

async function handleAssistantRequest(_message: VapiMessage): Promise<void> {
  // Assistant request handling will be implemented in the future
}

async function handleStatusUpdate(_message: VapiMessage): Promise<void> {
  // Status update handling will be implemented in the future
}

async function handleEndOfCallReport(message: VapiMessage) {
  try {
    // Check if we already have this call in the database
    const existingCall = await getCallSummaryByCallId(message.call.id);
    if (existingCall) {
      return;
    }

    // Extract user ID from multiple possible locations in the call data
    let userId = null;
    let clerkUserId = null;
    
    // Check call.assistantOverrides first (most reliable)
    if (message.call.assistantOverrides?.metadata?.userId) {
      userId = message.call.assistantOverrides.metadata.userId;
    }
    if (message.call.assistantOverrides?.metadata?.clerkUserId) {
      clerkUserId = message.call.assistantOverrides.metadata.clerkUserId;
    }
    
    // Check call.assistantOverrides.variableValues
    if (!userId && message.call.assistantOverrides?.variableValues?.userId) {
      userId = message.call.assistantOverrides.variableValues.userId;
    }
    if (!clerkUserId && message.call.assistantOverrides?.variableValues?.clerkUserId) {
      clerkUserId = message.call.assistantOverrides.variableValues.clerkUserId;
    }
    
    // Check assistant.variableValues (fallback)
    if (!userId && message.assistant?.variableValues?.userId) {
      userId = message.assistant.variableValues.userId;
    }
    if (!clerkUserId && message.assistant?.variableValues?.clerkUserId) {
      clerkUserId = message.assistant.variableValues.clerkUserId;
    }
    
    // Check assistant.metadata (fallback)
    if (!userId && message.assistant?.metadata?.userId) {
      userId = message.assistant.metadata.userId;
    }
    if (!clerkUserId && message.assistant?.metadata?.clerkUserId) {
      clerkUserId = message.assistant.metadata.clerkUserId;
    }
    
    // Check call.user.id (legacy fallback)
    if (!userId && message.call.user?.id) {
      userId = message.call.user.id;
    }

    // Store the call summary in the database
    await createCallSummary({
      callId: message.call.id,
      userId: userId,
      clerkUserId: clerkUserId,
      summary: message.summary,
      transcript: message.transcript,
      messages: message.messages,
      endedReason: message.endedReason,
      recordingUrl: message.recordingUrl,
      assistantId: message.call.assistantId,
      callData: message.call,
    });

  } catch (error) {
    console.error('Error storing call data:', error);
    // Don't throw the error to avoid webhook failure
  }
}

async function handleHang(message: VapiMessage) {
  // Handle hang notifications if needed in the future
} 