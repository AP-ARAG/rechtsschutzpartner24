const funnelSteps = [
  {
    key: "berufsstatus",
    question: "Wie ist Ihr Berufsstatus?",
    type: "single",
    options: [
      ["Angestellte/r", "assets/berufsstatus/angestellter.png"],
      ["Beamte/r", "assets/berufsstatus/beamter.png"],
      ["Selbstständige/r", "assets/berufsstatus/selbststaendiger.png"],
      ["Student/Schüler", "assets/berufsstatus/student.png"],
      ["Hausfrau/mann", "assets/berufsstatus/hausfrau.png"],
      ["Rentner/in", "assets/berufsstatus/rentner.png"],
      ["Arbeitssuchend", "assets/berufsstatus/arbeitssuchend.png"],
      ["Sonstiges", "assets/berufsstatus/sonstiges.png"]
    ]
  },
  {
    key: "familienstand",
    question: "Wie ist Ihr Familienstand?",
    type: "single",
    options: [
      ["Single ohne Kind", "assets/familienstand/single-ohne-kind.png"],
      ["Single mit Kind/ern", "assets/familienstand/single-mit-kind.png"],
      ["Paar ohne Kind/er", "assets/familienstand/paar-ohne-kind.png"],
      ["Familie mit Kind/ern", "assets/familienstand/familie.png"]
    ]
  },
  {
    key: "bereiche",
    question: "Welche Bereiche wollen Sie absichern?",
    subline: "(Mehrfachauswahl möglich)",
    type: "multiple",
    options: [
      ["Alle/kombi", "assets/bereiche/kombi.png"],
      ["Privat", "assets/bereiche/privat.png"],
      ["Beruf", "assets/bereiche/beruf.png"],
      ["Verkehr", "assets/bereiche/verkehr.png"],
      ["Mietrecht", "assets/bereiche/mietrecht.png"]
    ]
  },
  {
    key: "anschrift",
    question: "Ihre Anschrift",
    fields: [
      ["vorname", "Vorname", "text", "given-name"],
      ["nachname", "Nachname", "text", "family-name"],
      ["plz", "PLZ", "text", "postal-code", "[0-9]{5}"],
      ["ort", "Ort", "text", "address-level2"],
      ["strasse", "Straße", "text", "street-address"],
      ["hausnummer", "Hausnummer", "text", "address-line2"]
    ]
  },
  {
    key: "geburt",
    question: "Wann sind Sie geboren?",
    birthdate: true
  },
  {
    key: "kontakt",
    question: "Kontaktdaten",
    fields: [
      ["email", "E-Mail-Adresse", "email", "email"],
      ["telefon", "Telefonnummer", "tel", "tel"]
    ],
    submit: true
  }
];

const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function attributionUrl(value, includePath = false) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return "";
    return url.origin + (includePath ? url.pathname : "");
  } catch { return ""; }
}

function readLeadAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    ...Object.fromEntries(attributionKeys.map((key) => [key, (params.get(key) || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200)])),
    source_url: attributionUrl(window.location.href, true),
    referrer_url: attributionUrl(document.referrer)
  };
}

