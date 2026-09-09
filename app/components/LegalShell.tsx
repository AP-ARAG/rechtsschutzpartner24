import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "./SiteChrome";

export function LegalShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader active="legal" compact />
      <main id="main" className="legal-page">
        <div className="legal-title">
          <Link className="back-home-link" href="/">← Zur Hauptseite</Link>
          <p className="eyebrow">Rechtliche Informationen</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <article className="legal-card">{children}</article>
      </main>
      <SiteFooter />
    </>
  );
}
