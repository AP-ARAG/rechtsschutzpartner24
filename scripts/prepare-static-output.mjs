import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const outputDirectory = new URL("../dist/client/", import.meta.url);
const siteUrl = (process.env.SITE_URL || "https://versicherungsnavigator24.vertrieb180843.chatgpt.site").replace(/\/$/, "");
const routes = [
  ["/", "weekly", "1.0"],
  ["/tierkrankenversicherung/", "monthly", "0.9"],
  ["/private-krankenversicherung/", "monthly", "0.9"],
  ["/impressum/", "yearly", "0.2"],
  ["/erstinformation/", "yearly", "0.2"],
  ["/datenschutz/", "yearly", "0.2"],
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([route, frequency, priority]) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>
    <lastmod>2026-09-07</lastmod>
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const htaccess = `Options -Indexes
DirectoryIndex index.php index.html
ErrorDocument 404 /404.html

<IfModule mod_negotiation.c>
  Options -MultiViews
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{DOCUMENT_ROOT}/$1.html -f
  RewriteRule ^(.+?)/?$ $1.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
`;

// Vinext's static HTML currently ships a client-side RSC runtime that tries to
// open a server connection after the page has loaded. IONOS Static/PHP hosting
// has no RSC server, so that connection failure replaces otherwise complete
// prerendered HTML with an error screen. Keep the server-rendered document and
// structured data, but remove the framework bootstrap and module preloads.
const makeStandaloneHtml = (html) => html
  .replace(/<link\b[^>]*\brel=(?:"|')modulepreload(?:"|')[^>]*>/gi, "")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (tag) => (
    /<script\b[^>]*\btype=(?:"|')application\/ld\+json(?:"|')/i.test(tag) ? tag : ""
  ));

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(new URL("robots.txt", outputDirectory), robots),
  writeFile(new URL("sitemap.xml", outputDirectory), sitemap),
  writeFile(new URL(".htaccess", outputDirectory), htaccess),
]);

// IONOS enables content negotiation, which sees both route.html and route.rsc
// and otherwise answers extensionless URLs with HTTP 300. Real route
// directories make Apache serve an unambiguous index.html instead.
await Promise.all(routes.filter(([route]) => route !== "/").map(async ([route]) => {
  const slug = route.slice(1, -1);
  const routeDirectory = new URL(`${slug}/`, outputDirectory);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(new URL(`${slug}.html`, outputDirectory), new URL("index.html", routeDirectory));
}));

const htmlFiles = [
  new URL("index.html", outputDirectory),
  new URL("404.html", outputDirectory),
  ...routes.filter(([route]) => route !== "/").flatMap(([route]) => {
    const slug = route.slice(1, -1);
    return [new URL(`${slug}.html`, outputDirectory), new URL(`${slug}/index.html`, outputDirectory)];
  }),
];
await Promise.all(htmlFiles.map(async (file) => {
  const html = await readFile(file, "utf8");
  await writeFile(file, makeStandaloneHtml(html));
}));

// The umbrella site is intentionally deployed with the IONOS PHP package.
// Its front page does not need dynamic PHP, but an index.php entry point keeps
// the hosting type explicit while preserving the exact approved design.
await copyFile(new URL("index.html", outputDirectory), new URL("index.php", outputDirectory));

// URL parsing lowercases hostnames in generated metadata. Deploy Now replaces
// only its uppercase marker after retrieving the artifact, so normalize it in
// every text asset before upload.
if (siteUrl === "https://IONOS_DEPLOY_NOW_SITE_URL") {
  const textExtensions = new Set([".css", ".html", ".js", ".json", ".rsc", ".svg", ".txt", ".xml"]);
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      const target = new URL(entry.name, directory);
      if (entry.isDirectory()) return visit(new URL(`${entry.name}/`, directory));
      if (![...textExtensions].some((extension) => entry.name.endsWith(extension))) return;
      const content = await readFile(target, "utf8");
      const normalized = content.replaceAll("https://ionos_deploy_now_site_url", siteUrl);
      if (normalized !== content) await writeFile(target, normalized);
    }));
  };
  await visit(outputDirectory);
}
