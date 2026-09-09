import Image from "next/image";
import Link from "next/link";
import { operator, productLinks } from "../site-data";

type HeaderProps = {
  active?: "hub" | "legal" | "pet" | "pkv";
  compact?: boolean;
};

const pageBrand = {
  hub: {
    name: "Versicherungsnavigator24",
    subtitle: "ARAG Hauptgeschäftsstelle Augsburg · Vier starke Lösungen",
    href: "/",
  },
  legal: {
    name: "Versicherungsnavigator24",
    subtitle: "ARAG Hauptgeschäftsstelle Augsburg · Vier starke Lösungen",
    href: "/",
  },
  pet: {
    name: "Tierkrankenschutz24",
    subtitle: "ARAG Tierkranken- und OP-Schutz persönlich eingeordnet",
    href: "/tierkrankenversicherung/",
  },
  pkv: {
    name: "PrivatKrankenversicherung24",
    subtitle: "ARAG private Krankenversicherung persönlich eingeordnet",
    href: "/private-krankenversicherung/",
  },
} as const;

export function SiteHeader({ active = "hub", compact = false }: HeaderProps) {
  const brand = pageBrand[active];

  return (
    <>
      <a className="skip-link" href="#main">Zum Inhalt springen</a>
      <aside className="network-bar" aria-label="Versicherungsnavigator24">
        <Link className="network-home" href="/" aria-label="Zur Hauptseite Versicherungsnavigator24">
          <span aria-hidden="true">V24</span><strong>Zur Hauptseite</strong>
        </Link>
        <nav className="desktop-nav" aria-label="Zwischen Versicherungswelten wechseln">
          {productLinks.map((product) => (
            <Link className={(active === "pet" && product.label === "Tier") || (active === "pkv" && product.label === "Private KV") ? "is-current" : ""} href={product.href} key={product.title}>{product.label}</Link>
          ))}
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Navigation öffnen">Menü</summary>
          <nav aria-label="Mobile Versicherungsbereiche">
            <Link href="/">Zur Hauptseite</Link>
            {productLinks.map((product) => <Link href={product.href} key={product.title}>{product.title}</Link>)}
          </nav>
        </details>
      </aside>
      <header className={`site-header ${compact ? "site-header-compact" : ""}`}>
        <div className="header-inner">
          <Link className="brand-link" href={brand.href} aria-label={`${brand.name} Startseite`}>
            <span className="brand-mark" aria-hidden="true">ARAG</span>
            <span className="brand-copy"><strong>{brand.name}</strong><small>{brand.subtitle}</small></span>
          </Link>
          <a className="outline-button" href={`tel:${operator.phoneHref}`}>Jetzt Rückruf anfordern</a>
        </div>
      </header>
    </>
  );
}

export function AdvisorSection() {
  return (
    <section className="advisor-section" aria-labelledby="advisor-title">
      <div className="advisor-card">
        <Image src="/agapios-papadakis.jpg" alt="Agapios Papadakis, persönlicher Ansprechpartner der ARAG Hauptgeschäftsstelle Augsburg" width={720} height={720} />
        <div>
          <p className="eyebrow">Persönlich statt anonym</p>
          <h2 id="advisor-title">Ein Ansprechpartner für alle vier Bereiche.</h2>
          <p>{operator.name} und sein Team begleiten Sie von der ersten Frage bis zu einer passenden ARAG Lösung. Verständlich, unverbindlich und auf Wunsch telefonisch oder per E-Mail.</p>
          <ul className="check-list">
            <li>Fester Ansprechpartner</li>
            <li>Beratung für ganz Deutschland</li>
            <li>Klare Einordnung Ihrer Möglichkeiten</li>
          </ul>
          <div className="hero-actions">
            <a className="button button-primary" href={`tel:${operator.phoneHref}`}>Jetzt anrufen</a>
            <a className="button button-secondary" href={`mailto:${operator.email}`}>E-Mail schreiben</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter({ active = "hub" }: { active?: HeaderProps["active"] }) {
  const brand = pageBrand[active];
  const mark = active === "pet" ? "T24" : active === "pkv" ? "P24" : "V24";

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link className="footer-brand" href={brand.href}><span className="brand-mark" aria-hidden="true">{mark}</span><span><strong>{brand.name}</strong><small>Persönliche ARAG Beratung</small></span></Link>
          <p>Vier spezialisierte Wege zu Ihrem Versicherungsschutz – mit einem persönlichen Ansprechpartner.</p>
        </div>
        <div>
          <p className="footer-label">Versicherungswelten</p>
          <nav>{productLinks.map((product) => <Link href={product.href} key={product.title}>{product.title}</Link>)}</nav>
        </div>
        <div>
          <p className="footer-label">Kontakt & Rechtliches</p>
          <nav>
            <a href={`tel:${operator.phoneHref}`}>{operator.phoneDisplay}</a>
            <a href={`mailto:${operator.email}`}>{operator.email}</a>
            <Link href="/impressum/">Impressum</Link>
            <Link href="/erstinformation/">Erstinformation</Link>
            <Link href="/datenschutz/">Datenschutz</Link>
          </nav>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 {operator.name}</span><span>Information und persönliche Versicherungsberatung</span></div>
    </footer>
  );
}
