import Image from "next/image";
import Link from "next/link";
import { operator, productLinks } from "../site-data";

type HeaderProps = {
  active?: "hub" | "legal" | "pet" | "pkv";
  compact?: boolean;
};

export function SiteHeader({ active = "hub", compact = false }: HeaderProps) {
  return (
    <>
      <a className="skip-link" href="#main">Zum Inhalt springen</a>
      <div className="topline">
        <p>{operator.office} · Persönlich für Sie da</p>
        <div><a href={`tel:${operator.phoneHref}`}>{operator.phoneDisplay}</a><span aria-hidden="true"> · </span><a href={`mailto:${operator.email}`}>E-Mail</a></div>
      </div>
      <header className={`site-header ${compact ? "site-header-compact" : ""}`}>
        <Link className="brand" href="/" aria-label="Versicherungsnavigator24 Startseite">
          <span className="brand-mark" aria-hidden="true">V24</span>
          <span><strong>Versicherungsnavigator24</strong><small>Ein Ansprechpartner. Vier starke Lösungen.</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Versicherungsbereiche">
          <Link className={active === "hub" ? "is-active" : ""} href="/">Übersicht</Link>
          {productLinks.map((product) => (
            <Link className={(active === "pet" && product.label === "Tier") || (active === "pkv" && product.label === "Private KV") ? "is-active" : ""} href={product.href} key={product.title}>{product.label}</Link>
          ))}
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Navigation öffnen">Menü</summary>
          <nav aria-label="Mobile Versicherungsbereiche">
            <Link href="/">Übersicht</Link>
            {productLinks.map((product) => <Link href={product.href} key={product.title}>{product.title}</Link>)}
          </nav>
        </details>
      </header>
    </>
  );
}

export function ProductSwitcher({ active }: { active?: "pet" | "pkv" }) {
  return (
    <section className="switcher" aria-labelledby="switcher-title">
      <div className="switcher-intro">
        <p className="eyebrow">Ein System · vier Themen</p>
        <h2 id="switcher-title">Direkt zur passenden Versicherungswelt</h2>
      </div>
      <div className="switcher-links">
        {productLinks.map((product) => (
          <Link className={(active === "pet" && product.label === "Tier") || (active === "pkv" && product.label === "Private KV") ? "is-current" : ""} href={product.href} key={product.title}>
            <span>{product.label}</span><strong>{product.title}</strong>
          </Link>
        ))}
      </div>
      <Link className="back-home-link" href="/">← Zur Hauptseite</Link>
    </section>
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

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link className="footer-brand" href="/"><span className="brand-mark" aria-hidden="true">V24</span><span><strong>Versicherungsnavigator24</strong><small>Persönliche ARAG Beratung</small></span></Link>
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
