'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Login from '@/components/Login';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentsList from '@/components/DocumentsList';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatProvider } from '@/context/ChatContext';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initMessage, setInitMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const initializeIndex = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const organizationId = localStorage.getItem('organization_id');
      const projectId = localStorage.getItem('project_id');
      
      const response = await fetch('/api/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || '',
          'X-Organization-Id': organizationId || '',
          'X-Project-Id': projectId || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('index_id', data.index_id);
        setInitMessage('Knowledge base initialized');
        setTimeout(() => setInitMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error initializing index:', err);
    }
  };

  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey');
    if (storedKey) {
      setIsLoggedIn(true);
      initializeIndex();
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    initializeIndex();
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('project_id');
    localStorage.removeItem('organization_id');
    localStorage.removeItem('index_id');
    setIsLoggedIn(false);
  };

  const toggleAdminMode = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-screen w-64 bg-gray-50 p-4 flex flex-col items-center">
        <div className="w-32 h-32 relative mb-4">
          <Image
            src="/logo.png"
            alt="FAQ Support Chatbot Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-center">FAQ Support Chatbot</h1>
        
        {isLoggedIn && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleAdminMode}
            className="mt-4"
          >
            {isAdmin ? "Exit Admin Mode" : "Admin Mode"}
          </Button>
        )}
      </div>

      {isLoggedIn ? (
        <>
          <div className="fixed top-4 right-4 z-10">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
          {initMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Alert>
                <AlertDescription>{initMessage}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="ml-64 max-w-4xl mx-auto px-4 pt-4">
            <ChatProvider>
              {isAdmin ? (
                <>
                  <DocumentUpload className="mb-6" />
                  <DocumentsList />
                </>
              ) : (
                <ChatInterface />
              )}
            </ChatProvider>
          </div>
        </>
      ) : (
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <Login onLoginSuccess={handleLogin} />
        </div>
      )}
    </>
  );
}