function emitLeadConversion(formId, attribution) {
  const consent = currentConsent();
  if (!consent || (!consent.analytics && !consent.marketing)) return;
  const detail = {
    event: "insurance_lead_success",
    lead_type: "rechtsschutz",
    form_id: formId,
    keyword: attribution.utm_term,
    campaign: attribution.utm_campaign,
    source: attribution.utm_source
  };
  try {
    window.dispatchEvent(new CustomEvent("insurance:lead-success", { detail }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);
    const destinations = [];
    if (consent.analytics) destinations.push(analyticsId);
    if (consent.marketing) destinations.push(marketingId);
    window.gtag?.("event", "generate_lead", {
      send_to: destinations,
      form_id: formId,
      campaign: attribution.utm_campaign,
      term: attribution.utm_term
    });
  } catch (error) {
    console.warn("Lead-Tracking konnte nicht ausgelöst werden.", error);
  }
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function setupFunnel(funnelRoot) {
let currentStep = 0;
const funnelId = (funnelRoot.dataset.funnelId || "rechtsschutz-lead-submit").replace(/[^a-z0-9_-]/gi, "-");
const formData = { bereiche: [] };
const birthParts = { day: "", month: "", year: "" };
let birthAdvanceTimer = null;
const funnelStartedAt = Date.now();
const funnelContent = funnelRoot.querySelector(".funnel-content");
const funnelActions = funnelRoot.querySelector(".funnel-actions");
const formStatus = funnelRoot.querySelector(".form-status");
const stepLabel = funnelRoot.querySelector(".step-label");
const progressBar = funnelRoot.querySelector(".progress-bar");
const funnelForm = funnelRoot.querySelector(".funnel-form");
if (!funnelContent || !funnelActions || !formStatus || !stepLabel || !progressBar || !funnelForm) return;

function renderFunnel() {
  const step = funnelSteps[currentStep];
  formStatus.textContent = "";
  stepLabel.textContent = `Schritt ${currentStep + 1} von ${funnelSteps.length}`;
  progressBar.style.width = `${((currentStep + 1) / funnelSteps.length) * 100}%`;

  let html = `<h2 class="question">${escapeHtml(step.question)}</h2>`;
  if (step.subline) html += `<p class="question-sub">${escapeHtml(step.subline)}</p>`;

  if (step.options) {
    const isCompact = currentStep > 0;
    const isAreas = step.key === "bereiche";
    html += `<div class="option-grid${isCompact ? " compact" : ""}${isAreas ? " areas" : ""}">`;
    html += step.options.map(([label, asset]) => {
      const selected = step.type === "multiple"
        ? formData.bereiche.includes(label)
        : formData[step.key] === label;
      const visual = asset.endsWith(".png")
        ? `<img src="${asset}" alt="" width="83" height="83">`
        : `<span class="option-symbol" aria-hidden="true">${escapeHtml(asset)}</span>`;
      return `<button class="option${selected ? " selected" : ""}" type="button" data-value="${escapeHtml(label)}" aria-pressed="${selected}">${visual}<span>${escapeHtml(label)}</span></button>`;
    }).join("");
    html += "</div>";
  }

  if (step.birthdate) {
    html += '<fieldset class="birthdate-fields"><legend>Geburtsdatum</legend>';
    html += `<label class="birthdate-field"><span>Tag</span><input name="geburtstag" type="text" value="${escapeHtml(birthParts.day)}" placeholder="TT" inputmode="numeric" autocomplete="bday-day" pattern="[0-9]{2}" minlength="2" maxlength="2" aria-label="Geburtstag, zweistellig" required></label>`;
    html += `<label class="birthdate-field"><span>Monat</span><input name="geburtsmonat" type="text" value="${escapeHtml(birthParts.month)}" placeholder="MM" inputmode="numeric" autocomplete="bday-month" pattern="[0-9]{2}" minlength="2" maxlength="2" aria-label="Geburtsmonat, zweistellig" required></label>`;
    html += `<label class="birthdate-field year"><span>Jahr</span><input name="geburtsjahr" type="text" value="${escapeHtml(birthParts.year)}" placeholder="JJJJ" inputmode="numeric" autocomplete="bday-year" pattern="[0-9]{4}" minlength="4" maxlength="4" aria-label="Geburtsjahr, vierstellig" required></label>`;
    html += "</fieldset>";
  }

  if (step.fields) {
    html += '<div class="form-fields">';
    html += step.fields.map(([name, label, type, autocomplete, pattern]) => {
      const fullClass = step.fields.length === 1 ? " full" : "";
      const value = formData[name] || "";
      return `<label class="field${fullClass}"><span>${escapeHtml(label)}</span><input name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(label)}" autocomplete="${autocomplete}"${pattern ? ` pattern="${pattern}"` : ""} required></label>`;
    }).join("");
    if (step.submit) {
      html += '<label class="honeypot" aria-hidden="true">Bitte nicht ausfüllen<input name="website" type="text" tabindex="-1" autocomplete="off"></label>';
      html += '<label class="consent"><input name="datenschutz_bestaetigt" type="checkbox" required aria-required="true"><span><a href="datenschutz.html" target="_blank" rel="noopener noreferrer">Datenschutz</a> zur Kenntnis genommen.</span></label>';
      html += '<label class="consent"><input name="erstinformation_digital" type="checkbox" required aria-required="true"><span>Digitaler <a href="erstinformation.html" target="_blank" rel="noopener noreferrer">Erstinformation</a> ausdrücklich zugestimmt.</span></label>';
    }
    html += "</div>";
  }

  funnelContent.innerHTML = html;
  funnelActions.innerHTML = "";
  if (currentStep > 0) {
    funnelActions.insertAdjacentHTML("beforeend", '<button class="funnel-button secondary" type="button" data-funnel-action="back">‹ Zurück</button>');
  }
  const label = step.submit ? "Anfrage senden ›" : "Weiter ›";
  const conversionAttributes = step.submit ? ` id="${funnelId}" data-conversion="insurance-lead"` : "";
  funnelActions.insertAdjacentHTML("beforeend", `<button class="funnel-button primary" type="button" data-funnel-action="next"${conversionAttributes}>${label}</button>`);

  funnelContent.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => selectOption(step, button.dataset.value));
  });
  if (step.birthdate) bindBirthdateFields();
  const privacyCheckbox = funnelContent.querySelector('[name="datenschutz_bestaetigt"]');
  const firstInfoCheckbox = funnelContent.querySelector('[name="erstinformation_digital"]');
  [privacyCheckbox, firstInfoCheckbox].forEach((checkbox) => checkbox?.addEventListener("change", () => {
    if (checkbox.checked) {
      checkbox.closest(".consent")?.classList.remove("invalid");
      formStatus.textContent = "";
    }
  }));
  funnelActions.querySelector('[data-funnel-action="back"]')?.addEventListener("click", goBack);
  funnelActions.querySelector('[data-funnel-action="next"]')?.addEventListener("click", goNext);
}

