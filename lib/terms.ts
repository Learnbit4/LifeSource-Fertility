// DRAFT TEMPLATE, NOT LEGAL ADVICE. Must be reviewed by a Kenyan lawyer before launch.
// Bracketed items are decisions the business must make. Bump TERMS_VERSION on every change.
export const TERMS_VERSION = "2026-10-draft-2";
export type Kind = "donor" | "buyer";
export const TERMS: Record<Kind, { title: string; clauses: [string, string][] }> = {
  donor: { title: "Donor Terms and Conditions", clauses: [
    ["1. Eligibility", "You confirm you are at least [18/21] years old and legally able to enter this agreement."],
    ["2. Accurate information", "You will give truthful, complete health, family-history and identity information. False or withheld information may lead to removal and, where applicable, legal action."],
    ["3. Registration fee", "A one-time registration fee of the amount shown on the site covers identity verification and eligibility checks. [Refund policy: to be defined.]"],
    ["4. Screening and testing", "You consent to medical, genetic and infectious-disease screening and to repeat testing as required. Results may disqualify you."],
    ["5. Use of samples", "You understand samples may be used by recipients and clinics for fertility treatment. [Limit on number of families/births: to be defined.]"],
    ["6. Anonymity and identity release", "[Define whether donations are anonymous, open-identity, or both, and what is disclosed to offspring and when.]"],
    ["7. Parental rights", "You understand that [legal position on parentage to be confirmed by counsel]."],
    ["8. Compensation", "[Define whether and how donors are compensated, and conditions of payment.]"],
    ["9. Your data", "We process your personal and health data under Kenya's Data Protection Act, 2019, as set out in our privacy notice. [Privacy notice to be published.]"],
    ["10. Withdrawal", "You may withdraw from the programme in writing. [Effect on stored samples: to be defined.]"],
  ] },
  buyer: { title: "Recipient and Clinic Terms and Conditions", clauses: [
    ["1. Eligibility", "You confirm you are at least 18 years old and legally able to enter this agreement."],
    ["2. Accurate information", "Details you provide for yourself or your clinic are truthful and complete."],
    ["3. Donor information", "Donor profiles are based on information supplied by donors and our screening. We do not guarantee conception, health outcomes or traits of any child."],
    ["4. Pricing and payment", "Prices depend on donor tier, vial type, processing and any clinic fees shown at checkout. [Currency, payment methods and taxes: to be defined.]"],
    ["5. Reservations and refunds", "[Define reservation holding time, cancellation, returns and refunds. Frozen biological samples usually cannot be restocked once shipped.]"],
    ["6. Storage and handling", "You are responsible for correct storage, thawing and use after delivery, and for using a qualified practitioner where required."],
    ["7. Permitted use", "Samples are for your own treatment only and must not be resold or transferred."],
    ["8. Clinical procedures (IUI and IVF)", "Procedures are performed by [licensed practitioners at a licensed facility: licence numbers to be inserted]. Before any procedure you will be asked for separate, procedure-specific informed consent covering risks, success rates and alternatives. You confirm you have disclosed your relevant medical history. Clinic fees are shown at checkout."],
    ["9. Your data", "We process your personal and health data under Kenya's Data Protection Act, 2019, as set out in our privacy notice. [Privacy notice to be published.]"],
    ["10. Liability and governing law", "[Limitation of liability and governing law (Kenya): to be set by counsel.]"],
  ] },
};
