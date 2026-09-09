import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import { operator } from "../site-data";

export const dynamic = "force-static";

export const metadata: Metadata = { title: "Datenschutz | Versicherungsnavigator24", alternates: { canonical: "/datenschutz/" } };

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutz" intro="Wie beim Besuch dieser Website und bei einer Kontaktaufnahme personenbezogene Daten verarbeitet werden.">
      <h2>Verantwortlicher</h2>
      <p>{operator.name}<br />{operator.registeredStreet}<br />{operator.registeredCity}<br />Kontaktbüro: {operator.office}, {operator.street}, {operator.city}<br />Telefon: <a href={`tel:${operator.phoneHref}`}>{operator.phoneDisplay}</a><br />E-Mail: <a href={`mailto:${operator.directEmail}`}>{operator.directEmail}</a></p>

      <h2>Hosting und technische Zugriffsdaten</h2>
      <p>Für den späteren Produktivbetrieb ist Hosting bei IONOS SE, Elgendorfer Straße 57, 56410 Montabaur, vorgesehen. Beim Aufruf verarbeitet der Hostingdienst technische Zugriffsdaten, insbesondere IP-Adresse, Zeitpunkt, angeforderte Datei, Referrer, Browser, Betriebssystem und Gerätetyp, soweit dies zur sicheren und stabilen Bereitstellung erforderlich ist.</p>

      <h2>Lokaler Bedarfscheck</h2>
      <p>Der Bedarfscheck fragt ausschließlich unverbindliche Produktpräferenzen ab. Diese Auswahl wird nur im Arbeitsspeicher Ihres Browsers verarbeitet und weder an den Server übertragen noch dort gespeichert. Erst wenn Sie selbst den E-Mail-Link wählen, öffnet Ihr E-Mail-Programm einen vorausgefüllten Entwurf. Sie entscheiden anschließend selbst, ob und mit welchen Kontaktdaten Sie ihn versenden.</p>

      <h2>Kontakt per Telefon oder E-Mail</h2>
      <p>Bei einer Kontaktaufnahme verarbeiten wir die von Ihnen übermittelten Angaben zur Bearbeitung und Beantwortung Ihrer Anfrage sowie zur Vorbereitung einer gewünschten Beratung. Rechtsgrundlagen sind je nach Anliegen Art. 6 Abs. 1 Buchstabe b oder f DSGVO. Angaben werden nur an Beteiligte weitergegeben, soweit dies zur gewünschten Beratung oder Angebotserstellung erforderlich und rechtlich zulässig ist.</p>

      <h2>Cookies und Reichweitenmessung</h2>
      <p>Die Website setzt in der hier bereitgestellten Fassung keine Analyse-, Marketing- oder Profiling-Dienste ein. Technisch notwendige Speicherungen des Hostingdienstes oder des Browsers können erfolgen, soweit sie für Sicherheit, Bereitstellung und die von Ihnen aufgerufenen Funktionen erforderlich sind.</p>

      <h2>Speicherdauer</h2>
      <p>Kontaktdaten werden nur so lange gespeichert, wie dies für die Bearbeitung, gesetzliche Aufbewahrungspflichten oder die Abwehr und Durchsetzung von Ansprüchen erforderlich ist. Danach werden sie gelöscht oder gesetzeskonform eingeschränkt.</p>

      <h2>Ihre Rechte</h2>
      <p>Sie haben nach Maßgabe der gesetzlichen Voraussetzungen Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung können Sie mit Wirkung für die Zukunft widerrufen. Zudem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.</p>

      <h2>Keine automatisierte Entscheidung</h2>
      <p>Über diese Website findet keine ausschließlich automatisierte Entscheidung mit rechtlicher oder vergleichbar erheblicher Wirkung einschließlich Profiling im Sinne des Art. 22 DSGVO statt.</p>
      <p className="legal-updated">Stand: 7. September 2026. Vor öffentlichem Produktivgang sollte die Datenschutzerklärung anhand der endgültigen Hosting-, E-Mail- und Tracking-Konfiguration rechtlich geprüft werden.</p>
    </LegalShell>
  );
}
