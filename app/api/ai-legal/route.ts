import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LegalResponse {
  category: string;
  guidance: string;
  sections: string[];
  authority: string;
  nextSteps: string[];
  disclaimer: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS: (keyof LegalResponse)[] = [
  'category',
  'guidance',
  'sections',
  'authority',
  'nextSteps',
  'disclaimer',
];

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond entirely in English.',
  hi: 'Respond entirely in Hindi (हिंदी में उत्तर दें). Every string value inside the JSON must be written in Hindi.',
  te: 'Respond entirely in Telugu (తెలుగులో సమాధానం ఇవ్వండి). Every string value inside the JSON must be written in Telugu.',
};

// Disclaimer always references the advocate by name
const DISCLAIMER =
  'This is preliminary information only and does not constitute professional legal advice. ' +
  'Legal outcomes vary significantly based on specific facts, jurisdiction, and applicable law. ' +
  'The information provided may not reflect the most current legal developments. ' +
  'You should consult Adv. Rambabu Chintaparthi or another qualified advocate before taking any legal action. ' +
  'Do not rely solely on this guidance.';

// Gemini model — gemini-2.5-flash supports responseMimeType JSON mode
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(issue: string, langInstruction: string): string {
  return `You are a knowledgeable Indian legal assistant providing PRELIMINARY guidance only.
${langInstruction}

CRITICAL OUTPUT RULES:
- Output ONLY a single valid JSON object. No preamble, no explanation, no markdown, no code fences.
- Do NOT include any text before the opening { or after the closing }.
- All string values in the JSON must be in the language specified above.

LEGAL SAFETY RULES — follow strictly in every response:
- NEVER guarantee any legal outcome or result.
- NEVER claim certainty about what will happen in court.
- Always use hedged phrases: "possible applicable laws", "may be relevant", "subject to facts and jurisdiction", "depending on the specific facts", "in many cases", "typically", "may", "could".
- Always encourage consulting a qualified advocate before any legal action.
- Acknowledge that outcomes vary by facts, jurisdiction, and applicable law.

User's Legal Issue: "${issue}"

Return EXACTLY this JSON structure — no extra fields, no omissions:
{
  "category": "Brief legal category (e.g. Criminal Law, Family Law, Property Law) in the selected language",
  "guidance": "2 to 3 paragraphs of preliminary guidance. Use hedged language throughout. Include phrases like possible applicable laws, may be relevant, subject to facts and jurisdiction. Do not guarantee any outcome. In the selected language.",
  "sections": [
    "Possibly applicable: [Act/Section name and number]",
    "May be relevant: [Act/Section name and number]",
    "Possibly applicable: [Act/Section name and number]"
  ],
  "authority": "The authority, court, or forum that may be approached depending on the specific facts. Include a caveat. In the selected language.",
  "nextSteps": [
    "Consider doing X first",
    "You may wish to Y",
    "Gather documents such as Z",
    "Consult Adv. Rambabu Chintaparthi or a qualified advocate before taking any legal action"
  ],
  "disclaimer": "${DISCLAIMER}"
}`;
}

// ─── JSON extraction helpers ──────────────────────────────────────────────────

/**
 * Attempt 1: responseMimeType forces pure JSON — just parse directly.
 * Attempt 2: Strip markdown fences and leading/trailing prose, extract first {...} block.
 * Attempt 3: Locate the outermost { } pair even if there is surrounding text.
 * Attempt 4: If JSON is truncated, try to repair it by closing open structures.
 */
function extractJSON(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  // Attempt 1: Direct parse (works when responseMimeType is respected)
  if (text.startsWith('{')) {
    return text;
  }

  // Attempt 2: Strip markdown fences
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (stripped.startsWith('{')) {
    return stripped;
  }

  // Attempt 3: Extract first outermost {...} block from anywhere in the text
  const firstBrace = text.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = firstBrace; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) return text.slice(firstBrace, i + 1);
      }
    }
    // Attempt 4: JSON was truncated — try to repair from firstBrace to end
    const partial = text.slice(firstBrace);
    return repairTruncatedJSON(partial);
  }

  return null;
}

/**
 * Tries to close an incomplete JSON object by counting unclosed braces/brackets
 * and appending the missing closing characters.
 * Only used as a last resort when the model truncated its output.
 */
function repairTruncatedJSON(partial: string): string | null {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (const ch of partial) {
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
    if ((ch === '}' || ch === ']') && stack.length) stack.pop();
  }

  if (!stack.length) return partial; // already balanced

  // Close any dangling string, then close all open structures
  let repaired = partial.trimEnd();
  if (inString) repaired += '"';        // close open string
  repaired += stack.reverse().join(''); // close open objects/arrays

  return repaired;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(parsed: unknown): parsed is LegalResponse {
  if (!parsed || typeof parsed !== 'object') return false;
  const obj = parsed as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in obj)) return false;
    if (field === 'sections' || field === 'nextSteps') {
      if (!Array.isArray(obj[field]) || (obj[field] as unknown[]).length === 0) return false;
    } else {
      if (typeof obj[field] !== 'string' || !(obj[field] as string).trim()) return false;
    }
  }
  return true;
}

