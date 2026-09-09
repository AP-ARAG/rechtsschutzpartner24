import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(projectRoot, "dist/client");
const sitesRoot = process.env.SITES_ROOT ? resolve(process.env.SITES_ROOT) : resolve(projectRoot, "..");
const hubUrl = (process.env.HUB_URL || "https://home-5021386814.app-ionos.space").replace(/\/$/, "");
const petSiteUrl = (process.env.PET_SITE_URL || "https://home-5021386515.app-ionos.space").replace(/\/$/, "");
const pkvSiteUrl = (process.env.PKV_SITE_URL || "https://home-5021386578.app-ionos.space").replace(/\/$/, "");
const deploymentUrl = "https://IONOS_DEPLOY_NOW_SITE_URL";
const sourceSiteUrl = "https://versicherungsnavigator24.vertrieb180843.chatgpt.site";

const sites = [
  {
    id: "pet",
    directory: "tierkrankenschutz24-static",
    sourceRoute: "tierkrankenversicherung",
    title: "Tierkrankenschutz24",
    subtitle: "ARAG Tierkranken- und OP-Schutz persönlich eingeordnet",
    mark: "T24",
    liveUrl: petSiteUrl,
    otherProductUrl: pkvSiteUrl,
    hero: "tierkrankenschutz24-hero.webp",
  },
  {
    id: "pkv",
    directory: "privatkrankenversicherung24-static",
    sourceRoute: "private-krankenversicherung",
    title: "PrivatKrankenversicherung24",
    subtitle: "ARAG private Krankenversicherung persönlich eingeordnet",
    mark: "P24",
    liveUrl: pkvSiteUrl,
    otherProductUrl: petSiteUrl,
    hero: "privatkrankenversicherung24-hero.webp",
  },
];

const legalRoutes = ["impressum", "erstinformation", "datenschutz"];

