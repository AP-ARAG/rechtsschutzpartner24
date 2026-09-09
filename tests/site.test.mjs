import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("connects the four insurance worlds through one shared system", async () => {
  const [home, chrome, data] = await Promise.all([
    read("app/page.tsx"),
    read("app/components/SiteChrome.tsx"),
    read("app/site-data.ts"),
  ]);

  for (const name of ["RechtsschutzPartner24", "Vermieterrechtsschutz24", "Tierkrankenschutz24", "PrivatKrankenversicherung24"]) {
    assert.match(`${home}\n${chrome}`, new RegExp(name));
  }
  for (const domain of ["versicherungsnavigator24.de", "rechtsschutzpartner24.de", "vermieterrechtsschutz24.com", "tierkrankenschutz24.de", "privatkrankenversicherung24.de"]) {
    assert.match(data, new RegExp(domain.replaceAll(".", "\\.")));
  }
  assert.match(chrome, /Zur Hauptseite/);
  assert.match(chrome, /Zwischen Versicherungswelten|Versicherungsbereiche/);
  assert.match(data, /home-5021386515\.app-ionos\.space/);
  assert.match(data, /home-5021386578\.app-ionos\.space/);
});

test("ships SEO, legal, privacy and product-detail foundations", async () => {
  const [layout, sitemap, robots, pet, pkv, imprint, firstInfo, privacy] = await Promise.all([
    read("app/layout.tsx"),
    read("app/sitemap.ts"),
    read("app/robots.ts"),
    read("app/tierkrankenversicherung/page.tsx"),
    read("app/private-krankenversicherung/page.tsx"),
    read("app/impressum/page.tsx"),
    read("app/erstinformation/page.tsx"),
    read("app/datenschutz/page.tsx"),
  ]);

  assert.match(layout, /metadataBase/);
  assert.match(layout, /openGraph/);
  assert.match(sitemap, /tierkrankenversicherung/);
  assert.match(sitemap, /private-krankenversicherung/);
  assert.match(robots, /sitemap/);
  assert.match(pet, /4-fachen GOT-Satz/);
  assert.match(pet, /offiziellen ARAG|arag\.de\/tierversicherung/);
  assert.match(pkv, /Gesundheitsprüfung/);
  assert.match(pkv, /arag\.de\/private-krankenversicherung/);
  assert.match(imprint, /operator\.registerNumber/);
  assert.match(firstInfo, /operator\.registeredStreet/);
  assert.match(firstInfo, /Beteiligungsverhältnisse/);
  assert.match(privacy, /keine Analyse-, Marketing- oder Profiling-Dienste/);
});

test("includes responsive styles and optimized social/product imagery", async () => {
  const styles = await read("app/globals.css");
  assert.match(styles, /@media \(max-width: 1040px\)/);
  assert.match(styles, /@media \(max-width: 660px\)/);
  assert.match(styles, /prefers-reduced-motion/);

  for (const file of ["public/og.png", "public/tierkrankenschutz24-hero.webp", "public/privatkrankenversicherung24-hero.webp", "public/agapios-papadakis.jpg"]) {
    assert.ok((await stat(new URL(file, root))).size > 10_000, `${file} should be a real image asset`);
  }
});

test("produces a standalone IONOS PHP artifact with extensionless routes", async () => {
  const [config, packageFile, manifest, homeHtml, homePhp, robots, sitemap, htaccess] = await Promise.all([
    read("next.config.ts"),
    read("package.json"),
    read("dist/server/vinext-prerender.json"),
    read("dist/client/index.html"),
    read("dist/client/index.php"),
    read("dist/client/robots.txt"),
    read("dist/client/sitemap.xml"),
    read("dist/client/.htaccess"),
  ]);

  assert.match(config, /output:\s*['"]export['"]/);
  assert.match(config, /unoptimized:\s*true/);
  assert.match(packageFile, /prepare-static-output\.mjs/);
  for (const route of ["/", "/tierkrankenversicherung", "/private-krankenversicherung", "/impressum", "/erstinformation", "/datenschutz"]) {
    assert.match(manifest, new RegExp(`"${route === "/" ? "\\/" : route}"`));
  }
  assert.match(robots, /Sitemap: https:\/\//);
  assert.match(sitemap, /<loc>.*\/tierkrankenversicherung\/<\/loc>/);
  assert.match(htaccess, /RewriteRule \^\(\.\+\?\)\/\?\$ \$1\.html \[L\]/);
  assert.match(htaccess, /DirectoryIndex index\.html index\.php/);
  assert.doesNotMatch(htaccess, /X-Frame-Options|frame-ancestors/);
  assert.doesNotMatch(homeHtml, /ionos_deploy_now_site_url/);
  assert.doesNotMatch(homeHtml, /vinext\.navigationRuntime|<script[^>]+type="module"/);
  assert.equal(homePhp, homeHtml);

  for (const file of ["index.html", "tierkrankenversicherung.html", "private-krankenversicherung.html", "impressum.html", "erstinformation.html", "datenschutz.html", "404.html"]) {
    assert.ok((await stat(new URL(`dist/client/${file}`, root))).size > 1_000, `${file} should be rendered`);
  }
  for (const file of ["tierkrankenversicherung/index.html", "private-krankenversicherung/index.html", "impressum/index.html", "erstinformation/index.html", "datenschutz/index.html"]) {
    assert.ok((await stat(new URL(`dist/client/${file}`, root))).size > 1_000, `${file} should be available as an Apache directory index`);
  }
});
