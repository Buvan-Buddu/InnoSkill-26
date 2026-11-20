export interface SapConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  companyId: string;
  authUrl: string;
  isConfigured: boolean;
}

export function getSapConfig(): SapConfig {
  const baseUrl = process.env.SAP_BASE_URL || '';
  const clientId = process.env.SAP_CLIENT_ID || '';
  const clientSecret = process.env.SAP_CLIENT_SECRET || '';
  const companyId = process.env.SAP_COMPANY_ID || '';
  const authUrl = process.env.SAP_AUTH_URL || (baseUrl ? `${baseUrl.replace(/\/odata\/v2\/?$/, '')}/oauth/token` : '');

  const isConfigured = Boolean(baseUrl && (clientId || clientSecret || companyId));

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    clientId,
    clientSecret,
    companyId,
    authUrl,
    isConfigured
  };
}

export function isSapConfigured(): boolean {
  return getSapConfig().isConfigured;
}
