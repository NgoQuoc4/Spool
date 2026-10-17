export interface Conversation {
  userId: string;
  followedUserId?: string;
  name: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
}
export interface ChatMessage {
  id: string;
  senderId: string;
  username?: string;
  message: string;
  timestamp: string;
}
