'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, AlertCircle, Loader2, Scale } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { Lang } from '@/lib/translations';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIResponse {
  category: string;
  guidance: string;
  sections: string[];
  authority: string;
  nextSteps: string[];
  disclaimer: string;
}

// ─── Voice / speech constants ─────────────────────────────────────────────────

/** BCP-47 primary locale for each app language */
const VOICE_LANG: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

/**
 * Fallback chain per language.
 * Each entry is tried in order until a matching installed voice is found.
 * The final fallback 'en' matches any English voice so we never fail silently.
 */
const VOICE_FALLBACK_CHAIN: Record<Lang, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  hi: ['hi-IN', 'hi', 'en-IN', 'en-GB', 'en-US', 'en'],
  te: ['te-IN', 'te', 'hi-IN', 'hi', 'en-IN', 'en-GB', 'en-US', 'en'],
};

/**
 * FIX BUG 10 — Build a shorter speak text to avoid Chrome's 15-second TTS cutoff.
 * Only speak category + first 500 chars of guidance + authority + steps.
 * Skip the long disclaimer; it is already visible on screen.
 */
function buildSpeakText(r: AIResponse): string {
  const guidanceShort = r.guidance.slice(0, 1000);
  const steps = r.nextSteps.slice(0, 3).join('. ');
  return `${r.category}. ${guidanceShort}. ${r.authority}. ${steps}.`;
}

// ─── Voice selection logic (exported so it can be unit-tested) ────────────────

