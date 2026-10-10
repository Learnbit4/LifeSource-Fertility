import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import { Header, Footer } from "@/components/SiteChrome";
import { SITE } from "@/lib/site";
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0B2545" };
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | Sperm bank, IUI and IVF clinic in Nairobi, Kenya`, template: `%s | ${SITE.name}` },
  description: SITE.description, openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, locale: "en_KE", type: "website" },
  alternates: { canonical: "/" },
};
const jsonLd = { "@context": "https://schema.org", "@type": "MedicalClinic", name: SITE.name, url: SITE.url, description: SITE.description,
  telephone: SITE.phone, email: SITE.email, address: { "@type": "PostalAddress", streetAddress: SITE.street, addressLocality: SITE.city, addressCountry: SITE.country } };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="font-sans">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-3">Skip to content</a>
    <Providers><Header /><div id="main">{children}</div><Footer /></Providers></body></html>);
}
