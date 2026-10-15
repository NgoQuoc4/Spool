export interface Conversation {
  followed_user_id: string;
  user_id: string;
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
