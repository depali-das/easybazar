import { HelpCircle } from 'lucide-react'
import { CONTACT_INFO } from '../config/contact.js'
import { DELIVERY_FEE } from '../utils/pricing.js'

const questions = [
  {
    question: 'How can I place an order?',
    answer: 'Browse products, add the items you want to your cart, choose a serviceable delivery area, and complete checkout.',
  },
  {
    question: 'Which areas do you deliver to?',
    answer: `Delivery is available only in the configured service areas of ${CONTACT_INFO.address}. Use the delivery checker before placing an order.`,
  },
  {
    question: 'What are the delivery charges?',
    answer: `Delivery costs ৳${DELIVERY_FEE} for orders below ৳${CONTACT_INFO.freeDeliveryMinimum}. Delivery is free when the eligible product subtotal is ৳${CONTACT_INFO.freeDeliveryMinimum} or more.`,
  },
  {
    question: 'What are your delivery hours?',
    answer: `Orders and support are available daily from ${CONTACT_INFO.supportHours.display}.`,
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Cancellation is available only while an order is eligible and has not gone out for delivery or been delivered. Contact support with your order ID as soon as possible.',
  },
  {
    question: 'How can I report a damaged product?',
    answer: 'Submit a support request with your order ID, the product details, and what happened. You can also contact support through WhatsApp.',
  },
  {
    question: 'Which payment methods are available?',
    answer: 'Checkout offers Cash on Delivery and demo bKash/Nagad options. bKash and Nagad are demo-only; no real wallet payment is collected.',
  },
  {
    question: 'How can I contact customer support?',
    answer: `Call ${CONTACT_INFO.phone}, email ${CONTACT_INFO.email}, chat on WhatsApp, or submit the support form on this page.`,
  },
]

export default function FAQSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-xl bg-green-50 p-2.5 text-green-800">
          <HelpCircle size={23} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-green-800">Quick answers</p>
          <h2 id="faq-title" className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>
      </div>
      <div className="space-y-3">
        {questions.map(({ question, answer }) => (
          <details key={question} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer font-semibold text-slate-900 marker:text-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300">
              {question}
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-700">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