/** Sanitise — strip keys we don't need, keep only what the UI expects */
function sanitise(parsed: LegalResponse): LegalResponse {
  return {
    category:  String(parsed.category).trim(),
    guidance:  String(parsed.guidance).trim(),
    sections:  (parsed.sections as unknown[]).map((s) => String(s).trim()).filter(Boolean).slice(0, 8),
    authority: String(parsed.authority).trim(),
    nextSteps: (parsed.nextSteps as unknown[]).map((s) => String(s).trim()).filter(Boolean).slice(0, 6),
    // Always enforce our disclaimer regardless of what model returned
    disclaimer: DISCLAIMER,
  };
}

// ─── Gemini caller (with one automatic retry on transient failure) ─────────────

async function callGemini(
  prompt: string,
  apiKey: string,
  attempt = 1
): Promise<{ ok: true; text: string } | { ok: false; status: number; body: string }> {
  let res: Response;
  try {
    res = await fetch(GEMINI_URL(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          // Force JSON-only output — eliminates markdown fences and prose preambles
          responseMimeType: 'application/json',
          temperature: 0.2,
          topK: 40,
          topP: 0.9,
          // 2500 tokens is sufficient for longest Hindi/Telugu responses
          // (was 1200 — the primary cause of truncated JSON)
          maxOutputTokens: 2500,
        },
      }),
    });
  } catch (networkErr) {
    // Network-level failure — retry once
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 800));
      return callGemini(prompt, apiKey, attempt + 1);
    }
    return { ok: false, status: 503, body: String(networkErr) };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // 429 (rate limit) or 503 (overload) — retry once after short delay
    if ((res.status === 429 || res.status === 503) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1200));
      return callGemini(prompt, apiKey, attempt + 1);
    }
    return { ok: false, status: res.status, body };
  }

  const data = await res.json();

  // Handle content-filtered / empty candidates
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    const blockReason = data?.promptFeedback?.blockReason;
    return {
      ok: false,
      status: 422,
      body: blockReason
        ? `Request blocked by safety filter: ${blockReason}`
        : 'Gemini returned no candidates',
    };
  }

  // Finish reason SAFETY means the output was filtered mid-stream
  if (candidate.finishReason === 'SAFETY') {
    return { ok: false, status: 422, body: 'Response filtered by safety settings' };
  }

  // gemini-2.5-flash with thinking: parts may include a "thought" part first.
  // Collect only text parts that are NOT thoughts.
  const parts: Array<{ text?: string; thought?: boolean }> =
    candidate.content?.parts ?? [];

  const textParts = parts
    .filter((p) => !p.thought && typeof p.text === 'string')
    .map((p) => p.text as string);

  const text = textParts.join('').trim();

  if (!text) {
    return { ok: false, status: 500, body: 'Gemini returned empty text content' };
  }

  return { ok: true, text };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse and validate request body ──
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { issue, lang = 'en' } = body as { issue?: string; lang?: string };

    if (!issue || typeof issue !== 'string' || issue.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please describe your legal issue in more detail (at least 10 characters).' },
        { status: 400 }
      );
    }

    if (issue.trim().length > 3000) {
      return NextResponse.json(
        { error: 'Please keep your description under 3000 characters.' },
        { status: 400 }
      );
    }

    // ── 2. Environment check ──
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[ai-legal] GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact the site administrator.' },
        { status: 500 }
      );
    }

    // ── 3. Build prompt ──
    const langInstruction =
      LANG_INSTRUCTIONS[lang as string] ?? LANG_INSTRUCTIONS.en;
    const prompt = buildPrompt(issue.trim(), langInstruction);

    // ── 4. Call Gemini ──
    const geminiResult = await callGemini(prompt, apiKey);

    if (!geminiResult.ok) {
      console.error(`[ai-legal] Gemini call failed — status ${geminiResult.status}:`, geminiResult.body);

      // User-facing messages by status category
      if (geminiResult.status === 422) {
        return NextResponse.json(
          { error: 'Your query could not be processed by the AI. Please rephrase and try again.' },
          { status: 422 }
        );
      }
      if (geminiResult.status === 429) {
        return NextResponse.json(
          { error: 'AI service is busy. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a few seconds.' },
        { status: 502 }
      );
    }

    // ── 5. Extract JSON from response text ──
    const rawText = geminiResult.text;
    const extracted = extractJSON(rawText);

    if (!extracted) {
      console.error('[ai-legal] Could not locate JSON in Gemini response. Raw:\n', rawText.slice(0, 500));
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }

    // ── 6. Parse ──
    let parsed: unknown;
    try {
      parsed = JSON.parse(extracted);
    } catch (parseErr) {
      console.error('[ai-legal] JSON.parse failed after extraction. Extracted:\n', extracted.slice(0, 500));
      console.error('[ai-legal] Parse error:', parseErr);
      return NextResponse.json(
        { error: 'AI response was malformed. Please try rephrasing your issue.' },
        { status: 500 }
      );
    }

    // ── 7. Validate structure ──
    if (!validate(parsed)) {
      const missing = REQUIRED_FIELDS.filter(
        (f) => !(f in (parsed as object))
      );
      console.error('[ai-legal] Validation failed. Missing fields:', missing, '— parsed:', JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json(
        { error: 'AI response was incomplete. Please try again.' },
        { status: 500 }
      );
    }

    // ── 8. Sanitise and return ──
    return NextResponse.json(sanitise(parsed));

  } catch (err) {
    console.error('[ai-legal] Unhandled error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
