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

function getStorage(): StorageData {
  if (!fs.existsSync(STORAGE_PATH)) {
    return { messages: [] };
  }
  const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
  return JSON.parse(data);
}

export function getMessages(): Message[] {
  return getStorage().messages;
}

export function getLastUserId(): string | undefined {
  return getStorage().lastUserId;
}

export function saveMessage(message: Message, userId?: string) {
  const storage = getStorage();
  storage.messages.push(message);
  if (userId) {
    storage.lastUserId = userId;
  }
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(storage, null, 2));
}