function bindBirthdateFields() {
  const inputs = [
    funnelContent.querySelector('[name="geburtstag"]'),
    funnelContent.querySelector('[name="geburtsmonat"]'),
    funnelContent.querySelector('[name="geburtsjahr"]')
  ];
  const keys = ["day", "month", "year"];

  inputs.forEach((input, index) => {
    if (!input) return;
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, Number(input.maxLength));
      birthParts[keys[index]] = input.value;
      delete formData.geburtsdatum;
      formStatus.textContent = "";
      inputs.forEach((field) => field?.removeAttribute("aria-invalid"));

      if (input.value.length === Number(input.maxLength)) {
        if (inputs[index + 1]) {
          inputs[index + 1].focus();
          inputs[index + 1].select();
        } else {
          scheduleBirthdateAdvance();
        }
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && input.value === "" && inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    });
  });

  inputs[0]?.addEventListener("paste", (event) => {
    const digits = event.clipboardData?.getData("text").replace(/\D/g, "") || "";
    if (digits.length !== 8) return;
    event.preventDefault();
    birthParts.day = digits.slice(0, 2);
    birthParts.month = digits.slice(2, 4);
    birthParts.year = digits.slice(4, 8);
    inputs[0].value = birthParts.day;
    inputs[1].value = birthParts.month;
    inputs[2].value = birthParts.year;
    inputs[2].focus();
    delete formData.geburtsdatum;
    scheduleBirthdateAdvance();
  });
}

function scheduleBirthdateAdvance() {
  window.clearTimeout(birthAdvanceTimer);
  birthAdvanceTimer = window.setTimeout(() => {
    if (!funnelSteps[currentStep]?.birthdate || !collectBirthdate()) return;
    currentStep += 1;
    renderFunnel();
    window.setTimeout(() => funnelContent.querySelector('[name="email"]')?.focus(), 0);
  }, 120);
}

