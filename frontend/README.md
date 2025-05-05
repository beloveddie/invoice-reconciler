# FAQ Support Chatbot

A full-stack web app using Next.js and LlamaIndex to create an AI-powered FAQ support chatbot that answers user questions based on your knowledge base documents.

## Overview

This application allows you to:

1. Upload FAQ documents, product manuals, guides, and other knowledge base resources
2. Index these documents for semantic search using LlamaIndex
3. Provide a user-friendly chat interface for users to ask questions
4. Get AI-generated answers based on the relevant information in your knowledge base

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Vector Database**: LlamaCloud for document storage and retrieval
- **Language Model**: OpenAI for generating responses
- **Document Processing**: LlamaIndex for parsing and indexing
- **Authentication**: API key-based authentication

## Getting Started

### Prerequisites

1. LlamaCloud API key (https://cloud.llamaindex.ai/)
2. OpenAI API key (https://platform.openai.com/)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### Using the Application

1. **Login**: Enter your LlamaCloud API key to authenticate
2. **Admin Mode**: Click "Admin Mode" to access document management
3. **Upload Documents**: Upload your FAQ documents, guides, manuals, etc.
4. **Exit Admin Mode**: Return to the chat interface
5. **Ask Questions**: Start asking questions related to your uploaded documents

## Features

- **Document Management**: Upload, view, and delete knowledge base documents
- **Smart Retrieval**: Semantic search to find the most relevant document sections for each query
- **AI-Powered Responses**: Generate natural, helpful responses based on your knowledge base
- **Citation Support**: See the sources used to generate each answer
- **Conversation History**: Track the chat history for context-aware responses
- **Admin Mode**: Separate interface for managing knowledge base content

## Project Structure

```
/src
  /app
    /api            # API routes
      /auth
      /chat
      /documents
      /initialize
    page.tsx        # Main page component
  /components       # React components
    ChatInterface.tsx
    DocumentUpload.tsx
    DocumentsList.tsx
    Login.tsx
  /context          # React context
    ChatContext.tsx
  /lib              # Utility functions
```

## Extending the Application

Here are some ways you can extend this application:

1. **Authentication**: Add user authentication to support multiple users
2. **Analytics**: Track frequent questions to improve your knowledge base
3. **Feedback System**: Allow users to provide feedback on answers
4. **Multi-Language Support**: Add support for multiple languages
5. **Custom Styling**: Brand the interface to match your company's design

## Troubleshooting

If you encounter issues:

1. Make sure your API keys are correctly set up in the environment variables
2. Check that LlamaCloud is properly configured and accessible
3. Ensure your knowledge base documents are in supported formats (PDF, DOCX, TXT, etc.)
4. Check the browser console and server logs for error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.