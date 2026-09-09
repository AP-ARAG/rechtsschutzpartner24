import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "../components/LegalShell";
import { operator } from "../site-data";

export const dynamic = "force-static";

export const metadata: Metadata = { title: "Impressum | Versicherungsnavigator24", alternates: { canonical: "/impressum/" }, robots: { index: true, follow: true } };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum" intro="Anbieterangaben und berufsrechtliche Informationen zu Versicherungsnavigator24.">
      <h2>Anbieter und inhaltlich Verantwortlicher</h2>
      <p>{operator.name}<br />{operator.qualification}<br />Betriebliche Anschrift laut Vermittlerregister:<br />{operator.registeredStreet}<br />{operator.registeredCity}<br />Deutschland</p>
      <p>{operator.office} (Kontaktbüro)<br />{operator.street}<br />{operator.city}</p>
      <p>Telefon: <a href={`tel:${operator.phoneHref}`}>{operator.phoneDisplay}</a><br />Mobil: <a href={`tel:${operator.mobileHref}`}>{operator.mobileDisplay}</a><br />E-Mail: <a href={`mailto:${operator.directEmail}`}>{operator.directEmail}</a><br />Website-Anfragen: <a href={`mailto:${operator.email}`}>{operator.email}</a></p>
      <p><a href={operator.profileUrl} target="_blank" rel="noreferrer">Offizielles Vermittlerprofil</a></p>

      <h2>Berufsrechtliche Angaben</h2>
      <p>Gebundener Versicherungsvertreter nach § 34d Absatz 7 Satz 1 Nummer 1 GewO.<br />Registrierungsnummer: <strong>{operator.registerNumber}</strong></p>
      <p>Gemeinsame Registerstelle: Deutsche Industrie- und Handelskammer (DIHK), Breite Straße 29, 10178 Berlin, Telefon 0180 6005850. Registerauskunft unter <a href="https://www.vermittlerregister.info/" target="_blank" rel="noreferrer">vermittlerregister.info</a>.</p>
      <p>Erlaubnis- und Registerbehörde laut Vermittlerregister: Industrie- und Handelskammer für München und Oberbayern, Max-Joseph-Straße 2, 80333 München.</p>
      <p>Die Vermittlung erfolgt als gebundener Versicherungsvertreter im Auftrag der ARAG Versicherungsgruppe. Angaben zu Beratung, Vergütung und Beteiligungsverhältnissen enthält die <Link href="/erstinformation/">Erstinformation nach § 15 VersVermV</Link>.</p>

      <h2>Schlichtungsstellen</h2>
      <p>Versicherungsombudsmann e. V.<br />Postfach 08 06 32, 10006 Berlin<br />Telefon 0800 3696000<br /><a href="https://www.versicherungsombudsmann.de/" target="_blank" rel="noreferrer">versicherungsombudsmann.de</a></p>
      <p>Für Angelegenheiten der privaten Kranken- und Pflegeversicherung:<br />Ombudsmann Private Kranken- und Pflegeversicherung<br />Postfach 06 02 22, 10052 Berlin<br />Telefon 0800 2550444<br /><a href="https://www.pkv-ombudsmann.de/" target="_blank" rel="noreferrer">pkv-ombudsmann.de</a></p>

      <h2>Hinweise zu Inhalten</h2>
      <p>Die Informationen auf diesen Websites dienen der Orientierung und persönlichen Vorbereitung einer Versicherungsberatung. Sie ersetzen weder eine individuelle Beratung noch Antrag, Police, Versicherungsbedingungen oder eine Leistungszusage. Für verlinkte externe Inhalte sind deren Anbieter verantwortlich.</p>
      <p>Genannte Unternehmens- und Produktnamen können geschützte Kennzeichen ihrer jeweiligen Inhaber sein. Ihre Nennung erfolgt zur Beschreibung der Vermittlertätigkeit und der angebotenen Produktlösungen.</p>
      <p className="legal-updated">Stand: 7. September 2026</p>
    </LegalShell>
  );
}
