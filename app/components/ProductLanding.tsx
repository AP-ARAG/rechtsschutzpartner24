import Image from "next/image";
import { ConsultationCheck } from "./ConsultationCheck";
import { AdvisorSection, SiteFooter, SiteHeader } from "./SiteChrome";
import { StructuredData } from "./StructuredData";
import { operator, siteUrl } from "../site-data";

export type ProductConfig = {
  kind: "pet" | "pkv";
  active: "pet" | "pkv";
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  benefits: { title: string; text: string }[];
  audiencesTitle: string;
  audiences: { title: string; text: string }[];
  levels: { kicker: string; title: string; text: string; items: string[] }[];
  detailTitle: string;
  detailLead: string;
  detailColumns: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  sourceUrl: string;
};

export function ProductLanding({ config }: { config: ProductConfig }) {
  const faqData = config.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  }));

  return (
    <>
      <StructuredData data={[
        {
          "@context": "https://schema.org",
          "@type": "InsuranceAgency",
          name: operator.office,
          url: siteUrl,
          telephone: operator.phoneHref,
          email: operator.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: operator.street,
            postalCode: operator.city.split(" ")[0],
            addressLocality: operator.city.substring(operator.city.indexOf(" ") + 1),
            addressCountry: "DE",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: config.title,
          serviceType: config.kind === "pet" ? "Tierkrankenversicherung" : "Private Krankenversicherung",
          provider: { "@type": "InsuranceAgency", name: operator.office },
          areaServed: { "@type": "Country", name: "Deutschland" },
          url: siteUrl,
        },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqData },
      ]} />
      <SiteHeader active={config.active} compact />
      <main id="main">
        <section className={`product-hero product-hero-${config.kind}`} aria-labelledby="product-title">
          <div className="product-hero-copy">
            <p className="eyebrow">{config.eyebrow}</p>
            <h1 id="product-title">{config.title}</h1>
            <p className="hero-lead">{config.lead}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#bedarfscheck">Bedarf kurz einordnen</a>
              <a className="button button-secondary" href={`tel:${operator.phoneHref}`}>Persönlich beraten lassen</a>
            </div>
            <ul className="trust-list">
              <li>Unverbindliche Orientierung</li>
              <li>Persönlicher Ansprechpartner</li>
              <li>ARAG Versicherungslösungen</li>
            </ul>
          </div>
          <div className="product-hero-media">
            <Image src={config.image} alt={config.imageAlt} width={1200} height={800} priority />
            <div className="image-note"><strong>Persönlich begleitet</strong><span>Von der ersten Frage bis zum passenden Angebot</span></div>
          </div>
        </section>

        <section className="benefit-section" aria-labelledby="benefits-title">
          <div className="section-heading">
            <p className="eyebrow">Das Wichtigste zuerst</p>
            <h2 id="benefits-title">Klare Leistungen. Verständlich eingeordnet.</h2>
          </div>
          <div className="benefit-grid">
            {config.benefits.map((benefit) => (
              <article key={benefit.title}><span aria-hidden="true">✓</span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>
            ))}
          </div>
        </section>

        <section className="audience-section" aria-labelledby="audience-title">
          <div className="section-heading">
            <p className="eyebrow">Passend zu Ihrer Situation</p>
            <h2 id="audience-title">{config.audiencesTitle}</h2>
          </div>
          <div className="audience-grid">
            {config.audiences.map((audience, index) => (
              <article key={audience.title}><span>0{index + 1}</span><h3>{audience.title}</h3><p>{audience.text}</p></article>
            ))}
          </div>
        </section>

        <section className="level-section" aria-labelledby="levels-title">
          <div className="section-heading">
            <p className="eyebrow">Leistungsrichtungen</p>
            <h2 id="levels-title">Welche Absicherung passt zu Ihrem Anspruch?</h2>
            <p>Die konkrete Versicherbarkeit und der endgültige Leistungsumfang ergeben sich aus dem individuellen Angebot und den Versicherungsbedingungen.</p>
          </div>
          <div className="level-grid">
            {config.levels.map((level, index) => (
              <article className={index === 1 ? "is-featured" : ""} key={level.title}>
                <p className="level-kicker">{level.kicker}</p>
                <h3>{level.title}</h3>
                <p>{level.text}</p>
                <ul>{level.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <a href="#bedarfscheck">Dazu beraten lassen</a>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-section" aria-labelledby="detail-title">
          <div className="detail-intro">
            <p className="eyebrow">Gut zu wissen</p>
            <h2 id="detail-title">{config.detailTitle}</h2>
            <p>{config.detailLead}</p>
          </div>
          <div className="detail-grid">
            {config.detailColumns.map((column) => <article key={column.title}><h3>{column.title}</h3><p>{column.text}</p></article>)}
          </div>
          <p className="source-note">Produktinformationen wurden anhand der öffentlich verfügbaren ARAG Angaben zusammengefasst. Maßgeblich sind Angebot, Antrag, Tarif und Versicherungsbedingungen. <a href={config.sourceUrl} target="_blank" rel="noreferrer">Zu den offiziellen ARAG Produktinformationen</a>.</p>
        </section>

        <section className="check-section" id="bedarfscheck" aria-labelledby="check-title">
          <div className="check-copy">
            <p className="eyebrow">60-Sekunden-Bedarfscheck</p>
            <h2 id="check-title">Drei Fragen für einen besseren Gesprächsstart.</h2>
            <p>Ohne Registrierung und ohne Speicherung. Ihre Auswahl bleibt im Browser, bis Sie selbst eine E-Mail öffnen oder anrufen.</p>
          </div>
          <ConsultationCheck kind={config.kind} />
        </section>

        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-heading">
            <p className="eyebrow">Häufige Fragen</p>
            <h2 id="faq-title">Kurz und verständlich beantwortet.</h2>
          </div>
          <div className="faq-list">
            {config.faqs.map((faq) => (
              <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>
            ))}
          </div>
        </section>

        <AdvisorSection />
      </main>
      <SiteFooter active={config.active} />
    </>
  );
}
