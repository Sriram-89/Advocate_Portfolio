import { NextRequest, NextResponse } from 'next/server';

const LANG_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond entirely in English.',
  hi: 'Respond entirely in Hindi (हिंदी में उत्तर दें). All field values in the JSON must be in Hindi.',
  te: 'Respond entirely in Telugu (తెలుగులో సమాధానం ఇవ్వండి). All field values in the JSON must be in Telugu.',
};

export async function POST(req: NextRequest) {
  try {
    const { issue, lang = 'en' } = await req.json();

    if (!issue || issue.trim().length < 10) {
      return NextResponse.json({ error: 'Please describe your issue in more detail.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;


    if (!apiKey) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 });
    }

    const langInstruction = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.en;

    const prompt = `You are a knowledgeable Indian legal assistant providing PRELIMINARY guidance only. 
${langInstruction}

IMPORTANT SAFETY RULES — strictly follow these in every response:
- NEVER guarantee any legal outcome or result.
- NEVER claim certainty about what will happen in court.
- Always use phrases like "possible applicable laws", "may be relevant", "subject to facts and jurisdiction", "depending on the specific facts".
- Always encourage the user to consult a qualified advocate before taking any legal action.
- Acknowledge that outcomes vary based on specific facts, jurisdiction, and applicable law.
- Use hedged language throughout: "may", "could", "typically", "often", "in many cases".

User's Legal Issue: "${issue}"

Respond ONLY with a valid JSON object (no markdown, no backticks) in exactly this structure:
{
  "category": "Brief legal category name (e.g., Criminal Law, Family Law). In the selected language.",
  "guidance": "2-3 paragraphs of preliminary guidance using hedged language. Use phrases like 'possible applicable laws', 'may be relevant', 'subject to facts and jurisdiction'. Acknowledge uncertainty. In the selected language.",
  "sections": ["3-6 possibly relevant Indian legal provisions. Prefix each with 'Possibly applicable:' or 'May be relevant:'. E.g., 'Possibly applicable: IPC Section 420'"],
  "authority": "Suggest which authority or forum may be approached, with a caveat that it depends on specific facts. In the selected language.",
  "nextSteps": ["Step 1 as a cautious, actionable suggestion — use 'consider' or 'you may wish to'", "Step 2", "Step 3", "Step 4 — maximum 5 steps. Final step must always recommend consulting a qualified advocate."],
  "disclaimer": "This is preliminary information only and does not constitute professional legal advice. Legal outcomes vary significantly based on specific facts, jurisdiction, and applicable law. The information provided may not reflect the most current legal developments. You should consult Adv. Rambabu Chintaparthi or another qualified advocate before taking any legal action. Do not rely solely on this guidance."
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,   // lower = more conservative, less hallucination
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1200,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'AI service unavailable. Please try again later.' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log("RAW GEMINI RESPONSE:");
console.log(rawText);
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Gemini response:', rawText);
      return NextResponse.json({ error: 'Could not parse AI response. Please try rephrasing your issue.' }, { status: 500 });
    }

    const required = ['category', 'guidance', 'sections', 'authority', 'nextSteps', 'disclaimer'];
    for (const field of required) {
      if (!parsed[field]) {
        return NextResponse.json({ error: 'Incomplete AI response. Please try again.' }, { status: 500 });
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('AI legal route error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
