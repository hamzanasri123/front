import { User } from './users.interface';

export class Message {
  _id: string;
  content: string;
  isRead: string;
  sender: string;
  conversation: string;
}

export class Conversation {
  _id: string;
  messages: Message[];
  participants: User[];
  title: string;
  lastMessage: any;
}

