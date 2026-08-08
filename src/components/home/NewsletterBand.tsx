import { FormEvent, useState } from "react";
import { Reveal } from "../common";

export default function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setTimeout(() => setStatus("done"), 700);
  };

  return (
    <section className="bg-softblack py-20 text-ivory md:py-28">
      <div className="mx-auto max-w-xl px-6 text-center">
        <Reveal>
          <p className="label text-ivory/60">Join the list</p>
          <h2 className="mt-4 font-display text-[32px] leading-[1.1] tracking-[-0.02em] md:text-[44px]">
            First look at every weekly drop.
          </h2>
          <p className="mt-4 text-[14.5px] text-ivory/60">No spam — one email when new pieces pass the check.</p>

          {status === "done" ? (
            <p className="mt-8 text-[15px]">You're on the list. Welcome to AVELRIC.</p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-9 max-w-sm" noValidate>
              <div className={`flex border-b transition-colors ${status === "error" ? "border-danger" : "border-ivory/30 focus-within:border-ivory"}`}>
                <label htmlFor="home-nl" className="sr-only">Email address</label>
                <input
                  id="home-nl"
                  type="email"
                  value={email}
                  disabled={status === "submitting"}
                  onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                  placeholder="you@example.com"
                  className="w-full bg-transparent pb-3 text-[15px] text-ivory placeholder:text-ivory/35 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  aria-label="Subscribe"
                  className="label shrink-0 pb-3 text-[11px] text-ivory transition-opacity hover:opacity-60 disabled:opacity-40"
                >
                  {status === "submitting" ? "···" : "Subscribe →"}
                </button>
              </div>
              {status === "error" && (
                <p className="mt-3 text-left text-[12.5px] text-danger/90">Enter a valid email address.</p>
              )}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
