declare module '@/components/DocumentUpload' {
  const DocumentUpload: React.FC<{ className?: string }>;
  export default DocumentUpload;
}

declare module '@/components/DocumentsList' {
  const DocumentsList: React.FC;
  export default DocumentsList;
}

declare module '@/components/ChatInterface' {
  const ChatInterface: React.FC;
  export default ChatInterface;
}

declare module '@/context/ChatContext' {
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

  export interface ChatContextType {
    messages: Message[];
    addMessage: (role: 'user' | 'assistant', content: string, sources?: any[]) => string;
    setMessageLoading: (id: string, isLoading: boolean) => void;
    clearMessages: () => void;
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  }

  export function ChatProvider({ children }: { children: React.ReactNode }): JSX.Element;
  export function useChat(): ChatContextType;
} 