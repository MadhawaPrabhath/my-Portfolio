/**
 * Contact form adapter.
 *
 * The form calls `sendContactMessage()` and doesn't care which service is used.
 * Configure ONE provider with environment variables (see README):
 *
 *   Web3Forms:  NEXT_PUBLIC_WEB3FORMS_KEY=xxxxxxxx-xxxx-...   (recommended)
 *   Formspree:  NEXT_PUBLIC_FORMSPREE_ID=xxxxxxx
 *   EmailJS:    NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
 *               NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
 *
 * With neither configured, the form falls back to opening the visitor's
 * email client with the message pre-filled (mailto:).
 */

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type ContactResult =
  | { ok: true; via: "web3forms" | "formspree" | "emailjs" | "mailto" }
  | { ok: false; error: string };

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;
const EMAILJS = {
  service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  template: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

export async function sendContactMessage(data: ContactPayload, fallbackEmail: string): Promise<ContactResult> {
  try {
    if (WEB3FORMS_KEY) {
      // Web3Forms delivers to the email address the access key was created for.
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Portfolio enquiry from ${data.name}`,
          from_name: "Portfolio contact form",
          name: data.name,
          email: data.email, // Web3Forms sets this as Reply-To
          message: data.message,
        }),
      });
      const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      return res.ok && json?.success
        ? { ok: true, via: "web3forms" }
        : { ok: false, error: "The message could not be sent — please email me directly." };
    }

    if (FORMSPREE_ID) {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      return res.ok ? { ok: true, via: "formspree" } : { ok: false, error: "The message could not be sent." };
    }

    if (EMAILJS.service && EMAILJS.template && EMAILJS.publicKey) {
      // EmailJS REST API — no SDK needed.
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS.service,
          template_id: EMAILJS.template,
          user_id: EMAILJS.publicKey,
          template_params: { from_name: data.name, reply_to: data.email, message: data.message },
        }),
      });
      return res.ok ? { ok: true, via: "emailjs" } : { ok: false, error: "The message could not be sent." };
    }

    // No provider configured → mailto fallback.
    const subject = encodeURIComponent(`Portfolio enquiry from ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
    window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
    return { ok: true, via: "mailto" };
  } catch {
    return { ok: false, error: "Network error — please try again or email me directly." };
  }
}