function collectBirthdate() {
  const inputs = {
    day: funnelContent.querySelector('[name="geburtstag"]'),
    month: funnelContent.querySelector('[name="geburtsmonat"]'),
    year: funnelContent.querySelector('[name="geburtsjahr"]')
  };

  Object.entries(inputs).forEach(([key, input]) => {
    if (input) birthParts[key] = input.value.replace(/\D/g, "");
  });

  const complete = birthParts.day.length === 2
    && birthParts.month.length === 2
    && birthParts.year.length === 4;
  if (!complete) {
    const firstIncomplete = Object.entries(inputs).find(([key]) => (
      birthParts[key].length !== (key === "year" ? 4 : 2)
    ))?.[1];
    firstIncomplete?.setAttribute("aria-invalid", "true");
    firstIncomplete?.focus();
    formStatus.textContent = "Bitte geben Sie Tag, Monat und Jahr vollständig an.";
    return false;
  }

  const day = Number(birthParts.day);
  const month = Number(birthParts.month);
  const year = Number(birthParts.year);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latestAdultBirthDate = new Date(today);
  latestAdultBirthDate.setFullYear(latestAdultBirthDate.getFullYear() - 18);
  const validDate = birthDate.getFullYear() === year
    && birthDate.getMonth() === month - 1
    && birthDate.getDate() === day
    && birthDate <= latestAdultBirthDate;

  if (!validDate) {
    Object.values(inputs).forEach((input) => input?.setAttribute("aria-invalid", "true"));
    inputs.day?.focus();
    formStatus.textContent = "Das Formular kann nur von volljährigen Personen verwendet werden. Bitte prüfen Sie Ihr Geburtsdatum.";
    return false;
  }

  Object.values(inputs).forEach((input) => input?.removeAttribute("aria-invalid"));
  formData.geburtsdatum = `${birthParts.year}-${birthParts.month}-${birthParts.day}`;
  return true;
}

function selectOption(step, value) {
  if (step.type === "multiple") {
    if (value === "Alle/kombi") {
      formData.bereiche = [value];
      currentStep += 1;
      renderFunnel();
      return;
    } else {
      formData.bereiche = formData.bereiche.filter((item) => item !== "Alle/kombi");
      formData.bereiche = formData.bereiche.includes(value)
        ? formData.bereiche.filter((item) => item !== value)
        : [...formData.bereiche, value];
    }
    renderFunnel();
    return;
  }
  formData[step.key] = value;
  if (currentStep < 2) {
    currentStep += 1;
    renderFunnel();
  }
}

function collectFields(step) {
  if (step.birthdate) return collectBirthdate();
  const inputs = [...funnelContent.querySelectorAll("input")];
  let valid = true;
  inputs.forEach((input) => {
    if (input.name === "website" || input.type === "checkbox") return;
    if (!input.checkValidity()) {
      input.reportValidity();
      valid = false;
      return;
    }
    if (input.type !== "checkbox") formData[input.name] = input.value.trim();
  });
  if (!valid) return false;

  return true;
}

function goBack() {
  const step = funnelSteps[currentStep];
  if (step.birthdate) {
    birthParts.day = funnelContent.querySelector('[name="geburtstag"]')?.value || "";
    birthParts.month = funnelContent.querySelector('[name="geburtsmonat"]')?.value || "";
    birthParts.year = funnelContent.querySelector('[name="geburtsjahr"]')?.value || "";
  } else if (step.fields) {
    funnelContent.querySelectorAll("input").forEach((input) => {
      if (input.name && input.type !== "checkbox" && input.name !== "website") {
        formData[input.name] = input.value.trim();
      }
    });
  }
  currentStep = Math.max(0, currentStep - 1);
  renderFunnel();
}

