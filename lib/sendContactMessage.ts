"use server";

import { headers } from "next/headers";
import { modes } from "@/config/modes";
import { site } from "@/config/site";
import { emptyValues, HONEYPOT, readValues, validate, type ContactState, type ContactValues } from "@/lib/contactForm";

/*
 * Sends a contact-form message to the email address in config/site.ts through
 * Resend (https://resend.com). Set RESEND_API_KEY to turn sending on; without it
 * (or if Resend fails) the visitor is offered a ready-made email instead.
 * CONTACT_FROM_EMAIL optionally sets the sender, e.g. "Portfolio <hello@yourdomain.com>"
 * once your domain is verified in Resend.
 */

const RATE_LIMIT = { messages: 5, windowMs: 10 * 60_000 };
const DEFAULT_FROM = "Portfolio contact form <onboarding@resend.dev>";

const recent = new Map<string, number[]>();

function rateLimited(visitor: string) {
  const now = Date.now();
  const sent = (recent.get(visitor) ?? []).filter((time) => now - time < RATE_LIMIT.windowMs);
  sent.push(now);
  recent.set(visitor, sent);
  if (recent.size > 5_000) recent.clear();
  return sent.length > RATE_LIMIT.messages;
}

async function deliver(values: ContactValues, page: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("contact: RESEND_API_KEY is not set, so the message was not emailed");
    return false;
  }

  const name = `${values.firstName} ${values.lastName}`.replace(/[\r\n]+/g, " ");
  const text = [
    `Name: ${name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone || "not given"}`,
    `Sent from: ${page}`,
    "",
    values.message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM,
        to: [site.email],
        reply_to: values.email,
        subject: `New message from ${name} (${page})`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`contact: Resend answered ${response.status}`, await response.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("contact: could not reach Resend", error);
    return false;
  }
}

/** The contact form's action (used with useActionState). */
export async function sendContactMessage(_previous: ContactState, form: FormData): Promise<ContactState> {
  const values = readValues(form);

  // Only bots fill in the hidden field: thank them and send nothing.
  if (form.get(HONEYPOT)) return { status: "sent", values: emptyValues, errors: {}, name: values.firstName };

  const errors = validate(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors };

  const visitor = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(visitor)) return { status: "rate-limited", values, errors: {} };

  const page = modes[form.get("source") === "software" ? "software" : "shop"].switchTitle;
  const sent = await deliver(values, page);
  return sent
    ? { status: "sent", values: emptyValues, errors: {}, name: values.firstName }
    : { status: "failed", values, errors: {} };
}
