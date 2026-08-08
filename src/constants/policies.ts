export interface PolicySection {
  h: string;
  body: string[];
}

export interface Policy {
  title: string;
  intro: string;
  sections: PolicySection[];
}

export const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping & delivery policy",
    intro: "Every order ships from our Chandigarh facility within 24 hours of confirmation (working days), with tracking shared over email and WhatsApp.",
    sections: [
      { h: "Delivery timelines", body: [
        "Chandigarh, Mohali & Panchkula: 1–2 working days.",
        "Rest of Punjab, Delhi NCR, Haryana & Himachal: 2–4 working days.",
        "Rest of India: 4–7 working days. Remote pin codes may take up to 9 working days.",
      ]},
      { h: "Shipping charges", body: [
        "Free shipping on all prepaid orders of ₹2,499 and above.",
        "Orders below ₹2,499: flat ₹79 shipping.",
        "Cash on Delivery: available on orders up to ₹5,000 with a ₹49 handling fee, in addition to any shipping charge.",
      ]},
      { h: "Order tracking", body: [
        "A tracking link is sent as soon as the courier scans your package. If tracking hasn't updated for 48 hours, contact us and we'll chase the courier for you.",
      ]},
      { h: "Delays", body: [
        "Weather, festivals, and courier disruptions occasionally add 1–2 days. If your order is delayed beyond the promised window, write to care@avelric.in — we'll prioritise it and keep you posted.",
      ]},
    ],
  },
  returns: {
    title: "Returns & exchange policy",
    intro: "If a piece isn't right, you have 7 days from delivery to exchange or return it. No forms, no interrogation.",
    sections: [
      { h: "What's eligible", body: [
        "Items must be unworn (beyond trying for fit), unwashed, and have all tags attached.",
        "Items with stains, perfume, or signs of use can't be accepted — they fail the same quality check we apply before shipping.",
      ]},
      { h: "Size exchanges", body: [
        "Free, once per order. Request via WhatsApp or the contact page with your order number; we arrange doorstep pickup and dispatch the new size once pickup is confirmed.",
      ]},
      { h: "Returns & refunds", body: [
        "Request a return within 7 days of delivery. Pickup is arranged from your address; a reverse-shipment fee of ₹99 applies to returns (not to size exchanges or our errors).",
        "If we shipped a wrong or defective item, return shipping is on us and you choose a full refund or a replacement.",
      ]},
      { h: "How refunds are paid", body: [
        "Prepaid orders: refunded to the original payment method within 5–7 working days of pickup.",
        "COD orders: refunded via UPI or bank transfer within 5–7 working days of pickup.",
      ]},
    ],
  },
  refund: {
    title: "Refund policy",
    intro: "Refunds are processed once the returned item passes inspection at our facility — typically the same day it arrives back.",
    sections: [
      { h: "Timelines", body: [
        "Prepaid payments (UPI, cards, netbanking, wallets): 5–7 working days back to the source account after pickup.",
        "Cash on Delivery orders: 5–7 working days via UPI or bank transfer after we receive your payout details.",
      ]},
      { h: "What's refunded", body: [
        "The full product price. Original shipping and COD handling fees are non-refundable, except where the return is due to our error (wrong item, damaged item, or a quality failure).",
      ]},
      { h: "Failed or cancelled payments", body: [
        "If money was deducted but no order was created, the payment gateway auto-reverses it, usually within 5 working days. If it doesn't, contact us with the transaction ID and we'll escalate with the gateway.",
      ]},
      { h: "Disputes", body: [
        "If a refund hasn't reached you within the stated window, email care@avelric.in with your order number. We respond within one working day.",
      ]},
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "We collect the minimum we need to sell you clothes and deliver them. Here's exactly what that means.",
    sections: [
      { h: "What we collect", body: [
        "Order details: name, phone number, email, and delivery address — needed to fulfil and support your order.",
        "Payment is processed by our payment gateway; AVELRIC never sees or stores your card numbers or UPI credentials.",
        "Browsing data: we use Google Analytics and Meta Pixel to understand how the site is used and to measure our ads. These tools use cookies and collect device and usage information.",
      ]},
      { h: "How it's used", body: [
        "To process orders, arrange delivery and returns, answer support queries, and — if you opt in — send you the weekly drop newsletter. You can unsubscribe with one click at any time.",
      ]},
      { h: "What we never do", body: [
        "We do not sell your personal data to anyone. Data is shared only with the services required to run the store: our courier partners, payment gateway, and analytics providers listed above.",
      ]},
      { h: "Your choices", body: [
        "You can request a copy or deletion of your personal data by emailing care@avelric.in from your registered email. You can also block cookies in your browser; the store will still work.",
      ]},
    ],
  },
  terms: {
    title: "Terms & conditions",
    intro: "The short, honest version of the rules that apply when you use avelric.in.",
    sections: [
      { h: "About AVELRIC", body: [
        "AVELRIC is a curated retail store. We source products from third-party manufacturers and suppliers, quality-check them, and sell them under our own service standards. Product listings describe the items to the best of our verified knowledge.",
      ]},
      { h: "Orders & pricing", body: [
        "All prices are in Indian Rupees and inclusive of GST. An order is confirmed only when you receive the confirmation email/message. We reserve the right to cancel orders affected by pricing errors or stock issues, with a full and immediate refund.",
      ]},
      { h: "Accurate information", body: [
        "You're responsible for providing a correct delivery address and reachable phone number. Repeated failed COD deliveries may lead to COD being disabled for the address.",
      ]},
      { h: "Content", body: [
        "All photography, copy, and branding on this site belong to AVELRIC and can't be reused commercially without written permission.",
      ]},
      { h: "Governing law", body: [
        "These terms are governed by the laws of India, with courts in Chandigarh holding jurisdiction.",
      ]},
    ],
  },
};
