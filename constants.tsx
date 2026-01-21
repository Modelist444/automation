
import { ScriptSection } from './types';

export const SCRIPT_DATA: ScriptSection[] = [
  { timeframe: "0–5s", label: "Hook", text: "The Bible mentions giants… but it never explains where they came from." },
  { timeframe: "5–12s", label: "Disruption", text: "That story was written down — then removed from the Bible." },
  { timeframe: "12–22s", label: "Forbidden Knowledge", text: "Ancient texts describe angels called Watchers descending to Earth, teaching forbidden knowledge, and fathering children with human women." },
  { timeframe: "22–32s", label: "Escalation", text: "Those children became the Nephilim — giants said to devour the Earth, spill blood without restraint, and corrupt humanity beyond repair." },
  { timeframe: "32–45s", label: "The Flood Reframe", text: "According to these banned writings, the Great Flood wasn’t just punishment for sin… it was an eradication." },
  { timeframe: "45–55s", label: "Mystery", text: "The giants were destroyed — but the texts claim their spirits remained." },
  { timeframe: "55–60s", label: "Promise", text: "So why were these books excluded from the Bible? And what didn’t they want preserved?" }
];

export const FULL_SCRIPT = SCRIPT_DATA.map(s => s.text).join('\n\n');