async function goNext() {
  const step = funnelSteps[currentStep];
  if (step.type === "single" && !formData[step.key]) {
    formStatus.textContent = "Bitte wählen Sie eine Option aus.";
    return;
  }
  if (step.type === "multiple" && formData.bereiche.length === 0) {
    formStatus.textContent = "Bitte wählen Sie mindestens einen Bereich aus.";
    return;
  }
  if ((step.fields || step.birthdate) && !collectFields(step)) return;
  if (!step.submit) {
    currentStep += 1;
    renderFunnel();
    return;
  }
  await submitRequest();
}

async function submitRequest() {
  const submitButton = funnelActions.querySelector('[data-funnel-action="next"]');
  const privacyCheckbox = funnelContent.querySelector('[name="datenschutz_bestaetigt"]');
  const firstInfoCheckbox = funnelContent.querySelector('[name="erstinformation_digital"]');
  const privacyLabel = privacyCheckbox?.closest(".consent");
  const honeypot = funnelContent.querySelector('[name="website"]');
  if (!privacyCheckbox?.checked) {
    privacyLabel?.classList.add("invalid");
    formStatus.textContent = "Bitte Datenschutz bestätigen.";
    privacyCheckbox?.focus();
    privacyCheckbox?.reportValidity();
    return;
  }
  privacyLabel?.classList.remove("invalid");
  if (!firstInfoCheckbox?.checked) {
    firstInfoCheckbox?.closest(".consent")?.classList.add("invalid");
    formStatus.textContent = "Bitte stimmen Sie der digitalen Bereitstellung der Erstinformation zu oder fordern Sie diese vorab auf Papier an.";
    firstInfoCheckbox?.focus();
    firstInfoCheckbox?.reportValidity();
    return;
  }
  firstInfoCheckbox.closest(".consent")?.classList.remove("invalid");

  submitButton.disabled = true;
  submitButton.textContent = "Wird gesendet …";
  formStatus.textContent = "";

  const payload = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    payload.append(key, Array.isArray(value) ? value.join(", ") : value);
  });
  payload.append("website", honeypot?.value || "");
  payload.append("datenschutz_bestaetigt", "ja");
  payload.append("erstinformation_digital", "ja");
  payload.append("started_at", String(funnelStartedAt));
  payload.append("funnel_id", funnelId);
  const attribution = readLeadAttribution();
  Object.entries(attribution).forEach(([key, value]) => payload.append(key, value));

  try {
    const response = await fetch(funnelForm.action, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || "Übermittlung fehlgeschlagen");
    emitLeadConversion(funnelId, attribution);
    funnelContent.innerHTML = '<div class="success"><span class="success-mark">✓</span><h3>Vielen Dank für Ihre Anfrage!</h3><p>Ihre Angaben wurden sicher übermittelt. Ein Rechtsschutzexperte meldet sich zeitnah bei Ihnen.</p></div>';
    funnelActions.innerHTML = '<button class="funnel-button secondary" type="button" data-funnel-action="restart">Neue Anfrage</button>';
    funnelActions.querySelector('[data-funnel-action="restart"]').addEventListener("click", resetFunnel);
    stepLabel.textContent = "Anfrage gesendet";
    progressBar.style.width = "100%";
  } catch (error) {
    formStatus.innerHTML = 'Die Anfrage konnte gerade nicht gesendet werden. Bitte rufen Sie uns unter <a href="tel:+491739907777">0173 990 7777</a> an oder schreiben Sie an <a href="mailto:info@rechtsschutzpartner24.de">info@rechtsschutzpartner24.de</a>.';
    submitButton.disabled = false;
    submitButton.textContent = "Erneut versuchen ›";
  }
}

function resetFunnel() {
  Object.keys(formData).forEach((key) => delete formData[key]);
  formData.bereiche = [];
  birthParts.day = "";
  birthParts.month = "";
  birthParts.year = "";
  window.clearTimeout(birthAdvanceTimer);
  currentStep = 0;
  renderFunnel();
}

funnelForm.addEventListener("submit", (event) => event.preventDefault());
renderFunnel();
}

