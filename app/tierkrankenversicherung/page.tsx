import type { Metadata } from "next";
import { ProductLanding, type ProductConfig } from "../components/ProductLanding";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tierkrankenversicherung für Hund & Katze | Tierkrankenschutz24",
  description: "ARAG Tierkrankenversicherung und OP-Schutz für Hunde und Katzen: Leistungen verständlich vergleichen und persönlich beraten lassen.",
  alternates: { canonical: "/tierkrankenversicherung/" },
  openGraph: {
    title: "Tierkrankenschutz24 | Kranken- und OP-Schutz für Hund & Katze",
    description: "Tierarztkosten verständlich absichern – mit persönlicher ARAG Beratung.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Versicherungsnavigator24 – Recht, Wohnen, Tier und Gesundheit" }],
  },
};

const config: ProductConfig = {
  kind: "pet",
  active: "pet",
  eyebrow: "Tierkrankenschutz24 · Hund & Katze",
  title: "Damit Tierarztkosten nicht über die beste Behandlung entscheiden.",
  lead: "Kranken- und OP-Schutz für Hunde und Katzen – mit persönlicher Einordnung, klaren Leistungsstufen und einem Ansprechpartner, der Ihre Fragen versteht.",
  image: "/tierkrankenschutz24-hero.webp",
  imageAlt: "Tierhalterin mit gesundem Hund und Katze in einem hellen Zuhause",
  benefits: [
    { title: "Freie Tierarzt- und Klinikwahl", text: "Sie entscheiden selbst, wo Ihr Tier behandelt wird – auch auf Reisen." },
    { title: "Bis zum 4-fachen GOT-Satz", text: "Je nach Tarif können auch hohe tierärztliche Gebührensätze inklusive Notfallgebühr abgesichert sein." },
    { title: "OP- oder Krankenvollschutz", text: "Wählen Sie zwischen dem gezielten Schutz vor Operationskosten und einer umfassenderen Absicherung." },
    { title: "Weltweiter Reiseschutz", text: "Die ARAG Produktinformationen sehen je nach Tarif weltweiten Schutz für bis zu zwölf Monate vor." },
  ],
  audiencesTitle: "Schutz, der zu Tier und Alltag passt.",
  audiences: [
    { title: "Für Hundebesitzer", text: "Von der unerwarteten Operation bis zu ambulanten und stationären Behandlungen – passend zu Rasse, Alter und Bedarf." },
    { title: "Für Katzenbesitzer", text: "Vorsorge, Diagnostik und Behandlungskosten können je nach gewählter Leistungsvariante einbezogen werden." },
    { title: "Für vorsichtige Planer", text: "Wer hohe Einmalrechnungen abfedern möchte, startet oft mit einem fokussierten OP-Schutz." },
    { title: "Für umfassenden Anspruch", text: "Komfort- und Premiumlösungen können zusätzliche Diagnostik-, Vorsorge- und Serviceleistungen einschließen." },
  ],
  levels: [
    {
      kicker: "Gezielt",
      title: "OP-Schutz",
      text: "Fokussiert auf medizinisch notwendige Operationen nach Krankheit oder Unfall.",
      items: ["Operations- und Klinikkosten", "Vor- und Nachbehandlung", "Medikamente und Verbandmittel"],
    },
    {
      kicker: "Umfassend",
      title: "Krankenvollschutz",
      text: "Erweitert den OP-Schutz um ambulante und stationäre Heilbehandlungen.",
      items: ["Behandlungen ohne Operation", "Diagnostik und Vorsorge je nach Tarif", "Freie Tierarztwahl"],
    },
    {
      kicker: "Individuell",
      title: "Zusatzbausteine",
      text: "Ergänzungen für besondere Wünsche und einen umfassenderen Tiergesundheitsschutz.",
      items: ["Zahn-Schutz optional", "Serviceleistungen je nach Tarif", "Individuelle Selbstbeteiligung"],
    },
  ],
  detailTitle: "Auf diese Punkte sollten Tierhalter achten.",
  detailLead: "Der Monatsbeitrag allein sagt wenig über die Qualität des Schutzes aus. Entscheidend sind Leistungsgrenzen, GOT-Satz, Wartezeiten, Selbstbeteiligung und Ausschlüsse.",
  detailColumns: [
    { title: "GOT-Satz", text: "Tierärztliche Leistungen werden nach der Gebührenordnung für Tierärzte abgerechnet. Gerade im Notdienst kann ein höherer Satz wichtig werden." },
    { title: "Wartezeiten", text: "Bei Krankheit kann eine Wartezeit gelten. Für Unfälle gelten häufig andere Regeln; Details stehen im konkreten Tarif." },
    { title: "Leistungshöchstgrenzen", text: "Manche Varianten begrenzen die Erstattung pro Versicherungsjahr, andere sehen bei bestimmten Leistungen unbegrenzte Erstattung vor." },
    { title: "Gesundheitszustand", text: "Alter, Rasse und bekannte Erkrankungen können Versicherbarkeit und Beitrag beeinflussen. Eine ehrliche Vorprüfung schützt vor späteren Missverständnissen." },
  ],
  faqs: [
    { question: "Was ist der Unterschied zwischen OP- und Krankenvollschutz?", answer: "Ein OP-Schutz konzentriert sich auf medizinisch notwendige Operationen und verbundene Vor- und Nachbehandlungen. Ein Krankenvollschutz kann zusätzlich ambulante und stationäre Behandlungen ohne Operation einschließen. Maßgeblich ist der gewählte Tarif." },
    { question: "Was bedeutet 4-facher GOT-Satz?", answer: "Die Gebührenordnung für Tierärzte erlaubt je nach Aufwand und Situation unterschiedliche Abrechnungssätze. Ein Schutz bis zum 4-fachen GOT-Satz kann besonders im Notdienst relevant sein." },
    { question: "Kann ich meinen Tierarzt frei wählen?", answer: "Nach den aktuellen ARAG Produktinformationen besteht freie Tierarzt- und Klinikwahl. Die Details und mögliche tarifliche Voraussetzungen ergeben sich aus den Versicherungsbedingungen." },
    { question: "Gilt der Schutz sofort?", answer: "Für Krankheiten kann eine Wartezeit gelten; nach Unfällen kann sie entfallen. Für einzelne Leistungen können besondere Wartezeiten bestehen. Bitte prüfen Sie das konkrete Angebot." },
    { question: "Sind Vorsorge und Zähne mitversichert?", answer: "Vorsorgeleistungen und Zahnbehandlungen sind je nach Leistungsvariante und Zusatzbaustein unterschiedlich enthalten oder begrenzt. Wir ordnen die Optionen vor Abschluss mit Ihnen ein." },
  ],
  sourceUrl: "https://www.arag.de/tierversicherung/",
};

export default function TierkrankenversicherungPage() {
  return <ProductLanding config={config} />;
}
