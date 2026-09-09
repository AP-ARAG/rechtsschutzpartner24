# Versicherungsnavigator24

Zentrale Website-Familie für vier spezialisierte Versicherungswelten der ARAG Hauptgeschäftsstelle Augsburg:

- `rechtsschutzpartner24.de`
- `vermieterrechtsschutz24.com`
- `tierkrankenschutz24.de` → Route `/tierkrankenversicherung`
- `privatkrankenversicherung24.de` → Route `/private-krankenversicherung`

Die geplante Hauptdomain ist `versicherungsnavigator24.de`. Alle Domains waren bei der DENIC-Abfrage am 7. September 2026 frei; eine Verfügbarkeit ist erst mit erfolgreicher Registrierung gesichert.

## Entwicklung

```bash
pnpm install
pnpm dev
pnpm test
```

## IONOS Deploy Now (PHP)

Das Repository erzeugt einen eigenständigen PHP-kompatiblen Export ohne Server-Rendering-Abhängigkeit. Die Hauptseite wird als PHP-Projekt veröffentlicht; Tier-KV und Privat-KV werden aus diesem Design als getrennte reine Static-Projekte exportiert.

In Deploy Now gelten für die Hauptseite folgende Build-Einstellungen:

- Installation: `pnpm install --frozen-lockfile`
- Build-Befehl: `pnpm run build`
- Veröffentlichungsordner: `dist/client`
- Node.js: 22
- Projekttyp: `PHP`

Der Build erzeugt zusätzlich `robots.txt`, `sitemap.xml` und eine Apache-`.htaccess`. Letztere sorgt dafür, dass die sprechenden URLs wie `/tierkrankenversicherung` ohne sichtbare `.html`-Endung funktionieren. Deploy Now setzt `SITE_URL`; dadurch enthalten Canonical-, Open-Graph- und Sitemap-URLs automatisch die tatsächliche Deployment-Domain.

## Architektur

Die Hauptseite und die gemeinsame Gestaltungsquelle liegen in diesem Repository. `scripts/export-product-sites.mjs` erzeugt daraus eigenständige statische Pakete für Tier-KV und Privat-KV. Die zwei bestehenden Rechtsschutz-Seiten behalten ihre eigenen GitHub-/IONOS-PHP-Projekte und erhalten eine identische V24-Navigationsleiste. Damit bleiben alle fünf Deployments unabhängig.

Die neuen Domains können nach Registrierung zunächst per dauerhafter Weiterleitung auf die jeweiligen Produktpfade zeigen. Alternativ können später separate Deployments mit denselben Komponenten erzeugt werden. Vor dem öffentlichen Livegang sind folgende Schritte erforderlich:

1. Domains registrieren und DNS/SSL einrichten.
2. Finale E-Mail-Adresse und Hostinganbieter in Kontakt- und Datenschutztexten eintragen.
3. Impressum, Erstinformation, Datenschutz und Produktaussagen rechtlich/fachlich abnehmen lassen.
4. Formulare beziehungsweise CRM-Anbindung nur mit finalem Datenschutzkonzept ergänzen.
5. Search Console, Sitemap und kanonische URLs nach der Domainaufschaltung prüfen.

Die interaktiven Bedarfschecks verarbeiten Antworten ausschließlich lokal im Browser und übertragen nichts automatisch.
