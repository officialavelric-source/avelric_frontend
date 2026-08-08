import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import StitchDivider from "../common/StitchDivider";
import { CashIcon, ReturnIcon, ShieldCheckIcon, TruckIcon } from "../common/TrustIcons";
import { FOOTER_COLS } from "../../constants/navigation";

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-softblack/20 text-softblack transition-colors hover:bg-softblack hover:text-ivory"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) setDone(true);
  };

  return (
    <footer className="bg-ivory pt-4">
      <StitchDivider />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.2fr]">
          {/* brand + newsletter + social */}
          <div>
            <p className="font-display text-[22px] tracking-[0.28em]">AVELRIC</p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-warmgray">
              A curated menswear store. We search the market, compare the makers, and list only
              what passes our quality check — so you don't have to search at all.
            </p>
            <form onSubmit={submit} className="mt-8 max-w-sm">
              <label htmlFor="nl" className="label text-warmgray">Join the list</label>
              {done ? (
                <p className="mt-3 text-[15px]">You're on the list. First look at every weekly drop.</p>
              ) : (
                <div className="mt-3 flex border-b border-softblack/25">
                  <input
                    id="nl"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent pb-2.5 text-[15px] placeholder:text-softblack/30 focus:outline-none"
                  />
                  <button className="label pb-2.5 text-[11px] hover:opacity-60" type="submit">
                    Subscribe
                  </button>
                </div>
              )}
            </form>

            <div className="mt-8">
              <p className="label text-warmgray">Follow us</p>
              <div className="mt-3.5 flex gap-3">
                <SocialIcon href="https://instagram.com/avelric" label="AVELRIC on Instagram">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://wa.me/919000000000" label="AVELRIC on WhatsApp">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z" />
                    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.5-1.5-2-1.5-1 .5c-1-.5-1.5-1-2-2l.5-1-1.5-2L9 9.5Z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://facebook.com/avelric" label="AVELRIC on Facebook">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 8h3V5h-3a4 4 0 0 0-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9a1 1 0 0 1 1-1Z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {FOOTER_COLS.map((c) => (
              <nav key={c.h} aria-label={c.h}>
                <p className="label text-warmgray">{c.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.to + l.t}>
                      <Link to={l.to} className="text-[14px] text-softblack/80 transition-colors hover:text-softblack">
                        {l.t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* trust strip */}
        <div className="mt-14 grid gap-4 rounded-2xl bg-beige px-6 py-5 text-[13px] text-softblack/80 sm:grid-cols-2 lg:grid-cols-4">
          <p className="flex items-center gap-2.5"><TruckIcon className="h-[18px] w-[18px] shrink-0 text-softblack/60" /> Free shipping above ₹2,499</p>
          <p className="flex items-center gap-2.5"><ReturnIcon className="h-[18px] w-[18px] shrink-0 text-softblack/60" /> 7-day easy returns</p>
          <p className="flex items-center gap-2.5"><CashIcon className="h-[18px] w-[18px] shrink-0 text-softblack/60" /> COD available across India</p>
          <p className="flex items-center gap-2.5"><ShieldCheckIcon className="h-[18px] w-[18px] shrink-0 text-softblack/60" /> Quality-checked twice before dispatch</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-softblack/10 pt-6 text-[13px] text-warmgray sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AVELRIC. Chandigarh, India.</p>
          <p className="label text-[10px]">UPI · Cards · Net Banking · COD</p>
        </div>
      </div>
    </footer>
  );
}