/**
 * FIX BUG 2 + BUG 4 — Pick the best available SpeechSynthesisVoice for a given
 * app language using a priority fallback chain.
 *
 * Matching strategy (in order):
 *   1. Exact lang match:        voice.lang === 'te-IN'
 *   2. Prefix match:            voice.lang.startsWith('te-')   or  voice.lang === 'te'
 *   3. Repeat for each locale in the fallback chain until a voice is found.
 *   4. Return null only if voices list is completely empty (impossible in practice).
 *
 * Returns { voice, isExact } so the caller can warn when it fell back.
 */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: Lang
): { voice: SpeechSynthesisVoice; isExact: boolean } | null {
  if (!voices.length) return null;

  const chain = VOICE_FALLBACK_CHAIN[lang];
  const primaryLocale = VOICE_LANG[lang]; // e.g. 'te-IN'

  for (const locale of chain) {
    // Exact match first (e.g. 'te-IN' === 'te-IN')
    const exact = voices.find((v) => v.lang === locale);
    if (exact) {
      return { voice: exact, isExact: locale === primaryLocale };
    }
    // Prefix match (e.g. voice.lang = 'te-IN-Standard-A' starts with 'te-')
    const prefix = locale.includes('-') ? locale : `${locale}-`;
    const partial = voices.find(
      (v) => v.lang.startsWith(prefix) || v.lang === locale
    );
    if (partial) {
      return { voice: partial, isExact: partial.lang === primaryLocale };
    }
  }

  // Absolute last resort: first available voice
  return { voice: voices[0], isExact: false };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIAssistant() {
  const { lang, t } = useLang();

  // ── Existing state (unchanged) ──
  const [issue, setIssue]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError]       = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [voiceUsed, setVoiceUsed]     = useState(false);

  // ── New state: voice availability warning (FIX BUG 7) ──
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);

  // ── Refs ──
  const recognitionRef = useRef<any>(null);

  /**
   * FIX BUG 1 + BUG 3 — Do NOT store speechSynthesis in a ref at mount time and
   * forget about it. Instead access window.speechSynthesis lazily inside each
   * function, and maintain a separate voicesRef that is populated after
   * 'voiceschanged' fires.
   *
   * Chrome: getVoices() returns [] synchronously on first call, then fires
   *         'voiceschanged'. After that getVoices() returns the full list.
   * Firefox/Safari: getVoices() returns the full list synchronously.
   * Mobile Chrome: may fire 'voiceschanged' multiple times.
   */
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const voicesReadyRef = useRef(false);

  /**
   * FIX BUG 9 — Chrome TTS silently stops after ~15 seconds on long texts.
   * The workaround: call synth.pause() + synth.resume() every 10 seconds
   * to reset the internal timer. Store the interval id so we can clear it.
   */
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load voices (FIX BUG 1 + BUG 3) ──────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const list = synth.getVoices();
      if (list.length > 0) {
        voicesRef.current = list;
        voicesReadyRef.current = true;
        console.debug('[TTS] Voices loaded:', list.length, 'voices');
        console.debug('[TTS] Available locales:', Array.from(new Set(list.map((v) => v.lang))).sort().join(', '));
      }
    };

    // Try synchronously first (Firefox, Safari)
    loadVoices();

    // Then listen for async load (Chrome, Edge, Mobile Chrome)
    synth.addEventListener('voiceschanged', loadVoices);

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // ── Reset on language change (unchanged behaviour) ────────────────────────

  useEffect(() => {
    setResponse(null);
    setError('');
    setVoiceWarning(null);
  }, [lang]);

  // ── Chrome long-text TTS keepalive (FIX BUG 9) ───────────────────────────

  const startResumeInterval = useCallback(() => {
    stopResumeInterval();
    resumeIntervalRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10_000);
  }, []);

  const stopResumeInterval = useCallback(() => {
    if (resumeIntervalRef.current !== null) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      stopResumeInterval();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopResumeInterval]);

  // ── Core speak() implementation (FIX BUG 2+4+5+6+7+8+9) ─────────────────

  /**
   * speak() — production-ready TTS with:
   *   - Voice selection with full fallback chain
   *   - User warning when exact voice is unavailable
   *   - cancel() + setTimeout(0) gap before speak() (FIX BUG 5)
   *   - onerror handler so isSpeaking never gets stuck (FIX BUG 6)
   *   - Chrome 15s keepalive via resume interval (FIX BUG 9)
   *   - Voice list retry if voices not yet ready (FIX BUG 8)
   */
  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined') return;
      const synth = window.speechSynthesis;

      // Stop any existing speech and clear the keepalive timer
      synth.cancel();
      stopResumeInterval();
      setIsSpeaking(false);

      // FIX BUG 8 — If voices haven't loaded yet, wait up to 2 seconds for them
      const doSpeak = (voices: SpeechSynthesisVoice[]) => {
        // ── Pick voice with fallback chain ──────────────────────────────────
        const result = pickVoice(voices, lang);

        if (!result) {
          // Truly no voices available (very rare — browser may have TTS disabled)
          console.warn('[TTS] No voices available at all.');
          setVoiceWarning(
            'Text-to-speech is not available in this browser. ' +
            'Please enable it in your system settings.'
          );
          return;
        }

        const { voice, isExact } = result;
        console.debug(
          `[TTS] Selected voice: "${voice.name}" (${voice.lang}) ` +
          `for lang="${lang}" — exact match: ${isExact}`
        );

        // FIX BUG 7 — Warn user when we fell back to a different language
        if (!isExact) {
          const requestedLocale = VOICE_LANG[lang];
          const fallbackName    = voice.name;
          const fallbackLocale  = voice.lang;
          const warning =
            lang === 'te'
              ? `Telugu (${requestedLocale}) voice is not installed on this device. ` +
                `Speaking in ${fallbackLocale} using "${fallbackName}" instead. ` +
                `To enable Telugu speech, install Telugu TTS in your system/browser settings.`
              : lang === 'hi'
              ? `Hindi (${requestedLocale}) voice is not installed on this device. ` +
                `Speaking in ${fallbackLocale} using "${fallbackName}" instead.`
              : null;
          if (warning) {
            console.warn('[TTS]', warning);
            setVoiceWarning(warning);
          }
        } else {
          setVoiceWarning(null);
        }

        // ── Build utterance ─────────────────────────────────────────────────
        const utterance         = new SpeechSynthesisUtterance(text);
        utterance.voice         = voice;
        utterance.lang          = voice.lang; // use actual voice lang, not hint
        utterance.rate          = 0.88;       // slightly slower for non-English
        utterance.pitch         = 1;
        utterance.volume        = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
          startResumeInterval(); // FIX BUG 9
        };

        // FIX BUG 6 — Both onend AND onerror must clean up state
        utterance.onend = () => {
          setIsSpeaking(false);
          stopResumeInterval();
          console.debug('[TTS] Speech finished normally.');
        };

        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          // 'interrupted' fires when we cancel() manually — that is expected, not an error
          if (e.error === 'interrupted' || e.error === 'canceled') {
            console.debug('[TTS] Speech cancelled (expected).');
          } else {
            console.error('[TTS] Speech error:', e.error);
            setVoiceWarning(`Speech error: ${e.error}. Please try again.`);
          }
          setIsSpeaking(false);
          stopResumeInterval();
        };

        // FIX BUG 5 — Let cancel() settle before queuing the new utterance.
        // setTimeout(0) yields to the event loop, allowing Chrome's internal
        // TTS queue to fully clear before we push the new utterance.
        setTimeout(() => {
          synth.speak(utterance);
        }, 0);
      };

      // ── Handle voices-not-yet-ready (FIX BUG 8) ──────────────────────────
      if (voicesReadyRef.current && voicesRef.current.length > 0) {
        doSpeak(voicesRef.current);
        return;
      }

      // Voices not ready yet — poll for up to 2 seconds then proceed
      let waited = 0;
      const poll = setInterval(() => {
        waited += 100;
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesRef.current    = voices;
          voicesReadyRef.current = true;
          clearInterval(poll);
          doSpeak(voices);
        } else if (waited >= 2000) {
          clearInterval(poll);
          console.warn('[TTS] Voices still empty after 2s — proceeding with empty list.');
          doSpeak([]);
        }
      }, 100);
    },
    [lang, startResumeInterval, stopResumeInterval]
  );

  // ── stopSpeaking ──────────────────────────────────────────────────────────

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    stopResumeInterval();
  }, [stopResumeInterval]);

  // ─── Voice recognition (unchanged logic, tightened types) ─────────────────

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t.ai.voiceNotSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang            = VOICE_LANG[lang];
    recognition.continuous      = false;
    recognition.interimResults  = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string;
      setIssue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setVoiceUsed(true);
    };
    recognition.onerror = (_e: any) => {
      console.error('[STT] Recognition error:', _e.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ─── API call (unchanged logic) ────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    setError('');
    setResponse(null);
    setVoiceWarning(null);

    try {
      const res = await fetch('/api/ai-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');
      setResponse(data);
      if (voiceUsed) speak(buildSpeakText(data));
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render (UI unchanged — only voiceWarning banner added) ───────────────

  return (
    <section id="ai-assistant" className="section-padding bg-white dark:bg-charcoal-light">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">

        {/* Header — unchanged */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-widest uppercase font-medium">{t.ai.eyebrow}</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-display text-3xl lg:text-4xl text-charcoal dark:text-white font-semibold mb-4">
            {t.ai.title}
          </h2>
          <p className="text-slate dark:text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
            {t.ai.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-parchment dark:bg-charcoal-mid px-4 py-2 text-xs text-slate dark:text-gray-400">
            <AlertCircle size={12} className="text-gold flex-shrink-0" />
            <span>{t.ai.privacyNote}</span>
          </div>
        </div>

        {/* Input Area — unchanged */}
        <div className="bg-white dark:bg-charcoal-mid border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder={t.ai.placeholder}
            className="w-full h-40 bg-transparent text-charcoal dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={isListening ? stopVoice : startVoice}
                className={`flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase font-medium transition-all border ${
                  isListening
                    ? 'bg-gold text-charcoal border-gold animate-pulse-gold'
                    : 'border-gray-300 dark:border-gray-600 text-slate dark:text-gray-400 hover:border-gold hover:text-gold'
                }`}
                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                {isListening ? t.ai.listeningBtn : t.ai.voiceBtn}
              </button>
              <span className="text-xs text-gray-400">{issue.length}/2000</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!issue.trim() || loading}
              className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? t.ai.analysingBtn : t.ai.submitBtn}
            </button>
          </div>
        </div>

        {/* Error banner — unchanged */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* FIX BUG 7 — Voice warning banner (appears only when TTS falls back) */}
        {voiceWarning && (
          <div className="bg-parchment dark:bg-charcoal-mid border border-gold/40 p-4 mb-6 flex items-start gap-3">
            <Volume2 size={15} className="text-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate dark:text-gray-400 leading-relaxed">{voiceWarning}</p>
          </div>
        )}

        {/* Response Card — unchanged */}
        {response && (
          <div className="border border-gold/30 bg-white dark:bg-charcoal-mid shadow-lg animate-fade-up">
            <div className="bg-charcoal dark:bg-charcoal-mid border-b border-gold/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale size={18} className="text-gold" />
                <div>
                  <div className="text-white text-sm font-semibold font-display">{t.ai.cardTitle}</div>
                  <div className="text-gold text-xs opacity-80">{response.category}</div>
                </div>
              </div>
              {voiceUsed && (
                <button
                  onClick={isSpeaking ? stopSpeaking : () => speak(buildSpeakText(response))}
                  className="flex items-center gap-2 text-xs text-gold border border-gold/50 px-3 py-1.5 hover:bg-gold hover:text-charcoal transition-all"
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {isSpeaking ? t.ai.stopBtn : t.ai.listenBtn}
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs tracking-widest uppercase text-gold font-medium mb-3">{t.ai.guidanceLabel}</h4>
                <p className="text-sm text-slate dark:text-gray-300 leading-relaxed">{response.guidance}</p>
              </div>

              {response.sections?.length > 0 && (
                <div>
                  <h4 className="text-xs tracking-widest uppercase text-gold font-medium mb-3">{t.ai.sectionsLabel}</h4>
                  <div className="flex flex-wrap gap-2">
                    {response.sections.map((s) => (
                      <span key={s} className="bg-parchment dark:bg-charcoal text-charcoal dark:text-gray-300 text-xs px-3 py-1 border border-gray-200 dark:border-gray-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {response.authority && (
                <div>
                  <h4 className="text-xs tracking-widest uppercase text-gold font-medium mb-3">{t.ai.authorityLabel}</h4>
                  <p className="text-sm text-slate dark:text-gray-300 leading-relaxed">{response.authority}</p>
                </div>
              )}

              {response.nextSteps?.length > 0 && (
                <div>
                  <h4 className="text-xs tracking-widest uppercase text-gold font-medium mb-3">{t.ai.stepsLabel}</h4>
                  <ol className="space-y-2">
                    {response.nextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="font-display text-gold text-sm font-semibold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-sm text-slate dark:text-gray-300 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-start gap-3 bg-parchment dark:bg-charcoal p-4">
                  <AlertCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate dark:text-gray-400 leading-relaxed">
                    <strong className="text-charcoal dark:text-gray-300">{t.ai.disclaimerLabel}:</strong>{' '}
                    {response.disclaimer}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="#appointment" className="btn-gold text-center text-xs flex-1">
                  {t.ai.bookBtn}
                </a>
                <button
                  onClick={() => { setResponse(null); setIssue(''); setVoiceUsed(false); setVoiceWarning(null); }}
                  className="btn-outline text-xs flex-1"
                >
                  {t.ai.askAnotherBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
