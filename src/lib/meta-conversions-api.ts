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

function buildUserData(input: MetaLeadUserData) {
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const firstName = normalizeNamePart(input.firstName);
  const lastName = normalizeNamePart(input.lastName);

  return {
    ...(email ? { em: [sha256(email)] } : {}),
    ...(phone ? { ph: [sha256(phone)] } : {}),
    ...(firstName ? { fn: [sha256(firstName)] } : {}),
    ...(lastName ? { ln: [sha256(lastName)] } : {}),
    ...(input.fbp ? { fbp: input.fbp } : {}),
    ...(input.fbc ? { fbc: input.fbc } : {}),
    ...(input.clientIpAddress ? { client_ip_address: input.clientIpAddress } : {}),
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
  const testEventCode = process.env.FACEBOOK_CAPI_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn('Meta Conversions API is not fully configured. Skipping server-side lead.');
    return false;
  }

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: buildUserData(userData),
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const response = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Meta CAPI lead event failed:', response.status, errorText);
    return false;
  }

  return true;
}
