import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
    assert.match(document, /Buchenbergstr\. 3f/);
    assert.match(document, /86420 Diedorf/);
    assert.match(document, /Wankelstraße 2/);
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
  assert.match(client, /ga-disable-AW-18073108906/);
});
