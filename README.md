# RechtsschutzPartner24

Eigenständige HTML/CSS/JavaScript-Website mit einem kleinen PHP-Endpunkt für Angebotsanfragen.

## Struktur

- `index.html` – Startseite und Angebotsstrecke
- `styles.css` – responsives Layout
- `script.js` – Formularlogik und Cookie-Einwilligung
- `contact.php` – Versand der Anfrage an `leads.ap.arag@gmail.com`
- `impressum.html` und `datenschutz.html` – rechtliche Seiten

## IONOS Deploy Now

Das Repository muss in Deploy Now als **PHP-Projekt** eingebunden werden, damit `contact.php` Anfragen per E-Mail versenden kann. Als Produktionsverzeichnis wird das Repository-Stammverzeichnis verwendet; ein Build-Befehl ist nicht erforderlich.

Nach erfolgreicher Bereitstellung kann die Domain `rechtsschutzpartner24.de` in den Projekteinstellungen mit dem Production Deployment verbunden werden.

Empfohlene Einstellungen im Einrichtungsassistenten:

- Projekttyp: `PHP`
- Production Branch: `main`
- Build-Befehl: leer / kein Build
- Produktionsverzeichnis: Repository-Stammverzeichnis (`.`)

## Umschaltung ohne unnötige Ausfallzeit

1. Repository als privates GitHub-Repository bereitstellen.
2. PHP-Projekt in Deploy Now anlegen und das erste Production Deployment abwarten.
3. Die IONOS-Vorschau vollständig testen, insbesondere eine echte Anfrage über `contact.php` und den Eingang der E-Mail.
4. Erst danach `rechtsschutzpartner24.de` über **Connect your domain** mit dem Production Deployment verbinden. IONOS stellt das TLS-Zertifikat automatisch bereit.
5. Hauptdomain, `www`-Variante, Impressum, Datenschutz, Formular und Analytics nach der Umschaltung erneut prüfen.

Die bisherige Domainzuordnung darf erst in Schritt 4 geändert werden. So bleibt die bestehende Website erreichbar, während das neue Deployment getestet wird.

## Vor dem Livegang

- Versand einer echten Testanfrage prüfen.
- Datenschutzerklärung und Impressum rechtlich abnehmen lassen.
- IONOS-Vertrag zur Auftragsverarbeitung und Google-Verarbeitungsbedingungen prüfen.
- Google Analytics und Google Ads nur aktiviert lassen, wenn die angegebenen IDs weiterverwendet werden sollen.
