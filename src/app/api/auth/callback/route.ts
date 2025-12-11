import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const scope = request.nextUrl.searchParams.get('scope');

    if (!code) {
      return NextResponse.json({
        error: 'No authorization code received',
        message: 'Please authorize the app and try again',
      }, { status: 400 });
    }

    // Return success page with code
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Authorization Complete</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
            .code { background: #f0f0f0; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; }
            .instructions { margin-top: 20px; text-align: left; background: #e8f5e9; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Authorization Successful!</div>
            
            <h2>Your Authorization Code:</h2>
            <div class="code">${code}</div>
            
            <div class="instructions">
              <h3>Next Steps:</h3>
              <ol>
                <li><strong>Copy the code above</strong> (without any spaces)</li>
                <li><strong>Go back to your terminal</strong> where the token generator is running</li>
                <li><strong>Paste the code</strong> when prompted: "📝 Enter authorization code:"</li>
                <li><strong>Press Enter</strong> to complete the setup</li>
              </ol>
            </div>

            <p style="margin-top: 30px; color: #666;">
              <small>This window can be closed after copying the code.</small>
            </p>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({
      error: 'Callback processing error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
