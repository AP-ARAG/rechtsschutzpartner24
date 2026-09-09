export const operator = {
  brand: "Versicherungsnavigator24",
  name: "Agapios Papadakis",
  qualification: "Hauptgeschäftsstellenleiter ARAG Versicherungen",
  office: "ARAG Hauptgeschäftsstelle Augsburg",
  registeredStreet: "Buchenbergstr. 3f",
  registeredCity: "86420 Diedorf",
  street: "Wankelstraße 2",
  city: "86356 Neusäß",
  phoneDisplay: "0821 509280",
  phoneHref: "+49821509280",
  mobileDisplay: "0173 990 7777",
  mobileHref: "+491739907777",
  email: "info@rechtsschutzpartner24.de",
  directEmail: "Agapios.Papadakis@arag-partner.de",
  registerNumber: "D-05V5-SZ9YK-16",
  profileUrl: "https://www.arag-partner.de/gst-augsburg/",
} as const;

// Deploy Now provides SITE_URL during its build. The fallback keeps local and
// private preview builds valid until the planned primary domain is registered.
export const siteUrl = (process.env.SITE_URL || "https://versicherungsnavigator24.vertrieb180843.chatgpt.site").replace(/\/$/, "");

export const productLinks = [
  { label: "Rechtsschutz", title: "RechtsschutzPartner24", href: "https://rechtsschutzpartner24.de" },
  { label: "Vermieter", title: "Vermieterrechtsschutz24", href: "https://vermieterrechtsschutz24.com" },
  { label: "Tier", title: "Tierkrankenschutz24", href: "/tierkrankenversicherung/" },
  { label: "Private KV", title: "PrivatKrankenversicherung24", href: "/private-krankenversicherung/" },
] as const;

export const domainRecommendations = {
  umbrella: "versicherungsnavigator24.de",
  pet: "tierkrankenschutz24.de",
  privateHealth: "privatkrankenversicherung24.de",
  checkedAt: "7. September 2026",
} as const;
