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

const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "msclkid", "fbclid"];

function readLeadAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    ...Object.fromEntries(attributionKeys.map((key) => [key, params.get(key)?.trim() || ""])),
    source_url: window.location.href,
    referrer_url: document.referrer
  };
}

function emitLeadConversion(formId, attribution) {
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
    if (localStorage.getItem("rsp24-cookie-consent") === "all") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(detail);
      window.gtag?.("event", "generate_lead", {
        form_id: formId,
        campaign: attribution.utm_campaign,
        term: attribution.utm_term
      });
    }
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

const cookieBanner = document.getElementById("cookieBanner");
const cookieSettings = document.getElementById("cookieSettings");
const acceptCookies = document.getElementById("acceptCookies");
const rejectCookies = document.getElementById("rejectCookies");
const consentKey = "rsp24-cookie-consent";

function openCookieBanner() {
  cookieBanner.hidden = false;
  document.body.classList.add("modal-open");
  acceptCookies.focus();
}

function closeCookieBanner() {
  cookieBanner.hidden = true;
  document.body.classList.remove("modal-open");
}

function saveConsent(value) {
  localStorage.setItem(consentKey, value);
  closeCookieBanner();
  if (value === "all") loadAnalytics();
  if (value === "necessary") disableAnalytics();
}

function loadAnalytics() {
  if (window.gtag) return;
  window["ga-disable-G-L0TL2D4CVW"] = false;
  window["ga-disable-AW-18073108906"] = false;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-L0TL2D4CVW";
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(){ window.dataLayer.push(arguments); };
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted"
  });
  window.gtag("js", new Date());
  window.gtag("config", "G-L0TL2D4CVW", { anonymize_ip: true });
  window.gtag("config", "AW-18073108906");
}

function disableAnalytics() {
  window["ga-disable-G-L0TL2D4CVW"] = true;
  window["ga-disable-AW-18073108906"] = true;
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0].trim();
    if (name.startsWith("_ga") || name.startsWith("_gcl")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  });
}

acceptCookies.addEventListener("click", () => saveConsent("all"));
rejectCookies.addEventListener("click", () => saveConsent("necessary"));
cookieSettings.addEventListener("click", openCookieBanner);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cookieBanner.hidden) closeCookieBanner();
});

const savedConsent = localStorage.getItem(consentKey);
if (savedConsent === "all") loadAnalytics();
if (savedConsent === "necessary") disableAnalytics();
if (!savedConsent) window.setTimeout(openCookieBanner, 500);