document.querySelectorAll("[data-funnel]").forEach(setupFunnel);

// Only this consent version is accepted; legacy blanket choices require a new choice.
const consentKey = "rsp24-cookie-consent";
const consentVersion = "2026-10-16.1";
const consentLifetime = 180 * 24 * 60 * 60 * 1000;
const analyticsId = "G-L0TL2D4CVW";
const marketingId = "AW-18073108906";
const cookieBanner = document.getElementById("cookieBanner");
const cookieSettings = document.getElementById("cookieSettings");
const acceptCookies = document.getElementById("acceptCookies");
const rejectCookies = document.getElementById("rejectCookies");
const saveCookies = document.getElementById("saveCookies");
const analyticsChoice = document.getElementById("analyticsCookies");
const marketingChoice = document.getElementById("marketingCookies");
let consentState = null;
let consentExpiryTimer;
let tagLoaded = false;
let configuredAnalytics = false;
let configuredMarketing = false;
let previousFocus;

function parseConsent(value) {
  try {
    const record = JSON.parse(value);
    const now = Date.now();
    if (!record || record.version !== consentVersion ||
        typeof record.analytics !== "boolean" || typeof record.marketing !== "boolean" ||
        !Number.isFinite(record.updatedAt) || !Number.isFinite(record.expiresAt) ||
        record.updatedAt > now || record.expiresAt <= now ||
        record.expiresAt <= record.updatedAt || record.expiresAt - record.updatedAt > consentLifetime) return null;
    return { version: consentVersion, analytics: record.analytics, marketing: record.marketing,
      updatedAt: record.updatedAt, expiresAt: record.expiresAt };
  } catch { return null; }
}

function currentConsent() {
  if (consentState && !parseConsent(JSON.stringify(consentState))) expireConsent();
  return consentState;
}

function clearTrackingCookies(choice = { analytics: false, marketing: false }) {
  const hostname = window.location.hostname;
  const domains = new Set(["", hostname, `.${hostname}`]);
  if (hostname === "rechtsschutzpartner24.de" || hostname.endsWith(".rechtsschutzpartner24.de")) {
    domains.add("rechtsschutzpartner24.de");
    domains.add(".rechtsschutzpartner24.de");
  }
  const paths = new Set(["/"]);
  let path = "";
  window.location.pathname.split("/").filter(Boolean).forEach((part) => {
    path += `/${part}`;
    paths.add(path);
    paths.add(`${path}/`);
  });
  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0].trim();
    const analyticsCookie = /^_(ga|gid|gat)(_|$)/.test(name);
    const marketingCookie = /^_(gcl|gac)(_|$)/.test(name);
    if ((!choice.analytics && analyticsCookie) || (!choice.marketing && marketingCookie)) {
      domains.forEach((domain) => paths.forEach((cookiePath) => {
        document.cookie = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${cookiePath}; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
      }));
    }
  });
}

function setTagPermissions(choice) {
  window[`ga-disable-${analyticsId}`] = !choice.analytics;
  window[`ga-disable-${marketingId}`] = !choice.marketing;
}

function consentPermissions(choice) {
  return {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied"
  };
}

