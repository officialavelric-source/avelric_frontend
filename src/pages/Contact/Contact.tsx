import { SectionHeading } from "../../components/common";
import ContactForm from "../../components/forms/ContactForm";

export default function Contact() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Talk to a person, not a ticket"
            sub="Sizing doubts, order help, or feedback on a product — we answer everything ourselves, usually within a few hours."
          />
          <div className="mt-10 space-y-6">
            <a href="https://wa.me/919000000000" className="flex items-center justify-between rounded-2xl bg-softblack p-6 text-ivory transition-transform hover:scale-[1.01]">
              <span>
                <span className="label block text-[10.5px] text-ivory/60">Fastest — WhatsApp</span>
                <span className="mt-1 block font-display text-[20px]">+91 90000 00000</span>
              </span>
              <span aria-hidden="true" className="text-2xl">→</span>
            </a>
            <div className="rounded-2xl bg-beige p-6">
              <p className="label text-[10.5px] text-warmgray">Email</p>
              <p className="mt-1 font-display text-[20px]">care@avelric.in</p>
            </div>
            <div className="rounded-2xl bg-beige p-6">
              <p className="label text-[10.5px] text-warmgray">Hours</p>
              <p className="mt-1 text-[15px]">Monday–Saturday, 10am–7pm IST · Chandigarh, India</p>
            </div>
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
