import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const organizationId = request.headers.get('X-Organization-Id');
    const projectId = request.headers.get('X-Project-Id');
    const indexId = request.headers.get('X-Index-Id');

    if (!apiKey || !organizationId || !projectId || !indexId) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.cloud.llamaindex.ai/api/v1/pipelines/${indexId}/documents`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Organization-Id': organizationId,
          'X-Project-Id': projectId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the response into our expected format
    const documents = data.map((doc: any) => ({
      id: doc.id,
      friendlyName: doc.metadata?.friendlyName || null,
      fileName: doc.metadata?.file_name || 'Unknown file',
      markdown: doc.text,
      category: doc.metadata?.category || null,
      uploadDate: doc.metadata?.upload_date || new Date().toISOString()
    }));

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error in documents list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}