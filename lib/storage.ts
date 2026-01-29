import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const STORAGE_PATH = path.join(process.cwd(), 'messages.json');

export interface Message {
  id: string;
  sender: 'user' | 'line';
  text: string;
  timestamp: string;
}

export interface StorageData {
  messages: Message[];
  lastUserId?: string;
}

const isVercel = process.env.VERCEL === '1' || !!process.env.KV_URL;

export async function getMessages(): Promise<Message[]> {
  if (isVercel) {
    const messages = await kv.get<Message[]>('chat_messages');
    return messages || [];
  } else {
    if (!fs.existsSync(STORAGE_PATH)) return [];
    const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
    const storage = JSON.parse(data) as StorageData;
    return storage.messages || [];
  }
}

export async function getLastUserId(): Promise<string | undefined> {
  if (isVercel) {
    return (await kv.get<string>('last_user_id')) || undefined;
  } else {
    if (!fs.existsSync(STORAGE_PATH)) return undefined;
    const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
    const storage = JSON.parse(data) as StorageData;
    return storage.lastUserId;
  }
}

export async function saveMessage(message: Message, userId?: string) {
  if (isVercel) {
    const messages = await getMessages();
    messages.push(message);
    await kv.set('chat_messages', messages);
    if (userId) {
      await kv.set('last_user_id', userId);
    }
  } else {
    let storage: StorageData = { messages: [] };
    if (fs.existsSync(STORAGE_PATH)) {
      const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
      storage = JSON.parse(data);
    }
    storage.messages.push(message);
    if (userId) {
      storage.lastUserId = userId;
    }
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(storage, null, 2));
  }
}
