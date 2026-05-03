/* ──────────────────────────────────────────────────────
 *  emailRelay.ts  –  E‑mail helper used by the Scotia screens
 *
 *  Exported as a *named* export (`EmailRelay`) and *also* as a default export
 *  so you can import in either style if you prefer.
 * ──────────────────────────────────────────────────────
 */
const API_BASE = '/api';
const DEFAULT_TOKEN = 'projectsarah';
/**
 * Read the token from the URL query string (`?token=…`) or
 * fallback to a hard‑coded default (matches PHP's env).
 */
export function getAuthToken() {
    if (typeof window === 'undefined') {
        return DEFAULT_TOKEN; // SSR / Node
    }
    const qs = new URLSearchParams(window.location.search);
    return qs.get('token') ?? DEFAULT_TOKEN;
}
export class RuntimeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RuntimeError';
    }
}
/**
 * POST the payload to `/api/mailer.php`.
 *
 * The token is sent as **both**
 * – a query string (`?token=…`) (for the PHP `$_GET['token']`), and
 * – an `X‑Auth‑Token` header (useful if a CDN strips the query string).
 */
export async function sendEmail(payload, baseUrl) {
    const token = getAuthToken();
    const url = baseUrl || `${API_BASE}/mailer?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token, // <-- crucial for “token not found”
        },
        body: JSON.stringify(payload), // **no** token here
    });
    const rawText = await res.text();
    // Try to JSON‑parse; be explicit if parsing fails
    let data;
    try {
        data = JSON.parse(rawText);
    }
    catch {
        throw new RuntimeError(`Unexpected response (HTTP ${res.status})`);
    }
    if (typeof data !== 'object' || data === null) {
        throw new RuntimeError(`Unexpected response type (HTTP ${res.status})`);
    }
    const result = data;
    // PHP sets `success:true` on success.
    if (!res.ok || !result.success) {
        const msg = result.message ??
            result.error ??
            `HTTP ${res.status}`;
        throw new RuntimeError(msg);
    }
    return result;
}
/**
 * Optional debug helper that hits `/api/mailer-debug.php`.
 */
export async function sendDebug(payload) {
    const token = getAuthToken();
    const url = `${API_BASE}/mailer-debug?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const text = await res.text();
    try {
        return (text ? JSON.parse(text) : {});
    }
    catch {
        throw new RuntimeError(`Failed to parse debug response: ${text}`);
    }
}
/* ---------  Make the helpers available BOTH as a named *and* default export --------- */
export default { sendEmail, sendDebug, getAuthToken, RuntimeError };
