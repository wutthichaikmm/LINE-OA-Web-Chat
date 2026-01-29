import { NextResponse } from 'next/server';
import { getMessages } from '@/lib/storage';

export async function GET() {
  const messages = await getMessages();
  return NextResponse.json(messages);
}
