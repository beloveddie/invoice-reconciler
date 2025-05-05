'use client';

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, File, Upload } from "lucide-react";

export default function DocumentUpload({ className }: { className?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      const fileNames = files.map(file => file.name);
      formData.append('fileNames', JSON.stringify(fileNames));

      const apiKey = localStorage.getItem('apiKey');
      const indexId = localStorage.getItem('index_id');
      const projectId = localStorage.getItem('project_id');
      const organizationId = localStorage.getItem('organization_id');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey || '',
          'X-Index-ID': indexId || '',
          'X-Project-ID': projectId || '',
          'X-Organization-ID': organizationId || '',
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess('Files uploaded successfully');
        setFiles([]);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload files');
      }
    } catch (err) {
      setError('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const acceptedFileTypes = ".pdf,.docx,.doc,.txt,.md,.csv,.json";

  return (
    <Card className={cn("w-full max-w-3xl", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-0">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center gap-2 p-0 hover:bg-transparent">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <CardTitle className="text-base">Upload Knowledge Base Documents</CardTitle>
            </Button>
          </CollapsibleTrigger>
          <CardDescription className="pl-6 mt-1">
            Upload FAQ documents, product manuals, guides, and other resources
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div className="space-y-1">
                    <p>Drag and drop files here, or click to select</p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, Word, Text, Markdown, CSV and JSON
                    </p>
                  </div>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept={acceptedFileTypes}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Selected files ({files.length}):</p>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="truncate max-w-[80%]">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={files.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}