import { FormEvent, useState } from "react";

const FIELDS = [
  { id: "name", label: "Your name", type: "text", ph: "Aman Sharma" },
  { id: "email", label: "Email", type: "email", ph: "you@example.com" },
];

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent)
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-beige p-10 text-center">
        <p className="font-display text-[26px]">Message received</p>
        <p className="mt-3 max-w-xs text-[15px] text-warmgray">We'll reply to your email within a few working hours.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-7 rounded-2xl bg-beige p-8">
      {FIELDS.map((f) => (
        <div key={f.id}>
          <label htmlFor={f.id} className="label text-warmgray">{f.label}</label>
          <input id={f.id} type={f.type} required placeholder={f.ph} className="mt-3 w-full border-b border-softblack/25 bg-transparent pb-2.5 text-[15px] placeholder:text-softblack/30 focus:border-softblack focus:outline-none" />
        </div>
      ))}
      <div>
        <label htmlFor="msg" className="label text-warmgray">Message</label>
        <textarea id="msg" required rows={5} placeholder="Order number, size question, anything." className="mt-3 w-full resize-none border-b border-softblack/25 bg-transparent pb-2.5 text-[15px] placeholder:text-softblack/30 focus:border-softblack focus:outline-none" />
      </div>
      <button type="submit" className="label w-full rounded-full bg-softblack py-4 text-[12px] text-ivory transition-transform hover:scale-[1.01]">
        Send message
      </button>
    </form>
  );
}
