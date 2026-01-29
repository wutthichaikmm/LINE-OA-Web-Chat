import { NextRequest, NextResponse } from 'next/server';
import { messagingApi } from '@line/bot-sdk';
import { saveMessage, getLastUserId } from '@/lib/storage';

const { MessagingApiClient } = messagingApi;

const client = new MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const userId = getLastUserId();

    if (!userId) {
      return NextResponse.json({ error: 'No LINE user to send to. Wait for a message from LINE first.' }, { status: 400 });
    }

    await client.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: text }],
    });

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: text,
      timestamp: new Date().toISOString(),
    };
    saveMessage(userMessage);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json({ status: 'error', details: error }, { status: 500 });
  }
}
