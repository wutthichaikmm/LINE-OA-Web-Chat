import { Redis } from '@upstash/redis'
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
// สร้าง Redis Client (จะใช้ค่าจาก Environment Variables อัตโนมัติ)
// ตรวจสอบว่ามีค่าครบหรือไม่ก่อนใช้งาน
const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;
const isCloud = !!redis;
export async function getMessages(): Promise<Message[]> {
  if (isCloud) {
    const messages = await redis.get<Message[]>('chat_messages');
    return messages || [];
  } else {
    if (!fs.existsSync(STORAGE_PATH)) return [];
    const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
    const storage = JSON.parse(data) as StorageData;
    return storage.messages || [];
  }
}
export async function getLastUserId(): Promise<string | undefined> {
  if (isCloud) {
    return (await redis.get<string>('last_user_id')) || undefined;
  } else {
    if (!fs.existsSync(STORAGE_PATH)) return undefined;
    const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
    const storage = JSON.parse(data) as StorageData;
    return storage.lastUserId;
  }
}
export async function saveMessage(message: Message, userId?: string) {
  if (isCloud) {
    const messages = await getMessages();
    messages.push(message);
    await redis.set('chat_messages', messages);
    if (userId) {
      await redis.set('last_user_id', userId);
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