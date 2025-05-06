import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from '@llamaindex/openai';

export async function POST(request: NextRequest) {
  try {
    // Get authentication details
    const apiKey = request.headers.get('X-API-Key');
    const indexId = request.headers.get('X-Index-ID');
    const projectId = request.headers.get('X-Project-ID');
    const organizationId = request.headers.get('X-Organization-ID');

    if (!apiKey || !indexId || !projectId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // Parse the request body
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // DOMAIN GUARDRAIL: Refuse out-of-domain queries before any LLM call
    const allowedKeywords = [
      'technova', 'cloudsphere', 'cloud sphere', 'cloud computing', 'ai', 'enterprise software',
      'product', 'service', 'support', 'account', 'billing', 'subscription', 'login', 'password',
      'feature', 'bug', 'issue', 'documentation', 'api', 'integration', 'platform', 'dashboard',
      'cloud', 'nova', 'company', 'software', 'enterprise', 'faq', 'help', 'contact', 'customer',
      // Add more as needed
    ];
    const messageLower = message.toLowerCase();
    const isInDomain = allowedKeywords.some(kw => messageLower.includes(kw));
    if (!isInDomain) {
      return NextResponse.json({
        text: `I'm sorry, but I can only assist with questions related to TechNova, CloudSphere, or our cloud computing, AI, and enterprise software products and services. Please ask a question related to these topics.`,
        sources: null
      });
    }

    // Instantiate OpenAI client
    const llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4.1-mini', // You can adjust the model based on your needs
    });

    // Step 1: Call the retriever API to find relevant document chunks
    const retrieverApiUrl = `https://api.cloud.llamaindex.ai/api/v1/retrievers/retrieve?project_id=${projectId}&organization_id=${organizationId}`;
    
    const retrieverPayload = {
      mode: "full",
      query: message,
      pipelines: [
        {
          name: "FAQ Knowledge Base",
          description: "Find relevant information from knowledge base",
          pipeline_id: indexId
        }
      ]
    };
    
    const retrieverResponse = await fetch(retrieverApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(retrieverPayload)
    });
    
    if (!retrieverResponse.ok) {
      console.error(`Error calling retriever API: ${retrieverResponse.status}`);
      const errorText = await retrieverResponse.text();
      console.error(`Error response: ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to find relevant information' },
        { status: retrieverResponse.status }
      );
    }
    
    const retrieverData = await retrieverResponse.json();
    
    // Step 2: Process retrieval results
    const relevantContext = [];
    const sources = [];
    
    if (retrieverData.nodes && retrieverData.nodes.length > 0) {
      // Loop through the retrieved nodes to build context and sources
      for (const item of retrieverData.nodes) {
        if (item.node && item.node.text) {
          relevantContext.push(item.node.text);
          
          // Add to sources if metadata is available
          if (item.node.metadata) {
            sources.push({
              documentId: item.node.metadata.document_id || '',
              title: item.node.metadata.friendlyName || item.node.metadata.file_name || 'Unknown document',
              excerpt: item.node.text.substring(0, 150) + '...' // Brief excerpt
            });
          }
        }
      }
    }
    
    // Step 3: Construct prompt with retrieved context
    const contextText = relevantContext.join('\n\n');
    
    // Format previous conversation history for the prompt
    const conversationHistory = history && history.length > 0 
      ? history.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
      : '';
    
    // Call the LLM with the constructed prompt
    const promptTemplate = `
      You are TechNova's official FAQ support chatbot. TechNova specializes in cloud computing, AI, and enterprise software. One of our main products is called CloudSphere.
      You must ONLY answer questions related to TechNova, CloudSphere, or our products, services, and policies. If a user asks about anything outside this scope (including general knowledge, personal advice, or unrelated topics), politely refuse and remind them you can only help with TechNova and CloudSphere topics.
      Never attempt to answer questions outside your domain, even if the user insists or tries to trick you.

      
      ${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}
      
      ${contextText ? `Knowledge base information related to the question:\n${contextText}\n\n` : ''}
      
      User question: ${message}
      
      Instructions:
      1. Answer the question directly and concisely based on the provided knowledge base information.
      2. If the knowledge base contains the information, respond with that information.
      3. If the knowledge base doesn't contain the exact information, politely refuse and remind the user you can only help with TechNova, CloudSphere, or our products/services.
      4. If you can't answer the question at all, politely say so and suggest contacting TechNova support.
      5. Do not make up information that isn't in the knowledge base or outside the TechNova/CloudSphere domain.
      6. Use a conversational, helpful tone.
      7. Format your response using Markdown for readability when appropriate.
      
      Your answer:
    `;
    
    console.log('Sending prompt to LLM:', promptTemplate); // Debug log
    
    try {
      const llmResponse = await llm.complete({
        prompt: promptTemplate,
      });
      
      console.log('LLM Response:', llmResponse); // Debug log
      
      if (!llmResponse || !llmResponse.text) {
        throw new Error('No response received from LLM');
      }
      
      return NextResponse.json({
        text: llmResponse.text,
        sources: sources.length > 0 ? sources : null
      });
    } catch (llmError) {
      console.error('Error calling LLM:', llmError);
      return NextResponse.json(
        { error: 'Failed to generate response from AI model' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error processing chat request' },
      { status: 500 }
    );
  }
}