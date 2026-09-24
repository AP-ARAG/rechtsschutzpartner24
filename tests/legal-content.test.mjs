import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("publishes complete provider and intermediary information", async () => {
  const [imprint, firstInformation, privacy] = await Promise.all([
    read("impressum.html"),
    read("erstinformation.html"),
    read("datenschutz.html"),
  ]);

  for (const document of [imprint, firstInformation]) {
    assert.match(document, /Agapios Papadakis/);
    assert.match(document, /D-05V5-SZ9YK-16/);
    assert.match(document, /Wankelstraße 2/);
    assert.match(document, /86356 Neusäß/);
    assert.doesNotMatch(document, /Buchenbergstr\. 3f|86420 Diedorf/);
    assert.match(document, /0800 3696000/);
  }
  assert.match(firstInformation, /Beratung, Produktangebot und Vergütung/);
  assert.match(firstInformation, /Beteiligungsverhältnisse/);
  assert.match(privacy, /Pflicht-Checkbox.*zugänglich.*keine Einwilligung/s);
  assert.doesNotMatch(imprint, /IHK-Register-Nr.*wird nachgereicht/i);
});

test("requires adult use, privacy acknowledgement and electronic first information", async () => {
  const [client, endpoint] = await Promise.all([read("script.js"), read("contact.php")]);
  for (const source of [client, endpoint]) {
    assert.match(source, /datenschutz_bestaetigt/);
    assert.match(source, /erstinformation_digital/);
  }
  assert.match(client, /latestAdultBirthDate/);
  assert.match(endpoint, /new DateTimeImmutable\('-18 years'\)/);
  assert.match(endpoint, /leads\.ap\.arag@gmail\.com/);
  assert.match(endpoint, /Access-Control-Allow-Origin/);
  assert.match(endpoint, /'navigator'.*'TierSafe'|'tier' => 'TierSafe'/s);
  assert.match(endpoint, /'pkv' => 'PrivatKrankenversicherung24'/);
  assert.match(endpoint, /deliver_lead/);
  assert.match(client, /ga-disable-AW-18073108906/);
});

test("links every page into the V24 insurance family", async () => {
  const pages = await Promise.all([
    read("index.html"),
    read("impressum.html"),
    read("erstinformation.html"),
    read("datenschutz.html"),
  ]);

  for (const page of pages) {
    assert.match(page, /https:\/\/home-5021372330\.app-ionos\.space\//);
    assert.match(page, /https:\/\/vermieterrechtsschutz24\.com/);
    assert.match(page, /tiersafe\.de/);
    assert.match(page, /home-5021386578\.app-ionos\.space/);
    assert.match(page, /Zwischen Versicherungswelten wechseln/);
  }
});

test("matches the compact shared header and Vermieter hero spacing", async () => {
  const [home, styles, cacheRules, heroImage] = await Promise.all([
    read("index.html"),
    read("styles.css"),
    read(".htaccess"),
    stat(new URL("hero-home.jpg", root)),
  ]);

  assert.match(home, /Hauptgeschäftsstelle ARAG/);
  assert.doesNotMatch(home, /brand-mark[^>]*>ARAG/);
  assert.doesNotMatch(home, /ARAG Rechtsschutz persönlich und verständlich beraten/);
  assert.match(home, /class="offer-hero"/);
  assert.match(styles, /\.site-header\{min-height:82px/);
  assert.match(styles, /\.offer-hero\{min-height:680px;padding:clamp\(34px,5vw,64px\) clamp\(16px,4vw,56px\)/);
  assert.match(styles, /\.offer-hero\{[^}]*place-items:start center/);
  assert.match(styles, /url\("hero-home\.jpg"\)/);
  assert.match(home, /20260924-funnel-type-v2/);
  assert.match(styles, /\.option\{[^}]*min-width:0;[^}]*overflow-wrap:anywhere;[^}]*hyphens:auto;/);
  assert.equal((home.match(/data-funnel/g) || []).length, 2);
  assert.match(cacheRules, /no-cache, no-store, must-revalidate/);
  assert.ok(heroImage.size > 0);
});

test("uses the shared Vermieter-style advisor portrait layout", async () => {
  const [home, styles, portrait] = await Promise.all([
    read("index.html"),
    read("styles.css"),
    stat(new URL("agapios-papadakis.jpg", root)),
  ]);

  assert.match(home, /class="advisor-portrait"/);
  assert.match(home, /Persönlich beraten von Agapios Papadakis/);
  assert.match(home, /Offizielles Vermittlerprofil/);
  assert.match(styles, /\.advisor-portrait img\{[^}]*aspect-ratio:4\/3/);
  assert.match(styles, /grid-template-columns:minmax\(280px,390px\) minmax\(360px,1fr\)/);
  assert.ok(portrait.size > 10_000);
});

test("publishes accessibility tools, exit intent and GEO-readable entities", async () => {
  const [home, tools, styles, sitemap] = await Promise.all([
    read("index.html"), read("site-tools.js"), read("styles.css"), read("sitemap.xml"),
  ]);
  assert.match(home, /site-tools\.js\?v=20260922-a11y-ui-v4/);
  assert.match(home, /data-exit-intent/);
  assert.match(home, /"@type":"InsuranceAgency"/);
  assert.match(home, /"@type":"WebSite"/);
  assert.match(home, /"@type":"FAQPage"/);
  assert.match(home, /Offizielle ARAG Produktinformationen/);
  assert.match(tools, /data-a11y-option="contrast"/);
  assert.match(tools, /Die Auswahl wird nicht gespeichert/);
  assert.match(tools, /aria-label="Barrierefreiheit"/);
  assert.match(styles, /\.a11y-tools/);
  assert.match(styles, /\.a11y-panel\[hidden\]/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /\.a11y-trigger\{position:relative;width:52px/);
  assert.match(styles, /\.a11y-options button strong::after/);
  assert.doesNotMatch(styles, /a11y-high-contrast body\{[^}]*filter:/);
  assert.match(sitemap, /2026-09-18/);
});
