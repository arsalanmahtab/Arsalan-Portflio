import { contactForm as copy } from "@/data/contact";

/*
 * The contact form's fields, limits and validation, shared by the form
 * (components/sections/shared/ContactForm.tsx) and the server action that
 * sends it (lib/sendContactMessage.ts).
 */

export const contactFields = ["firstName", "lastName", "email", "phone", "message"] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactValues = Record<ContactField, string>;

export const maxLength: Record<ContactField, number> = {
  firstName: 60,
  lastName: 60,
  email: 120,
  phone: 30,
  message: 3000,
};

/** Hidden field that only bots fill in. */
export const HONEYPOT = "company";

export type ContactState = {
  status: "idle" | "invalid" | "sent" | "rate-limited" | "failed";
  /** What was typed, so the fields keep it after a failed attempt. */
  values: ContactValues;
  errors: Partial<Record<ContactField, string>>;
  /** First name, for the thank-you line. */
  name?: string;
};

export const emptyValues: ContactValues = { firstName: "", lastName: "", email: "", phone: "", message: "" };

export const initialContactState: ContactState = { status: "idle", values: emptyValues, errors: {} };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits with optional +, spaces, dashes, dots and brackets; 7 to 15 digits in all. */
const PHONE = /^\+?[\d\s().-]+$/;

/** The submitted values, trimmed. Anything missing becomes an empty string. */
export function readValues(form: FormData): ContactValues {
  const values = { ...emptyValues };
  for (const field of contactFields) {
    const value = form.get(field);
    values[field] = typeof value === "string" ? value.trim() : "";
  }
  return values;
}

/** Field errors, empty when everything is valid. Phone is optional. */
export function validate(values: ContactValues): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  for (const field of contactFields) {
    if (values[field].length > maxLength[field]) errors[field] = copy.errors.tooLong;
  }
  if (!values.firstName) errors.firstName = copy.errors.firstName;
  if (!values.lastName) errors.lastName = copy.errors.lastName;
  if (!EMAIL.test(values.email)) errors.email ??= copy.errors.email;
  const digits = values.phone.replace(/\D/g, "").length;
  if (values.phone && (!PHONE.test(values.phone) || digits < 7 || digits > 15)) errors.phone ??= copy.errors.phone;
  if (values.message.length < 10) errors.message = copy.errors.message;
  return errors;
}
