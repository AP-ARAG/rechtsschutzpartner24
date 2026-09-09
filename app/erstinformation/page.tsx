import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import { operator } from "../site-data";

export const dynamic = "force-static";

export const metadata: Metadata = { title: "Erstinformation | Versicherungsnavigator24", alternates: { canonical: "/erstinformation/" } };

export default function ErstinformationPage() {
  return (
    <LegalShell title="Erstinformation" intro="Information gemäß § 15 Versicherungsvermittlungsverordnung beim ersten Geschäftskontakt.">
      <h2>Vermittler und betriebliche Anschrift</h2>
      <p>{operator.name}<br />{operator.qualification}<br />{operator.registeredStreet}<br />{operator.registeredCity}<br />Deutschland</p>
      <p>{operator.office} (Kontaktbüro)<br />{operator.street}<br />{operator.city}</p>
      <p>Telefon: <a href={`tel:${operator.phoneHref}`}>{operator.phoneDisplay}</a><br />E-Mail: <a href={`mailto:${operator.directEmail}`}>{operator.directEmail}</a></p>

      <h2>Vermittlerstatus und Register</h2>
      <p>Gebundener Versicherungsvertreter nach § 34d Abs. 7 Satz 1 Nr. 1 GewO.<br />Registrierungsnummer: <strong>{operator.registerNumber}</strong></p>
      <p>Überprüfung im öffentlichen <a href="https://www.vermittlerregister.info/recherche" target="_blank" rel="noreferrer">Vermittlerregister</a>. Gemeinsame Registerstelle: Deutsche Industrie- und Handelskammer, Breite Straße 29, 10178 Berlin.</p>

      <h2>Beratung, Produktangebot und Vergütung</h2>
      <p>Es wird Beratung zu den vermittelten Versicherungsprodukten angeboten. Die Vermittlung erfolgt als gebundener Versicherungsvertreter im Auftrag der ARAG Versicherungsgruppe und damit nicht auf Grundlage einer ausgewogenen Untersuchung einer hinreichenden Zahl am Markt angebotener Versicherungsverträge.</p>
      <p>Die Vergütung für die Vermittlung besteht aus einer Provision, die in der Versicherungsprämie enthalten ist. Eine unmittelbar vom Kunden zu zahlende Vergütung wird für diese Vermittlung nicht erhoben.</p>

      <h2>Beteiligungsverhältnisse</h2>
      <p>Nach den dem Vermittler vorliegenden Angaben hält er keine unmittelbare oder mittelbare Beteiligung von zehn Prozent oder mehr an den Stimmrechten oder am Kapital eines Versicherungsunternehmens. Ebenso hält danach kein Versicherungsunternehmen oder Mutterunternehmen eines Versicherungsunternehmens eine unmittelbare oder mittelbare Beteiligung von zehn Prozent oder mehr am Vermittler.</p>

      <h2>Schlichtungsstellen</h2>
      <p>Versicherungsombudsmann e. V., Postfach 08 06 32, 10006 Berlin, Telefon 0800 3696000, <a href="https://www.versicherungsombudsmann.de/" target="_blank" rel="noreferrer">versicherungsombudsmann.de</a>.</p>
      <p>Für private Kranken- und Pflegeversicherung: Ombudsmann Private Kranken- und Pflegeversicherung, Postfach 06 02 22, 10052 Berlin, Telefon 0800 2550444, <a href="https://www.pkv-ombudsmann.de/" target="_blank" rel="noreferrer">pkv-ombudsmann.de</a>.</p>
      <p className="legal-updated">Stand: 7. September 2026</p>
    </LegalShell>
  );
}