const rewriteDocument = (html, site, route = "") => {
  const selfProduct = site.id === "pet" ? "tierkrankenversicherung" : "private-krankenversicherung";
  const otherProduct = site.id === "pet" ? "private-krankenversicherung" : "tierkrankenversicherung";
  const canonicalPath = route ? `/${route}/` : "/";

  let rewritten = html
    .replace("<body>", `<body data-product-site="${site.id}">`)
    .replace(/<link\b[^>]*\brel=(?:"|')stylesheet(?:"|')[^>]*>/i, '<link rel="stylesheet" href="/styles.css">')
    .replaceAll(`${sourceSiteUrl}/${site.sourceRoute}/`, `${deploymentUrl}${canonicalPath}`)
    .replaceAll(sourceSiteUrl, deploymentUrl)
    .replace(/href="\/"/g, `href="${hubUrl}/"`)
    .replace(new RegExp(`href="/${selfProduct}/?"`, "g"), 'href="/"')
    .replace(new RegExp(`href="/${otherProduct}/?"`, "g"), `href="${site.otherProductUrl}"`)
    .replaceAll(`href="${site.liveUrl}/"`, 'href="/"')
    .replaceAll(">Versicherungsnavigator24</strong>", `>${site.title}</strong>`)
    .replaceAll("Versicherungsnavigator24 Startseite", `${site.title} Startseite`)
    .replaceAll("ARAG Hauptgeschäftsstelle Augsburg · Vier starke Lösungen", site.subtitle)
    .replace(/(<span class="brand-mark"[^>]*>)V24(<\/span>)/g, `$1${site.mark}$2`)
    .replaceAll(`href="${hubUrl}/" class="brand-link" aria-label="${site.title} Startseite"`, `href="/" class="brand-link" aria-label="${site.title} Startseite"`)
    .replaceAll(`href="${hubUrl}/" class="footer-brand"`, 'href="/" class="footer-brand"')
    .replace("</body>", `${route ? "" : '<script defer src="/consultation.js"></script>'}</body>`);

  if (route && route !== "404") {
    rewritten = rewritten
      .replaceAll(` | Versicherungsnavigator24</title>`, ` | ${site.title}</title>`)
      .replace('<meta name="robots" content="index, follow"/>', '<meta name="robots" content="noindex, follow"/>')
      .replace('<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1"/>', '<meta name="googlebot" content="noindex, follow"/>')
      .replaceAll('content="Versicherungsnavigator24"', `content="${site.title}"`)
      .replaceAll("zu Versicherungsnavigator24.", `zu ${site.title}.`);
  }

  return rewritten;
};

const consultationScript = `(() => {
  const root = document.querySelector('.consultation-check');
  const kind = document.body.dataset.productSite;
  if (!root || !['pet', 'pkv'].includes(kind)) return;

  const questions = {
    pet: [
      ['Wen möchten Sie absichern?', 'Der Schutz wird passend zu Tierart, Alter und gewünschtem Umfang eingeordnet.', ['Hund', 'Katze', 'Hund und Katze']],
      ['Welche Richtung interessiert Sie?', 'Noch unsicher? Dann wählen Sie die persönliche Orientierung.', ['OP-Schutz', 'Krankenvollschutz', 'Beratung zum Umfang']],
      ['Wie alt ist Ihr Tier ungefähr?', 'Eine grobe Einordnung genügt. Gesundheitsdaten werden hier nicht abgefragt.', ['unter 1 Jahr', '1 bis 5 Jahre', 'über 5 Jahre']],
    ],
    pkv: [
      ['Welche berufliche Situation trifft zu?', 'Die Zugangsvoraussetzungen unterscheiden sich je nach Status.', ['angestellt', 'selbstständig', 'Beamte oder Beihilfe', 'Studium']],
      ['Was ist Ihnen besonders wichtig?', 'Die Auswahl dient nur der Vorbereitung Ihrer persönlichen Beratung.', ['ambulante Leistungen', 'stationäre Leistungen', 'Zahnleistungen', 'ausgewogenes Preis-Leistungs-Verhältnis']],
      ['Wie möchten Sie starten?', 'Sie entscheiden, ob wir zuerst allgemein orientieren oder direkt Leistungen vergleichen.', ['Grundlagenberatung', 'Leistungsvergleich', 'Wechselprüfung']],
    ],
  };
  const labels = {
    'unter 1 Jahr': 'Unter 1 Jahr', 'über 5 Jahre': 'Über 5 Jahre',
    angestellt: 'Angestellt', selbstständig: 'Selbstständig',
    'Beamte oder Beihilfe': 'Beamte / Beihilfe', Studium: 'Studium',
    'ambulante Leistungen': 'Starke ambulante Leistungen',
    'stationäre Leistungen': 'Top-Schutz im Krankenhaus',
    Zahnleistungen: 'Hochwertiger Zahnschutz',
    'ausgewogenes Preis-Leistungs-Verhältnis': 'Beitrag im Blick',
    Grundlagenberatung: 'Grundlagen klären', Leistungsvergleich: 'Tarife vergleichen', Wechselprüfung: 'Wechsel prüfen',
    'Beratung zum Umfang': 'Bitte beraten',
  };
  const productName = kind === 'pet' ? 'Tierkrankenschutz' : 'private Krankenversicherung';
  let step = 0;
  let answers = [];

  const esc = (value) => value.replace(/[&<>\"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[char]));
  const render = () => {
    if (step < questions[kind].length) {
      const [title, help, choices] = questions[kind][step];
      root.innerHTML = '<div class="check-progress"><span>Schritt ' + (step + 1) + ' von ' + questions[kind].length + '</span><span aria-hidden="true"><i style="width:' + (((step + 1) / questions[kind].length) * 100) + '%"></i></span></div>' +
        '<h3>' + esc(title) + '</h3><p>' + esc(help) + '</p><div class="answer-grid">' +
        choices.map((choice) => '<button class="answer-button" type="button" data-answer="' + esc(choice) + '">' + esc(labels[choice] || choice) + '</button>').join('') +
        '</div>' + (step ? '<button class="text-button" type="button" data-action="back">← Zurück</button>' : '');
      return;
    }
    const subject = encodeURIComponent('Beratungswunsch: ' + productName);
    const body = encodeURIComponent('Guten Tag Herr Papadakis,\\n\\nich interessiere mich für ' + productName + '.\\n\\nMeine unverbindliche Vorauswahl:\\n- ' + answers.join('\\n- ') + '\\n\\nBitte melden Sie sich bei mir.\\n');
    root.innerHTML = '<div class="check-result" aria-live="polite"><span class="result-mark" aria-hidden="true">✓</span><p class="eyebrow">Vorauswahl abgeschlossen</p><h3>Ihre Beratung kann gezielt starten.</h3><p>Sie haben ausgewählt: <strong>' + esc(answers.join(' · ')) + '</strong>. Ihre Angaben wurden nicht gespeichert oder übertragen.</p><div class="hero-actions"><a class="button button-primary" href="mailto:info@rechtsschutzpartner24.de?subject=' + subject + '&body=' + body + '">Auswahl per E-Mail senden</a><a class="button button-secondary" href="tel:+49821509280">Jetzt anrufen</a></div><button class="text-button" type="button" data-action="reset">Neue Auswahl starten</button></div>';
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.answer) {
      answers = [...answers.slice(0, step), button.dataset.answer];
      step += 1;
    } else if (button.dataset.action === 'back') {
      step = Math.max(0, step - 1);
    } else if (button.dataset.action === 'reset') {
      answers = [];
      step = 0;
    } else {
      return;
    }
    render();
  });
  render();
})();
`;

const htaccess = `Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
`;

for (const site of sites) {
  const target = resolve(sitesRoot, site.directory);
  await mkdir(target, { recursive: true });
  const styles = (await readFile(resolve(projectRoot, "app/globals.css"), "utf8"))
    .replace(/^@import[^;]+;\s*/gm, "");
  await writeFile(resolve(target, "styles.css"), styles);

  const indexSource = await readFile(resolve(sourceRoot, `${site.sourceRoute}.html`), "utf8");
  await writeFile(resolve(target, "index.html"), rewriteDocument(indexSource, site));

  for (const route of legalRoutes) {
    await mkdir(resolve(target, route), { recursive: true });
    const legalSource = await readFile(resolve(sourceRoot, `${route}.html`), "utf8");
    const legalHtml = rewriteDocument(legalSource, site, route);
    await writeFile(resolve(target, `${route}.html`), legalHtml);
    await writeFile(resolve(target, route, "index.html"), legalHtml);
  }

  await writeFile(resolve(target, "404.html"), rewriteDocument(await readFile(resolve(sourceRoot, "404.html"), "utf8"), site, "404"));
  for (const asset of ["agapios-papadakis.jpg", site.hero, "og.png", "favicon.svg"]) {
    const content = await readFile(resolve(projectRoot, "public", asset));
    await writeFile(resolve(target, asset), content);
  }
  await writeFile(resolve(target, "consultation.js"), consultationScript);
  await writeFile(resolve(target, ".htaccess"), htaccess);
  await writeFile(resolve(target, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${deploymentUrl}/sitemap.xml\n`);
  await writeFile(resolve(target, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${deploymentUrl}/</loc></url>\n</urlset>\n`);
  await writeFile(resolve(target, "README.md"), `# ${site.title}\n\nEigenständige statische IONOS-Deploy-Now-Website. Es ist kein PHP- oder Node-Server erforderlich.\n\n- Projekttyp: Static\n- Build-Befehl: leer\n- Veröffentlichungsordner: Repository-Stammverzeichnis (.)\n`);
  await writeFile(resolve(target, ".gitignore"), ".DS_Store\n");
}
