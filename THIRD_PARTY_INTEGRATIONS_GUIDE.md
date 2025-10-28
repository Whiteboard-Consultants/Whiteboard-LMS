# WhitedgeLMS - Third-Party Integrations Guide

**Date:** October 23, 2025  
**Status:** Implementation Ready

---

## Table of Contents

1. [Google reCAPTCHA](#google-recaptcha)
2. [Google Analytics](#google-analytics)
3. [Google Tag Manager](#google-tag-manager)
4. [Meta Pixel (Facebook Pixel)](#meta-pixel)
5. [Chatbot Integration](#chatbot-integration)
6. [Implementation Priority](#implementation-priority)

---

## Google reCAPTCHA

### What It Does
Protects your forms from bot spam and abuse by verifying user interactions.

### Setup Steps

#### Step 1: Create reCAPTCHA Project

1. Go to https://www.google.com/recaptcha/admin
2. Click "Create" or "+" button
3. Fill in form:
   - **Label:** WhitedgeLMS
   - **reCAPTCHA Type:** Select "reCAPTCHA v3" (recommended) or "reCAPTCHA v2"
   - **Domains:** 
     - `localhost` (dev)
     - `whitedgelms.vercel.app` (production)
     - Your custom domain (if you have one)
4. Accept terms and click "Create"
5. Copy:
   - **Site Key** (public, put in code)
   - **Secret Key** (private, keep secret!)

#### Step 2: Install Package

```bash
npm install @react-hook-form/resolvers
# Already have react-hook-form in your project
```

#### Step 3: Add Environment Variables

**.env.local:**
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**.env.production:**
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

#### Step 4: Create reCAPTCHA Component

**`src/components/recaptcha-wrapper.tsx`:**
```typescript
'use client';

import { useEffect, useRef } from 'react';

interface RecaptchaWrapperProps {
  onToken: (token: string) => void;
  onError?: () => void;
}

export function RecaptchaWrapper({ onToken, onError }: RecaptchaWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          callback: onToken,
          'error-callback': onError,
        });
      }
    };

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = loadRecaptcha;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, [onToken, onError]);

  return <div ref={containerRef} />;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}
```

#### Step 5: Add to Registration Form

**`src/components/register-form.tsx`** (example):
```typescript
'use client';

import { useState } from 'react';
import { RecaptchaWrapper } from './recaptcha-wrapper';

export function RegisterForm() {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    // Send form with recaptcha token
    const formData = new FormData(e.currentTarget);
    formData.append('recaptchaToken', recaptchaToken);

    // Your form submission logic
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    });

    // Handle response...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      
      <RecaptchaWrapper 
        onToken={setRecaptchaToken}
        onError={() => setRecaptchaToken(null)}
      />
      
      <button type="submit" disabled={!recaptchaToken}>
        Register
      </button>
    </form>
  );
}
```

#### Step 6: Verify Token on Backend

**`src/app/api/auth/register/route.ts`** (example):
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const recaptchaToken = formData.get('recaptchaToken') as string;

  // Verify token with Google
  const verificationResponse = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    }
  );

  const verificationData = await verificationResponse.json();

  if (!verificationData.success) {
    return NextResponse.json(
      { error: 'reCAPTCHA verification failed' },
      { status: 400 }
    );
  }

  // For v3, check score (0.0 to 1.0, higher = more likely human)
  if (verificationData.score < 0.5) {
    return NextResponse.json(
      { error: 'Suspicious activity detected' },
      { status: 403 }
    );
  }

  // Continue with registration...
}
```

### Where to Use
- Registration form ✅ **Critical**
- Login form ✅ **Important**
- Contact form ✅ **Important**
- Password reset ✅ **Recommended**
- File upload forms ✅ **Recommended**

### Pros & Cons
| Pros | Cons |
|------|------|
| Free | Privacy concerns (Google tracking) |
| Highly effective | Users may be uncomfortable |
| v3 invisible to users | Slight performance overhead |
| v2 user-friendly | v2 requires user interaction |

---

## Google Analytics

### What It Does
Tracks user behavior, traffic sources, page views, user engagement metrics.

### Setup Steps

#### Step 1: Create Google Analytics Property

1. Go to https://analytics.google.com
2. Click "Start Measuring"
3. Create new property:
   - **Property name:** WhitedgeLMS
   - **Time zone:** Your timezone
   - **Currency:** INR (or your currency)
4. Select platform: **Web**
5. Add website data:
   - **Website URL:** https://whitedgelms.vercel.app
   - **Stream name:** WhitedgeLMS Web
6. Get **Measurement ID** (looks like `G-XXXXXXXXXX`)

#### Step 2: Install Next.js Analytics Package

```bash
npm install @next/third-parties
```

#### Step 3: Add Environment Variable

**.env.local & .env.production:**
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Step 4: Add to Layout

**`src/app/layout.tsx`:**
```typescript
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}
```

#### Step 5: Track Custom Events (Optional)

**`src/lib/analytics.ts`:**
```typescript
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

declare global {
  interface Window {
    gtag: (command: string, action: string, data?: any) => void;
  }
}

// Usage examples:
// trackEvent('user_registration', { email: 'user@example.com' });
// trackEvent('course_enrolled', { courseId: '123', courseName: 'Python 101' });
// trackEvent('payment_completed', { amount: 299, currency: 'INR' });
```

#### Step 6: Track Events in Components

**Example in course enrollment:**
```typescript
import { trackEvent } from '@/lib/analytics';

async function enrollCourse(courseId: string) {
  // ... enrollment logic ...
  
  trackEvent('course_enrolled', {
    course_id: courseId,
    course_type: 'paid',
    timestamp: new Date().toISOString(),
  });
}
```

### What You'll Track
- Page views automatically ✅
- User registrations 📊
- Course enrollments 📊
- Payment completions 📊
- Quiz/test completions 📊
- Login events 📊
- Downloads 📊

### Dashboards to Monitor
- Real-time visitors
- Traffic sources
- User demographics
- Device types
- Geographic location
- Course popularity

---

## Google Tag Manager

### What It Does
Centralized tag management without code changes. Manage GA, pixels, conversion tracking, etc.

### Setup Steps

#### Step 1: Create GTM Container

1. Go to https://tagmanager.google.com
2. Click "Create Account"
3. Fill form:
   - **Account name:** Whiteboard Consultants
   - **Container name:** WhitedgeLMS Web
   - **Target platform:** Web
4. Accept terms and create
5. Copy **Container ID** (looks like `GTM-XXXXXXXXX`)

#### Step 2: Install GTM Package

```bash
npm install @next/third-parties
# Already installed from GA step above
```

#### Step 3: Add Environment Variable

**.env.local & .env.production:**
```
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXXX
```

#### Step 4: Add to Layout

**`src/app/layout.tsx`:**
```typescript
import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### Step 5: Set Up Tags in GTM Dashboard

1. Go to GTM container
2. Create tags for:
   - **Google Analytics 4:** Link GA to GTM
   - **Conversion Tracking:** Track specific actions
   - **Event Tracking:** Track custom events
3. Create triggers for:
   - Page views
   - Button clicks
   - Form submissions
4. Publish container

### GTM vs Direct GA
| Aspect | GTM | Direct GA |
|--------|-----|----------|
| Setup | More complex | Simple |
| Flexibility | Very flexible | Limited |
| Code changes | No (mostly) | Yes |
| Tag management | Central dashboard | Scattered |
| Learning curve | Steep | Easy |
| Recommendation | **For teams** | For simple tracking |

---

## Meta Pixel

### What It Does
Track conversions from Facebook ads, build audiences for retargeting, measure ROI.

### Setup Steps

#### Step 1: Create Meta Business Account

1. Go to https://business.facebook.com
2. Create business account
3. Go to Business Settings → Data Sources
4. Create new pixel
5. Copy **Pixel ID** (16-digit number)

#### Step 2: Add Environment Variable

**.env.local & .env.production:**
```
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_here
```

#### Step 3: Create Pixel Component

**`src/lib/facebook-pixel.ts`:**
```typescript
export function initFacebookPixel() {
  if (typeof window !== 'undefined') {
    // Load Facebook Pixel Script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Fallback image
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);
  }
}

export function trackPixelEvent(
  eventName: string,
  eventData?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData);
  }
}

declare global {
  interface Window {
    fbq: (command: string, event: string, data?: any) => void;
  }
}
```

#### Step 4: Initialize in Layout

**`src/app/layout.tsx`:**
```typescript
'use client';

import { useEffect } from 'react';
import { initFacebookPixel } from '@/lib/facebook-pixel';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Step 5: Track Conversion Events

**`src/lib/facebook-pixel.ts` - Add tracking functions:**
```typescript
export const FacebookPixelEvents = {
  // Standard events
  pageView: () => trackPixelEvent('PageView'),
  viewContent: (contentId: string, contentName: string) =>
    trackPixelEvent('ViewContent', {
      content_id: contentId,
      content_name: contentName,
      content_type: 'course',
    }),
  addToCart: (value: number, currency: string = 'INR') =>
    trackPixelEvent('AddToCart', { value, currency }),
  purchase: (value: number, currency: string = 'INR', courseId?: string) =>
    trackPixelEvent('Purchase', {
      value,
      currency,
      content_id: courseId,
      content_type: 'course',
    }),
  lead: (email?: string, phone?: string) =>
    trackPixelEvent('Lead', { em: email, ph: phone }),
  completeRegistration: (email?: string) =>
    trackPixelEvent('CompleteRegistration', { em: email }),
};
```

#### Step 6: Use in Components

**Example - Course Purchase:**
```typescript
import { FacebookPixelEvents } from '@/lib/facebook-pixel';

async function completePurchase(courseId: string, amount: number) {
  // ... payment processing ...
  
  FacebookPixelEvents.purchase(amount, 'INR', courseId);
}
```

### Events to Track
| Event | When | Importance |
|-------|------|-----------|
| PageView | Every page load | ✅ Auto |
| ViewContent | Course detail page | 📊 Important |
| AddToCart | Course added to cart | 📊 Important |
| Purchase | Payment complete | 🔴 Critical |
| Lead | User registration | 📊 Important |
| CompleteRegistration | Profile complete | 📊 Recommended |

---

## Chatbot Integration

### Option 1: Embed Existing Chatbot (Easiest)

#### Using Tidio (Recommended for Education)

**Pros:** Easy setup, affordable, good for customer support  
**Cost:** Free tier available, paid from $25/month

1. Go to https://www.tidio.com
2. Sign up
3. Get **Chat Widget ID**
4. Add to layout:

```typescript
// src/app/layout.tsx
useEffect(() => {
  // Tidio script
  const script = document.createElement('script');
  script.src = 'https://code.tidio.co/YOUR_WIDGET_ID.js';
  script.async = true;
  document.head.appendChild(script);
}, []);
```

#### Using Intercom (Professional CRM)

**Pros:** Professional, detailed analytics, CRM integration  
**Cost:** From $39/month

```bash
npm install @intercom/messenger-js-sdk
```

```typescript
// src/app/layout.tsx
import { useEffect } from 'react';

useEffect(() => {
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "YOUR_APP_ID",
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = "https://js.intercom-cdn.com/frame.js";
  document.body.appendChild(script);
}, []);
```

#### Using Drift (Sales-Focused)

**Pros:** Lead qualification, sales focused  
**Cost:** From $500/month

```typescript
// Add to layout
useEffect(() => {
  const script = document.createElement('script');
  script.innerHTML = `window.drift = window.drift || {};
    window.drift.config = {
      apiKey: 'YOUR_API_KEY'
    };`;
  document.head.appendChild(script);

  const driftScript = document.createElement('script');
  driftScript.src = 'https://js.driftt.com/include/YOUR_ORG_ID/platform.js';
  driftScript.async = true;
  document.body.appendChild(driftScript);
}, []);
```

---

### Option 2: Build Custom AI Chatbot (Advanced)

#### Using OpenAI API

**1. Install Package:**
```bash
npm install openai
```

**2. Add Environment Variables:**
```
OPENAI_API_KEY=your_api_key_here
NEXT_PUBLIC_CHATBOT_ENABLED=true
```

**3. Create API Route:**

**`src/app/api/chat/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, courseContext } = await request.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful educational assistant for WhitedgeLMS. 
            You help students with courses, learning materials, and general questions.
            ${courseContext ? `Current course context: ${courseContext}` : ''}
            Be friendly, concise, and helpful.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
```

**4. Create Chatbot Component:**

**`src/components/ai-chatbot.tsx`:**
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all z-50"
        aria-label="Open chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">WhitedgeLMS Assistant</h3>
            <p className="text-sm opacity-90">How can I help you today?</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>Start a conversation with our AI assistant!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t p-4 flex gap-2"
          >
            <Input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
```

**5. Add to Layout:**

```typescript
import { AIChatbot } from '@/components/ai-chatbot';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NEXT_PUBLIC_CHATBOT_ENABLED === 'true' && <AIChatbot />}
      </body>
    </html>
  );
}
```

---

### Option 3: Using Gemini API (Already Configured!)

Since you already have Gemini API configured, you can use it for chatbot:

```typescript
// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  const { message } = await request.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const systemPrompt = `You are WhitedgeLMS educational assistant. Help with:
    - Course questions
    - Learning strategies
    - Study tips
    - Technical support
    Keep responses concise and helpful.`;

  const result = await model.generateContent([
    systemPrompt,
    message,
  ]);

  const response = await result.response;
  const text = response.text();

  return Response.json({ message: text });
}
```

**Pros:** Already have API key, cost-effective, powerful  
**Cost:** Already paying for Gemini API

---

## Implementation Priority

### Phase 1: Essential (Do First) ✅
1. **Google Analytics** - Understand your users
2. **Meta Pixel** - Track conversions for ads
3. **Google reCAPTCHA** - Protect forms

**Estimated Time:** 2-3 hours  
**Effort:** Low  
**ROI:** High

### Phase 2: Important (Next)
1. **Google Tag Manager** - Advanced tracking
2. **Simple Chatbot** - Using Tidio (embedded)

**Estimated Time:** 3-4 hours  
**Effort:** Medium  
**ROI:** High

### Phase 3: Advanced (Later)
1. **Custom AI Chatbot** - Using OpenAI/Gemini
2. **Advanced Analytics** - Custom dashboards

**Estimated Time:** 5-8 hours  
**Effort:** High  
**ROI:** Medium-High

---

## Quick Implementation Order

```
Week 1:
  ✅ Google Analytics (30 min)
  ✅ Meta Pixel (30 min)
  ✅ Google reCAPTCHA on registration (1 hour)

Week 2:
  ✅ Google Tag Manager (1 hour)
  ✅ Tidio Chatbot (30 min - embedded)

Week 3:
  ✅ Custom AI Chatbot (4-5 hours)
  ✅ Advanced tracking setup (2 hours)
```

---

## Cost Breakdown

| Service | Tier | Cost/Month | Notes |
|---------|------|-----------|-------|
| Google Analytics | Free | $0 | Forever free |
| Google reCAPTCHA | Free | $0 | Forever free |
| Google Tag Manager | Free | $0 | Forever free |
| Meta Pixel | Free | $0 | Forever free |
| Tidio | Free | $0 | Limited features |
| Tidio | Pro | $25 | Recommended |
| Intercom | Basic | $39 | Professional |
| OpenAI | Usage | ~$10-50 | Pay-as-you-go |
| **Total** | **Recommended** | **~$35-75** | **Per month** |

---

## Next Steps

1. **Choose services:** Google Analytics + Meta Pixel + reCAPTCHA (free tier)
2. **Create accounts:** Gather all API keys/IDs
3. **Implement:** Follow guides above
4. **Test:** Verify tracking works
5. **Monitor:** Check dashboards weekly

---

## Questions?

- **General Implementation:** See each service section above
- **Environment Variables:** Check `.env.production` template
- **Code Examples:** All provided in this guide
- **Support:** Refer to official docs (links provided)

---

*Document Created: October 23, 2025*  
*For: WhitedgeLMS Production Deployment*
