"use client";

import clsx from "clsx";
import { useActionState, useId } from "react";
import type { Mode } from "@/config/modes";
import { site } from "@/config/site";
import { contactForm as copy } from "@/data/contact";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { HONEYPOT, initialContactState, maxLength, type ContactField, type ContactValues } from "@/lib/contactForm";
import { sendContactMessage } from "@/lib/sendContactMessage";

const inputClass =
  "w-full rounded-xl border border-line bg-fg/5 px-4 py-3 text-fg transition-colors duration-200 placeholder:text-fg-2/70 hover:border-fg-2 focus:border-lime-text aria-invalid:border-danger";

/** An email with everything the visitor typed, for when the site couldn't send it. */
function emailInstead(values: ContactValues) {
  const name = `${values.firstName} ${values.lastName}`.trim();
  const body = [values.message, "", name, values.email, values.phone].filter((line, index) => index < 2 || line).join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(`Project enquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
}

/**
 * First name, last name, email, phone (optional) and message, sent to the
 * email address in config/site.ts by a server action. The browser checks the
 * fields first; the server checks them again. Works without JavaScript too.
 */
export function ContactForm({ mode }: { mode: Mode }) {
  const [state, action, pending] = useActionState(sendContactMessage, initialContactState);
  const id = useId();

  const field = (
    name: ContactField,
    options: { type?: "text" | "email" | "tel"; optional?: boolean; wide?: boolean; minLength?: number; pattern?: string } = {},
  ) => {
    const info: { label: string; autoComplete?: string; placeholder?: string } = copy.fields[name];
    const error = state.errors[name];
    const inputId = `${id}-${name}`;
    const errorId = `${inputId}-error`;
    const shared = {
      id: inputId,
      name,
      required: !options.optional,
      maxLength: maxLength[name],
      minLength: options.minLength,
      autoComplete: info.autoComplete,
      placeholder: info.placeholder,
      // Keeps what was typed after a failed attempt; React resets the form to these values.
      defaultValue: state.values[name],
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId : undefined,
    };

    return (
      <div className={clsx("flex flex-col gap-1.5", options.wide && "sm:col-span-2")}>
        <label htmlFor={inputId} className="text-[0.9rem] font-bold">
          {info.label}
          {options.optional && <span className="font-medium text-fg-2"> ({copy.optional})</span>}
        </label>
        {name === "message" ? (
          <textarea rows={5} {...shared} className={clsx(inputClass, "min-h-32 resize-y")} />
        ) : (
          <input type={options.type ?? "text"} pattern={options.pattern} {...shared} className={inputClass} />
        )}
        {error && (
          <p id={errorId} className="m-0 text-[0.85rem] font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form action={action} className="glass relative rounded-[24px] p-6.5 max-[480px]:p-5">
      <h3 className="mb-1.5 text-[1.5rem] leading-tight">{copy.title}</h3>
      <p className="mb-6 text-fg-2">{copy.intro}</p>

      <div className="grid gap-4.5 sm:grid-cols-2">
        {field("firstName")}
        {field("lastName")}
        {field("email", { type: "email" })}
        {field("phone", { type: "tel", optional: true, pattern: "\\+?[0-9 \\(\\)\\.\\-]{7,20}" })}
        {field("message", { wide: true, minLength: 10 })}
      </div>

      <input type="hidden" name="source" value={mode} />
      {/* Only bots fill this in; people never see it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label>
          Company
          <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6">
        <AnimatedButton type="submit" variant="primary" disabled={pending} className="disabled:cursor-wait disabled:opacity-70">
          {pending ? copy.sending : copy.send}
        </AnimatedButton>
      </div>

      {/* Room for two lines is kept, so a message appearing never pushes the page down. */}
      <div aria-live="polite" className="mt-4 min-h-12 text-[0.95rem] font-semibold">
        {state.status === "sent" && <p className="m-0 text-lime-text">{copy.sent.replace("{name}", state.name || "there")}</p>}
        {state.status === "invalid" && <p className="m-0 text-danger">{copy.invalid}</p>}
        {state.status === "rate-limited" && <p className="m-0 text-danger">{copy.tooMany}</p>}
        {state.status === "failed" && (
          <p className="m-0">
            {copy.fallback}{" "}
            <a href={emailInstead(state.values)} className="text-lime-text underline underline-offset-4">
              {copy.fallbackLink}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
