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
  const pixelIds = getConfiguredPixelIds();
  const accessToken = process.env.FACEBOOK_CAPI_ACCESS_TOKEN;
  const accessToken2 = process.env.FACEBOOK_CAPI_ACCESS_TOKEN_2;
  const testEventCode = process.env.FACEBOOK_CAPI_TEST_EVENT_CODE?.trim();

  if (pixelIds.length === 0 || (!accessToken && !accessToken2)) {
    console.warn('Meta Conversions API is not fully configured. Skipping server-side lead.');
    return false;
  }

  const normalizedSourceUrl = normalizeEventSourceUrl(eventSourceUrl);
  const payloadBase = {
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

  const results = await Promise.all(
    pixelIds.map(async (pixelId, index) => {
      const token =
        index === 0
          ? accessToken || accessToken2
          : accessToken2;

      if (!token) {
        console.warn(`Meta CAPI skipped for pixel ${pixelId}: missing access token`);
        return false;
      }

      const endpoint = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadBase),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          `Meta CAPI lead event failed for pixel ${pixelId}:`,
          response.status,
          responseText
        );
        return false;
      }

      console.log(`Meta CAPI lead event accepted for pixel ${pixelId}:`, responseText);
      return true;
    })
  );

  return results.some(Boolean);
}

function getConfiguredPixelIds(): string[] {
  const ids = new Set<string>();

  const primary =
    process.env.FACEBOOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim();
  if (primary) ids.add(primary);

  const secondary = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID_2?.trim();
  if (secondary) ids.add(secondary);

  const list = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS?.split(',') ?? [];
  for (const id of list) {
    const trimmed = id.trim();
    if (trimmed) ids.add(trimmed);
  }

  return Array.from(ids);
}
