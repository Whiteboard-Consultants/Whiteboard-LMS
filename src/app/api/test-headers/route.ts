import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Test Headers Endpoint Called');
    console.log('All Headers:', Object.fromEntries(request.headers));
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('Content-Length:', request.headers.get('content-length'));
    
    return NextResponse.json({
      contentType: request.headers.get('content-type'),
      headers: Object.fromEntries(request.headers)
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
