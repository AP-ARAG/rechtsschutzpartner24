import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "./site-data";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Versicherungsnavigator24 | Recht, Wohnen, Tier & Gesundheit",
    template: "%s",
  },
  description: "Vier spezialisierte Versicherungsseiten, eine persönliche ARAG Beratung: Rechtsschutz, Vermieterrechtsschutz, Tierkrankenschutz und private Krankenversicherung.",
  alternates: { canonical: "/" },
  keywords: ["ARAG Beratung", "Rechtsschutz", "Vermieterrechtsschutz", "Tierkrankenversicherung", "private Krankenversicherung"],
  authors: [{ name: "Agapios Papadakis" }],
  creator: "ARAG Hauptgeschäftsstelle Augsburg",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "/",
    siteName: "Versicherungsnavigator24",
    title: "Versicherungsnavigator24 | Recht, Wohnen, Tier & Gesundheit",
    description: "Vier spezialisierte Versicherungswelten und ein persönlicher Ansprechpartner.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Versicherungsnavigator24 – Recht, Wohnen, Tier und Gesundheit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Versicherungsnavigator24",
    description: "Recht. Wohnen. Tier. Gesundheit.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
