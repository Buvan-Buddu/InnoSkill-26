import { getSapConfig } from './config';
import { SapAuthTokenResponse } from './types';

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export async function getSapAccessToken(): Promise<string | null> {
  const config = getSapConfig();
  if (!config.isConfigured) {
    return null;
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30000) {
    return cachedToken.token;
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret
    });

    if (config.companyId) {
      params.append('company_id', config.companyId);
    }

    const response = await fetch(config.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString(),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`[SAP Auth] OAuth endpoint returned HTTP ${response.status}`);
      return null;
    }

    const data: SapAuthTokenResponse = await response.json();
    if (data && data.access_token) {
      const expiresInMs = (data.expires_in || 3600) * 1000;
      cachedToken = {
        token: data.access_token,
        expiresAt: now + expiresInMs
      };
      return data.access_token;
    }

    return null;
  } catch (err) {
    console.error('[SAP Auth] Token acquisition error:', err);
    return null;
  }
}