function applyConsent(choice) {
  setTagPermissions(choice);
  clearTrackingCookies(choice);
  if (!choice.analytics && !choice.marketing) return;
  if (!tagLoaded) {
    // Basic consent: no Google library or ping is loaded before a positive choice.
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"
    });
    window.gtag("set", "ads_data_redaction", true);
    window.gtag("set", "url_passthrough", false);
    window.gtag("consent", "update", consentPermissions(choice));
    window.gtag("js", new Date());
    const script = document.createElement("script");
    script.async = true;
    script.dataset.rspConsentTag = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${choice.analytics ? analyticsId : marketingId}`;
    document.head.appendChild(script);
    tagLoaded = true;
  } else {
    window.gtag("consent", "update", consentPermissions(choice));
  }
  if (choice.analytics && !configuredAnalytics) {
    window.gtag("config", analyticsId, { anonymize_ip: true });
    configuredAnalytics = true;
  }
  if (choice.marketing && !configuredMarketing) {
    window.gtag("config", marketingId);
    configuredMarketing = true;
  }
}

function scheduleConsentExpiry() {
  window.clearTimeout(consentExpiryTimer);
  if (!consentState) return;
  consentExpiryTimer = window.setTimeout(() => {
    if (currentConsent()) scheduleConsentExpiry();
  }, Math.min(consentState.expiresAt - Date.now(), 2147483647));
}

function stopLoadedTags() {
  // Removing a script element cannot unload an already running vendor library.
  // Reload with the saved reduced choice to stop that library for this document.
  setTagPermissions({ analytics: false, marketing: false });
  document.querySelectorAll("script[data-rsp-consent-tag]").forEach((script) => script.remove());
  if (tagLoaded) window.location.reload();
}

function expireConsent() {
  consentState = null;
  window.clearTimeout(consentExpiryTimer);
  try { localStorage.removeItem(consentKey); } catch { /* No persistent storage available. */ }
  clearTrackingCookies();
  setTagPermissions({ analytics: false, marketing: false });
  if (tagLoaded) stopLoadedTags();
  else openCookieBanner();
}

function openCookieBanner() {
  if (!cookieBanner) return;
  previousFocus = document.activeElement;
  const choice = currentConsent();
  analyticsChoice.checked = choice?.analytics === true;
  marketingChoice.checked = choice?.marketing === true;
  cookieBanner.hidden = false;
  document.body.classList.add("modal-open");
  acceptCookies.focus();
}

function closeCookieBanner() {
  cookieBanner.hidden = true;
  document.body.classList.remove("modal-open");
  previousFocus?.focus?.();
}

function saveConsent(choice) {
  const previous = currentConsent();
  const now = Date.now();
  consentState = { version: consentVersion, analytics: choice.analytics === true,
    marketing: choice.marketing === true, updatedAt: now, expiresAt: now + consentLifetime };
  try { localStorage.setItem(consentKey, JSON.stringify(consentState)); } catch { /* This choice applies to the current page only. */ }
  closeCookieBanner();
  scheduleConsentExpiry();
  clearTrackingCookies(consentState);
  const reduced = previous && ((previous.analytics && !consentState.analytics) || (previous.marketing && !consentState.marketing));
  if (reduced && tagLoaded) stopLoadedTags();
  else applyConsent(consentState);
}

acceptCookies?.addEventListener("click", () => saveConsent({ analytics: true, marketing: true }));
rejectCookies?.addEventListener("click", () => saveConsent({ analytics: false, marketing: false }));
saveCookies?.addEventListener("click", () => saveConsent({ analytics: analyticsChoice.checked, marketing: marketingChoice.checked }));
cookieSettings?.addEventListener("click", openCookieBanner);
document.addEventListener("keydown", (event) => {
  if (!cookieBanner || cookieBanner.hidden) return;
  if (event.key === "Escape") closeCookieBanner();
  if (event.key === "Tab") {
    const focusable = [...cookieBanner.querySelectorAll("button, input, a[href]")].filter((element) => !element.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener("storage", (event) => {
  if (event.key !== consentKey && event.key !== null) return;
  const previous = consentState;
  const next = parseConsent(event.newValue);
  consentState = next;
  if (!next) { expireConsent(); return; }
  scheduleConsentExpiry();
  const reduced = previous && ((previous.analytics && !next.analytics) || (previous.marketing && !next.marketing));
  clearTrackingCookies(next);
  if (reduced && tagLoaded) stopLoadedTags();
  else applyConsent(next);
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) currentConsent(); });
try { consentState = parseConsent(localStorage.getItem(consentKey)); } catch { /* Start without optional services. */ }
if (consentState) { applyConsent(consentState); scheduleConsentExpiry(); }
else {
  clearTrackingCookies();
  setTagPermissions({ analytics: false, marketing: false });
  window.setTimeout(openCookieBanner, 500);
}
