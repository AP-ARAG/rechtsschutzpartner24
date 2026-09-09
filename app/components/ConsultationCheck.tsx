"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ProductKind = "pet" | "pkv";
type Answer = { label: string; value: string };
type Question = { title: string; help: string; answers: Answer[] };

const questions: Record<ProductKind, Question[]> = {
  pet: [
    {
      title: "Wen möchten Sie absichern?",
      help: "Der Schutz wird passend zu Tierart, Alter und gewünschtem Umfang eingeordnet.",
      answers: [
        { label: "Hund", value: "Hund" },
        { label: "Katze", value: "Katze" },
        { label: "Hund und Katze", value: "Hund und Katze" },
      ],
    },
    {
      title: "Welche Richtung interessiert Sie?",
      help: "Noch unsicher? Dann wählen Sie die persönliche Orientierung.",
      answers: [
        { label: "OP-Schutz", value: "OP-Schutz" },
        { label: "Krankenvollschutz", value: "Krankenvollschutz" },
        { label: "Bitte beraten", value: "Beratung zum Umfang" },
      ],
    },
    {
      title: "Wie alt ist Ihr Tier ungefähr?",
      help: "Eine grobe Einordnung genügt. Gesundheitsdaten werden hier nicht abgefragt.",
      answers: [
        { label: "Unter 1 Jahr", value: "unter 1 Jahr" },
        { label: "1 bis 5 Jahre", value: "1 bis 5 Jahre" },
        { label: "Über 5 Jahre", value: "über 5 Jahre" },
      ],
    },
  ],
  pkv: [
    {
      title: "Welche berufliche Situation trifft zu?",
      help: "Die Zugangsvoraussetzungen unterscheiden sich je nach Status.",
      answers: [
        { label: "Angestellt", value: "angestellt" },
        { label: "Selbstständig", value: "selbstständig" },
        { label: "Beamte / Beihilfe", value: "Beamte oder Beihilfe" },
        { label: "Studium", value: "Studium" },
      ],
    },
    {
      title: "Was ist Ihnen besonders wichtig?",
      help: "Die Auswahl dient nur der Vorbereitung Ihrer persönlichen Beratung.",
      answers: [
        { label: "Starke ambulante Leistungen", value: "ambulante Leistungen" },
        { label: "Top-Schutz im Krankenhaus", value: "stationäre Leistungen" },
        { label: "Hochwertiger Zahnschutz", value: "Zahnleistungen" },
        { label: "Beitrag im Blick", value: "ausgewogenes Preis-Leistungs-Verhältnis" },
      ],
    },
    {
      title: "Wie möchten Sie starten?",
      help: "Sie entscheiden, ob wir zuerst allgemein orientieren oder direkt Leistungen vergleichen.",
      answers: [
        { label: "Grundlagen klären", value: "Grundlagenberatung" },
        { label: "Tarife vergleichen", value: "Leistungsvergleich" },
        { label: "Wechsel prüfen", value: "Wechselprüfung" },
      ],
    },
  ],
};

export function ConsultationCheck({ kind }: { kind: ProductKind }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const current = questions[kind][step];
  const done = step >= questions[kind].length;
  const productName = kind === "pet" ? "Tierkrankenschutz" : "private Krankenversicherung";
  const subject = encodeURIComponent(`Beratungswunsch: ${productName}`);
  const body = useMemo(() => encodeURIComponent(
    `Guten Tag Herr Papadakis,\n\nich interessiere mich für ${productName}.\n\nMeine unverbindliche Vorauswahl:\n- ${answers.join("\n- ")}\n\nBitte melden Sie sich bei mir.\n`
  ), [answers, productName]);

  function choose(value: string) {
    setAnswers((existing) => [...existing.slice(0, step), value]);
    setStep((valueNow) => valueNow + 1);
  }

  function back() {
    setStep((valueNow) => Math.max(0, valueNow - 1));
  }

  function reset() {
    setAnswers([]);
    setStep(0);
  }

  return (
    <div className="consultation-check">
      {!done ? (
        <>
          <div className="check-progress">
            <span>Schritt {step + 1} von {questions[kind].length}</span>
            <span aria-hidden="true"><i style={{ width: `${((step + 1) / questions[kind].length) * 100}%` }} /></span>
          </div>
          <h3>{current.title}</h3>
          <p>{current.help}</p>
          <div className="answer-grid">
            {current.answers.map((answer) => (
              <Button className="answer-button" key={answer.value} onClick={() => choose(answer.value)}>{answer.label}</Button>
            ))}
          </div>
          {step > 0 && <button className="text-button" type="button" onClick={back}>← Zurück</button>}
        </>
      ) : (
        <div className="check-result" aria-live="polite">
          <span className="result-mark" aria-hidden="true">✓</span>
          <p className="eyebrow">Vorauswahl abgeschlossen</p>
          <h3>Ihre Beratung kann gezielt starten.</h3>
          <p>Sie haben ausgewählt: <strong>{answers.join(" · ")}</strong>. Ihre Angaben wurden nicht gespeichert oder übertragen.</p>
          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:info@rechtsschutzpartner24.de?subject=${subject}&body=${body}`}>Auswahl per E-Mail senden</a>
            <a className="button button-secondary" href="tel:+49821509280">Jetzt anrufen</a>
          </div>
          <button className="text-button" type="button" onClick={reset}>Neue Auswahl starten</button>
        </div>
      )}
    </div>
  );
}
