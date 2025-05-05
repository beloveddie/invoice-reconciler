'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, Message } from '@/context/ChatContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface() {
  const { messages, addMessage, setMessageLoading, setMessages, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message and get its ID
    const userMessageId = addMessage('user', input);

    // Add assistant loading message and get its ID
    const loadingMessageId = addMessage('assistant', '', []);
    setMessageLoading(loadingMessageId, true);

    setInput('');

    try {
      // Get the authentication details
      const apiKey = localStorage.getItem('apiKey');
      const indexId = localStorage.getItem('index_id');
      const projectId = localStorage.getItem('project_id');
      const organizationId = localStorage.getItem('organization_id');

      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || '',
          'X-Index-ID': indexId || '',
          'X-Project-ID': projectId || '',
          'X-Organization-ID': organizationId || '',
        },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      // Parse the response
      const data = await response.json();
      console.log('Chat API response:', data); // Debug log

      // Update only the assistant message with the matching ID
      setMessages((prevMessages: Message[]) =>
        prevMessages.map((m: Message) =>
          m.id === loadingMessageId
            ? {
                ...m,
                content: data.text || 'No response received',
                isLoading: false,
                sources: data.sources || [],
              }
            : m
        )
      );
    } catch (err) {
      setMessageLoading(loadingMessageId, false);
      setMessages((prevMessages: Message[]) =>
        prevMessages.map((m: Message) =>
          m.id === loadingMessageId
            ? {
                ...m,
                content: 'Sorry, I encountered an error. Please try again.',
                isLoading: false,
              }
            : m
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
    }
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="text-xl mb-2">How can I help you today?</p>
              <p>Ask me anything about our products, services, or policies.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={endOfMessagesRef} />
            </div>
          )}
        </CardContent>
        
        {error && (
          <Alert variant="destructive" className="mx-4 mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={handleClearChat}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}
      >
        {/* Only assistant messages can be loading */}
        {message.role === 'assistant' && message.isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            
            {/* Sources/Citations */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 text-xs">
                <p className="font-semibold">Sources:</p>
                <ul className="mt-1 space-y-1">
                  {message.sources.map((source, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{source.title}</span>
                      {source.excerpt && (
                        <p className="italic mt-0.5">{source.excerpt}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}