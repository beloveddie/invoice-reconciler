'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  sources?: {
    title: string;
    documentId: string;
    excerpt: string;
  }[];
}

interface ChatContextType {
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string, sources?: any[]) => string;
  setMessageLoading: (id: string, isLoading: boolean) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessagesState] = useState<Message[]>([]);

  const addMessage = (role: 'user' | 'assistant', content: string, sources?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      role,
      content,
      timestamp: new Date(),
      sources
    };
    setMessagesState(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const setMessageLoading = (id: string, isLoading: boolean) => {
    setMessagesState(prev => 
      prev.map(message => 
        message.id === id ? { ...message, isLoading } : message
      )
    );
  };

  const clearMessages = () => {
    setMessagesState([]);
  };

  // Allow setMessages to accept either an array or an updater function
  const setMessages = (messagesOrUpdater: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof messagesOrUpdater === 'function') {
      setMessagesState(messagesOrUpdater as (prev: Message[]) => Message[]);
    } else {
      setMessagesState(messagesOrUpdater);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, setMessageLoading, clearMessages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}