import { createHash } from 'node:crypto';

type MetaLeadUserData = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
};

type SendMetaLeadEventInput = {
  eventId: string;
  eventSourceUrl: string;
  userData: MetaLeadUserData;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email?: string): string | undefined {
  const value = email?.trim().toLowerCase();
  return value || undefined;
}

function normalizePhone(phone?: string): string | undefined {
  const digits = phone?.replace(/\D/g, '');
  return digits || undefined;
}

function normalizeNamePart(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase().replace(/[^a-z]/g, '');
  return normalized || undefined;
}

function normalizeIpAddress(ip?: string): string | undefined {
  if (!ip) return undefined;

  // x-forwarded-for can be a comma-separated list; Meta wants a single IP.
  const candidate = ip.split(',')[0]?.trim();
  if (!candidate || candidate.toLowerCase() === 'unknown') return undefined;

  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  if (ipv4.test(candidate) || ipv6.test(candidate)) return candidate;
  return undefined;
}

function normalizeEventSourceUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function buildUserData(input: MetaLeadUserData) {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const firstName = normalizeNamePart(input.firstName);
  const lastName = normalizeNamePart(input.lastName);
  const clientIpAddress = normalizeIpAddress(input.clientIpAddress);

  return {
    ...(email ? { em: [sha256(email)] } : {}),
    ...(phone ? { ph: [sha256(phone)] } : {}),
    ...(firstName ? { fn: [sha256(firstName)] } : {}),
    ...(lastName ? { ln: [sha256(lastName)] } : {}),
    ...(input.fbp ? { fbp: input.fbp } : {}),
    ...(input.fbc ? { fbc: input.fbc } : {}),
    ...(clientIpAddress ? { client_ip_address: clientIpAddress } : {}),
    ...(input.clientUserAgent ? { client_user_agent: input.clientUserAgent } : {}),
  };
}

export async function sendMetaLeadEvent({
  eventId,
  eventSourceUrl,
  userData,
}: SendMetaLeadEventInput): Promise<boolean> {
  const pixelId = process.env.FACEBOOK_PIXEL_ID || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.FACEBOOK_CAPI_TEST_EVENT_CODE?.trim();

  if (!pixelId || !accessToken) {
    console.warn('Meta Conversions API is not fully configured. Skipping server-side lead.');
    return false;
  }

  const normalizedSourceUrl = normalizeEventSourceUrl(eventSourceUrl);

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        ...(normalizedSourceUrl ? { event_source_url: normalizedSourceUrl } : {}),
        user_data: buildUserData(userData),
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  // Meta's documented auth for CAPI is access_token as a query param.
  const endpoint = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('Meta CAPI lead event failed:', response.status, responseText);
    return false;
  }

  console.log('Meta CAPI lead event accepted:', responseText);
  return true;
}
