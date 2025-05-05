'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Document {
  id: string;
  friendlyName: string | null;
  fileName: string;
  markdown: string;
  category?: string;
  uploadDate: string;
}

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState('');
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const apiKey = localStorage.getItem('apiKey');
        const indexId = localStorage.getItem('index_id');
        const projectId = localStorage.getItem('project_id');
        const organizationId = localStorage.getItem('organization_id');

        // Skip API call if any required ID is missing
        if (!apiKey || !indexId || !projectId || !organizationId) {
          return;
        }

        const response = await fetch('/api/documents/list', {
          headers: {
            'X-API-Key': apiKey || '',
            'X-Index-ID': indexId || '',
            'X-Project-ID': projectId || '',
            'X-Organization-ID': organizationId || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          setError('Failed to fetch documents');
        }
      } catch (err) {
        setError('Error fetching documents');
      }
    };

    // Initial fetch
    fetchDocuments();

    // Set up polling
    const intervalId = setInterval(fetchDocuments, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const apiKey = localStorage.getItem('apiKey');
      const indexId = localStorage.getItem('index_id');
      const projectId = localStorage.getItem('project_id');
      const organizationId = localStorage.getItem('organization_id');

      const response = await fetch(`/api/documents/delete?id=${documentId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey || '',
          'X-Index-ID': indexId || '',
          'X-Project-ID': projectId || '',
          'X-Organization-ID': organizationId || '',
        },
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        setError('Failed to delete document');
      }
    } catch (err) {
      setError('Error deleting document');
    }
  };

  return (
    <Card className="w-full max-w-3xl mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-0">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center gap-2 p-0 hover:bg-transparent">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <CardTitle className="text-base">Knowledge Base Documents</CardTitle>
            </Button>
          </CollapsibleTrigger>
          <CardDescription className="pl-6 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} in your knowledge base
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No documents yet. Upload some knowledge base documents to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-medium">{document.friendlyName || document.fileName}</h3>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <span>Filename: {document.fileName}</span>
                          {document.category && <span>Category: {document.category}</span>}
                          <span>Added: {new Date(document.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setOpenDocumentId(openDocumentId === document.id ? null : document.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {openDocumentId === document.id && (
                      <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {document.markdown}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}