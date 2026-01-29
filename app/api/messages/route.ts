import { NextResponse } from 'next/server';
import { getMessages } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(getMessages());
}
