import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createCallSummary, getCallSummaryByCallId } from '@/lib/db/client';

// Types for Vapi webhook data
interface VapiCall {
  id: string;
  status: string;
  endedReason?: string;
  [key: string]: any; // Allow for additional properties
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
  [key: string]: any; // Allow for additional properties
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

async function handleFunctionCall(message: VapiMessage) {
  // Handle function calls if needed in the future
}

async function handleAssistantRequest(message: VapiMessage) {
  // Handle assistant requests if needed in the future
}

async function handleStatusUpdate(message: VapiMessage) {
  // Handle status updates if needed in the future
}

async function handleEndOfCallReport(message: VapiMessage) {
  try {
    // Check if we already have this call in the database
    const existingCall = await getCallSummaryByCallId(message.call.id);
    if (existingCall) {
      // Call already exists, don't duplicate
      return;
    }

    // Extract user ID from the call data if available
    // VAPI might include user info in the call object or metadata
    let userId = null;
    let clerkUserId = null;
    
    if (message.call.user?.id) {
      userId = message.call.user.id;
    }
    
    // Try to find user by Clerk ID if available
    if (message.call.metadata?.clerkUserId) {
      clerkUserId = message.call.metadata.clerkUserId;
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