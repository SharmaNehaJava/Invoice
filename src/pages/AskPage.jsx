import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge, Button, Card, PageHeader, inputClass } from "../components/ui";
import { FINANCE_PROGRAMS, WATCH_LIST } from "../data/catalogData";
import { formatRate } from "../lib/pricing";

const SUGGESTIONS = [
  "What are the current finance rates for dumpers?",
  "What is our policy on consignment insurance?",
  "What is standard PDI on attachments?",
];

// Placeholder answers from local data until a real AI backend is connected.
function answerFor(question) {
  const q = question.toLowerCase();
  if (/(rate|finance|special|bulletin)/.test(q)) {
    return FINANCE_PROGRAMS.map(
      (p) => `${p.name}: ${p.rates.map((r) => formatRate(r.ratePercent, r.months)).join(", ")} (valid to ${p.validTo}).`
    ).join("\n");
  }
  if (/(insurance|consignment)/.test(q)) {
    return WATCH_LIST.find((w) => w.title === "Consignment").text;
  }
  if (q.includes("pdi")) {
    return "PDI is billed at $170/hr. Reversible plates and dumpers default to 1–2 hours ($170–$340). Boxed units: $0.";
  }
  return "I can answer questions about finance bulletins, consignment rules and PDI for now.";
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState("");

  const ask = (q = question) => {
    if (!q.trim()) {
      setError("Type a question first.");
      return;
    }
    setQuestion(q);
    setAnswer({ question: q, text: answerFor(q) });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        description="Ask about bulletins, rates, policies and specs."
        action={<Badge tone="warning">Demo answers</Badge>}
      />

      <Card className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="flex gap-2"
        >
          <label htmlFor="ask" className="sr-only">
            Question
          </label>
          <input
            id="ask"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setError("");
            }}
            placeholder="What's the Avant GT cab rate for 60 months?"
            className={inputClass}
          />
          <Button variant="primary" type="submit">
            <Sparkles size={16} aria-hidden="true" />
            Ask
          </Button>
        </form>
        {error && <p className="mt-1 text-xs text-error">{error}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-text-muted hover:bg-panel-hover hover:text-text-main"
            >
              {s}
            </button>
          ))}
        </div>

        {answer && (
          <div className="mt-4 rounded-lg border border-line bg-subtle p-3">
            <p className="text-xs font-medium text-text-dim">{answer.question}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-text-main">{answer.text}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
