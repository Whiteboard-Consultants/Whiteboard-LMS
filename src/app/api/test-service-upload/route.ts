import { NextRequest, NextResponse } from 'next/server';
import { testServiceUpload } from '@/lib/test-service-upload';

export async function POST(request: NextRequest) {
  console.log('🧪 Service upload test API called');
  
  try {
    const result = await testServiceUpload();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Service role upload test successful',
        url: result.url 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}