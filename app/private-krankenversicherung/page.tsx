import type { Metadata } from "next";
import { ProductLanding, type ProductConfig } from "../components/ProductLanding";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Private Krankenversicherung der ARAG | PrivatKrankenversicherung24",
  description: "Private Krankenversicherung für Angestellte, Selbstständige, Beamte und Studierende: Leistungen einordnen und persönlich beraten lassen.",
  alternates: { canonical: "/private-krankenversicherung/" },
  openGraph: {
    title: "PrivatKrankenversicherung24 | Gesundheitsschutz persönlich erklärt",
    description: "ARAG PKV-Leistungen verständlich einordnen und persönlich beraten lassen.",
    url: "/private-krankenversicherung/",
    siteName: "PrivatKrankenversicherung24",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PrivatKrankenversicherung24 – private ARAG Krankenversicherung" }],
  },
  twitter: { card: "summary_large_image", title: "PrivatKrankenversicherung24", description: "Private ARAG Krankenversicherung verständlich eingeordnet.", images: ["/og.png"] },
};

const config: ProductConfig = {
  kind: "pkv",
  active: "pkv",
  eyebrow: "PrivatKrankenversicherung24 · ARAG PKV",
  title: "Private Krankenversicherung, die zu Ihrem Leben passt.",
  lead: "Für Angestellte, Selbstständige, Beamte und Studierende: Wir ordnen Leistungen, Zugangsvoraussetzungen und langfristige Gestaltungsmöglichkeiten verständlich ein.",
  image: "/privatkrankenversicherung24-hero.webp",
  imageAlt: "Kundin in einer persönlichen Beratung zur privaten Krankenversicherung",
  benefits: [
    { title: "Starke ambulante Versorgung", text: "Je nach Tarif stehen umfassende Leistungen bei Haus- und Fachärzten sowie für Vorsorge zur Verfügung." },
    { title: "Schutz im Krankenhaus", text: "Leistungsvarianten können privatärztliche Behandlung sowie Ein- oder Zweibettzimmer einschließen." },
    { title: "Hochwertige Zahnleistungen", text: "Zahnbehandlung und Zahnersatz sind tarifabhängig mit unterschiedlichen Erstattungssätzen abgesichert." },
    { title: "Digitale Kostenerstattung", text: "Rechnungen lassen sich über die ARAG GesundheitsApp komfortabel digital einreichen." },
  ],
  audiencesTitle: "Die richtige Einordnung beginnt bei Ihrem Status.",
  audiences: [
    { title: "Angestellte", text: "Ein Wechsel ist möglich, wenn das Einkommen über der jeweils geltenden Versicherungspflichtgrenze liegt und die weiteren Voraussetzungen erfüllt sind." },
    { title: "Selbstständige", text: "Leistung, Selbstbeteiligung und Krankentagegeld lassen sich auf Tätigkeit und Absicherungsbedarf abstimmen." },
    { title: "Beamte & Beihilfeberechtigte", text: "Beihilfekonforme Lösungen ergänzen den individuellen Beihilfeanspruch und berücksichtigen die persönliche Situation." },
    { title: "Studierende", text: "Für Studium und Berufseinstieg kommen besondere Zugangs- und Tariffragen hinzu, die vor dem Abschluss sauber geprüft werden sollten." },
  ],
  levels: [
    {
      kicker: "Ausgewogen",
      title: "Komfortschutz",
      text: "Solider privater Gesundheitsschutz mit bewusst ausgewähltem Leistungsumfang.",
      items: ["Ambulante Grundabsicherung", "Zahnbehandlung und Zahnersatz", "Individuelle Selbstbeteiligung"],
    },
    {
      kicker: "Leistungsstark",
      title: "MedExtra",
      text: "Umfassendere Leistungen mit starkem Preis-Leistungs-Verhältnis.",
      items: ["Freier Zugang zu Fachärzten", "Erweiterte Vorsorgeleistungen", "Stärkere Erstattungen je nach Bereich"],
    },
    {
      kicker: "Höchster Anspruch",
      title: "MedBest",
      text: "Premiumschutz für besonders hohe Ansprüche an ambulante, stationäre und zahnärztliche Versorgung.",
      items: ["Umfassender Top-Schutz", "Hochwertige Zahnleistungen", "Optionale Ergänzungen möglich"],
    },
  ],
  detailTitle: "Eine PKV-Entscheidung sollte auch in zehn Jahren noch passen.",
  detailLead: "Neben dem heutigen Beitrag zählen garantierte Leistungen, Selbstbeteiligung, Beitragsentlastung im Alter, Krankentagegeld und die Absicherung der Familie.",
  detailColumns: [
    { title: "Gesundheitsprüfung", text: "Gesundheitsfragen müssen vollständig und wahrheitsgemäß beantwortet werden. Eine strukturierte Vorprüfung kann helfen, Risiken früh zu erkennen." },
    { title: "Selbstbeteiligung", text: "Eine höhere Selbstbeteiligung kann den laufenden Beitrag beeinflussen, erhöht aber Ihren eigenen Kostenanteil im Leistungsfall." },
    { title: "Beitrag im Ruhestand", text: "Optionale Entlastungsbausteine können helfen, Beiträge im Alter planbarer zu gestalten. Wirkung und Kosten sollten gemeinsam betrachtet werden." },
    { title: "Krankentagegeld", text: "Bei längerer Arbeitsunfähigkeit kann ein passendes Krankentagegeld das Einkommen absichern – besonders relevant für Selbstständige." },
  ],
  faqs: [
    { question: "Wer kann sich privat krankenversichern?", answer: "Grundsätzlich kommen unter anderem Selbstständige, Beamte, beihilfeberechtigte Personen, Studierende und Angestellte oberhalb der jeweils geltenden Versicherungspflichtgrenze infrage. Die individuelle Situation muss geprüft werden." },
    { question: "Ist eine Gesundheitsprüfung erforderlich?", answer: "In der Regel ja. Die Angaben müssen vollständig und wahrheitsgemäß sein, weil sie Einfluss auf Annahme, Risikozuschläge oder Leistungsausschlüsse haben können." },
    { question: "Kann ich Leistungen später anpassen?", answer: "Je nach Tarif und gewähltem Optionsbaustein sind spätere Wechsel oder Verbesserungen möglich. Voraussetzungen, Fristen und eine mögliche erneute Gesundheitsprüfung sollten vor Abschluss geklärt werden." },
    { question: "Was passiert bei Elternzeit oder im Ruhestand?", answer: "Einzelne Tarife und Ergänzungsbausteine sehen besondere Regelungen vor, etwa Beitragsbefreiung bei Elterngeldbezug oder Beitragsentlastung im Alter. Maßgeblich sind die konkreten Bedingungen." },
    { question: "Wie reiche ich Rechnungen ein?", answer: "ARAG Kunden können Rechnungen und Belege über die GesundheitsApp digital einreichen. Alternativ stehen die jeweils angegebenen Servicewege zur Verfügung." },
  ],
  sourceUrl: "https://www.arag.de/private-krankenversicherung/",
};

export default function PrivateKrankenversicherungPage() {
  return <ProductLanding config={config} />;
}
