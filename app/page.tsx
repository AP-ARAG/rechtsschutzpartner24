import { AdvisorSection, SiteFooter, SiteHeader } from "./components/SiteChrome";
import { StructuredData } from "./components/StructuredData";
import { operator, siteUrl } from "./site-data";

const products = [
  {
    eyebrow: "Rechtsschutz",
    title: "RechtsschutzPartner24",
    description: "Persönlicher ARAG Rechtsschutz für Privat, Beruf, Verkehr und Gewerbe.",
    href: "https://rechtsschutzpartner24.de",
    action: "Rechtsschutz entdecken",
  },
  {
    eyebrow: "Immobilien",
    title: "Vermieterrechtsschutz24",
    description: "Rechtsschutz für Vermieter, Immobilienbesitzer und Bauherren.",
    href: "https://vermieterrechtsschutz24.com",
    action: "Vermieter-Schutz entdecken",
  },
  {
    eyebrow: "Tiergesundheit",
    title: "Tierkrankenschutz24",
    description: "Kranken- und OP-Schutz für Hunde und Katzen – verständlich erklärt.",
    href: "/tierkrankenversicherung/",
    action: "Tier-Schutz entdecken",
  },
  {
    eyebrow: "Gesundheit",
    title: "PrivatKrankenversicherung24",
    description: "Private Krankenversicherung passend zu Beruf, Familie und Anspruch.",
    href: "/private-krankenversicherung/",
    action: "Privat-Schutz entdecken",
  },
];

const faqs = [
  ["Ist Versicherungsnavigator24 ein Versicherungsvergleich?", "Nein. Die Plattform bündelt spezialisierte Informations- und Beratungsseiten eines gebundenen Versicherungsvertreters der ARAG. Es findet kein unabhängiger Marktvergleich statt."],
  ["Kann ich zwischen den Versicherungsseiten wechseln?", "Ja. Jede Seite enthält denselben Produktwechsler und einen direkten Link zurück zur zentralen Übersicht. So erreichen Sie alle vier Themen ohne Umwege."],
  ["Ist die Beratung kostenlos?", "Für die dargestellte Versicherungsvermittlung wird keine unmittelbar vom Kunden zu zahlende Vergütung erhoben. Die Vergütung besteht aus einer in der Versicherungsprämie enthaltenen Provision."],
  ["Kann ich mich erst unverbindlich informieren?", "Ja. Alle Seiten erklären die wichtigsten Auswahlkriterien. Die Bedarfschecks speichern oder übertragen keine Angaben; erst Sie entscheiden, ob Sie anschließend anrufen oder eine E-Mail senden."],
] as const;

export default function Home() {
  return (
    <>
      <StructuredData data={[
        {
          "@context": "https://schema.org",
          "@type": "InsuranceAgency",
          name: operator.office,
          alternateName: "Versicherungsnavigator24",
          url: siteUrl,
          telephone: operator.phoneHref,
          email: operator.email,
          areaServed: "DE",
          address: {
            "@type": "PostalAddress",
            streetAddress: operator.street,
            postalCode: "86356",
            addressLocality: "Neusäß",
            addressCountry: "DE",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
        },
      ]} />
      <SiteHeader active="hub" />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Versicherungen. Einfach. Klar.</p>
            <h1 id="hero-title">Der passende Schutz für das, was Ihnen wichtig ist.</h1>
            <p className="hero-lead">Vier spezialisierte Versicherungswelten, eine vertraute Beratung: Finden Sie schnell zur Lösung, die zu Ihrem Leben passt.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#schutzwelten">Versicherung auswählen</a>
              <a className="button button-secondary" href={`tel:${operator.phoneHref}`}>Persönlich sprechen</a>
            </div>
            <ul className="trust-list" aria-label="Ihre Vorteile">
              <li>Persönliche Beratung</li>
              <li>ARAG Produktlösungen</li>
              <li>Klar und unverbindlich</li>
            </ul>
          </div>
          <div className="hero-visual" aria-label="Vier Versicherungsbereiche">
            <span className="visual-label">Ihr direkter Weg</span>
            <div className="visual-grid"><span>Recht</span><span>Wohnen</span><span>Tier</span><span>Gesundheit</span></div>
            <p>Von der ersten Frage bis zum passenden Angebot persönlich begleitet.</p>
          </div>
        </section>

        <section className="product-section" id="schutzwelten" aria-labelledby="products-title">
          <div className="section-heading">
            <p className="eyebrow">Unsere Schutzwelten</p>
            <h2 id="products-title">Womit dürfen wir Ihnen helfen?</h2>
            <p>Jede Seite ist auf ein Thema spezialisiert. Über den gemeinsamen Produktwechsler kommen Sie jederzeit hierher zurück oder direkt zur nächsten Lösung.</p>
          </div>
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.title}>
                <div className="card-number">0{index + 1}</div>
                <p className="card-eyebrow">{product.eyebrow}</p>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <a href={product.href}>{product.action}<span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="why-section" aria-labelledby="why-title">
          <div className="why-copy">
            <p className="eyebrow">Eine klare Website-Familie</p>
            <h2 id="why-title">Spezialisiert im Thema. Vertraut in der Bedienung.</h2>
            <p>Rechtsschutz, Immobilie, Tiergesundheit und private Krankenversicherung brauchen jeweils eigene Antworten. Trotzdem soll sich der Wechsel zwischen den Themen vertraut anfühlen. Deshalb teilen alle Seiten dieselben visuellen Grundregeln, Kontaktwege und die zentrale Navigation.</p>
          </div>
          <div className="why-grid">
            <article><span>01</span><h3>Schnell orientiert</h3><p>Klare Einstiege und verständliche Auswahlhilfen statt Fachbegriffe ohne Erklärung.</p></article>
            <article><span>02</span><h3>Mobil gedacht</h3><p>Lesbar, bedienbar und schnell auf Smartphone, Tablet und Desktop.</p></article>
            <article><span>03</span><h3>Vertrauen sichtbar</h3><p>Ein echter Ansprechpartner, transparente Vermittlerangaben und keine erfundenen Versprechen.</p></article>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="section-heading">
            <p className="eyebrow">So einfach geht es</p>
            <h2 id="process-title">In drei Schritten zur persönlichen Einordnung.</h2>
          </div>
          <ol>
            <li><span>1</span><div><h3>Thema auswählen</h3><p>Wechseln Sie direkt zur passenden spezialisierten Seite.</p></div></li>
            <li><span>2</span><div><h3>Bedarf einordnen</h3><p>Lesen Sie die wichtigsten Punkte oder nutzen Sie den kurzen Bedarfscheck.</p></div></li>
            <li><span>3</span><div><h3>Persönlich besprechen</h3><p>Telefonisch oder per E-Mail klären wir die nächsten sinnvollen Schritte.</p></div></li>
          </ol>
        </section>

        <AdvisorSection />

        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-heading"><p className="eyebrow">Häufige Fragen</p><h2 id="faq-title">Das sollten Sie über die Plattform wissen.</h2></div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
