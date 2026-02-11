import { SUBJECT_KEYWORDS } from './domainValidation';

export type VoicePickOptions = {
  /** ISO / BCP-47 base language, e.g. "en", "en-US", "fr" */
  language?: string;
  /** Exact voice name preferred by user */
  preferredName?: string;
};

function normalizeLang(lang?: string): string {
  if (!lang) return '';
  return lang.toLowerCase();
}

function voiceQualityScore(v: SpeechSynthesisVoice, preferredLang: string): number {
  const name = (v.name || '').toLowerCase();
  const uri = (v.voiceURI || '').toLowerCase();
  const lang = normalizeLang(v.lang);

  let score = 0;

  // Language match first
  if (preferredLang) {
    const pl = normalizeLang(preferredLang);
    if (lang === pl) score += 120;
    else if (lang.startsWith(pl)) score += 90;
    else if (pl.startsWith(lang)) score += 30;
  }

  // CRITICAL: Natural / neural / online voices are REQUIRED for human-like speech
  // These are the highest priority - must sound realistic and human
  if (name.includes('neural')) score += 400;  // Neural voices are most human-like
  if (name.includes('natural')) score += 380;
  if (name.includes('wavenet')) score += 350; // Google WaveNet voices are very natural
  if (name.includes('online')) score += 300;
  if (name.includes('premium')) score += 250;
  if (name.includes('enhanced')) score += 180;

  // Vendor preference (Windows: Microsoft Online (Natural) voices are best)
  if (name.includes('microsoft') || uri.includes('microsoft')) score += 110;
  if (name.includes('google') || uri.includes('google')) score += 90;

  // STRONGLY penalize robotic/synthetic-sounding voices
  if (name.includes('compact')) score -= 400;     // Compact voices are very robotic
  if (name.includes('espeak')) score -= 500;      // eSpeak is very synthetic
  if (name.includes('mbrola')) score -= 450;      // MBROLA is robotic
  if (name.includes('robotic')) score -= 600;     // Explicitly robotic
  if (name.includes('synthetic')) score -= 500;   // Synthetic voices
  if (name.includes('desktop')) score -= 200;     // Desktop voices tend to be lower quality

  // Prefer non-localService if available (often indicates cloud/online voices - more natural)
  if (v.localService === false) score += 100;

  // Some common “more human” Microsoft names
  if (name.includes('aria')) score += 40;
  if (name.includes('jenny')) score += 35;
  if (name.includes('guy')) score += 35;
  if (name.includes('sara')) score += 30;
  if (name.includes('ryan')) score += 30;
  if (name.includes('sonia')) score += 30;

  // Slightly prefer default voice if it already matches language (often a good system pick)
  if (v.default) score += 10;

  return score;
}

export function getHumanVoiceScore(
  v: SpeechSynthesisVoice,
  language: string = 'en'
): number {
  return voiceQualityScore(v, language);
}

export function pickBestHumanVoice(
  voices: SpeechSynthesisVoice[],
  opts: VoicePickOptions = {}
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const preferredName = opts.preferredName?.trim();
  if (preferredName) {
    const direct = voices.find((v) => v.name === preferredName);
    if (direct) return direct;
  }

  const preferredLang = opts.language || 'en';

  // Score and pick best
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;

  for (const v of voices) {
    // Skip obviously wrong language if possible (but only when we have alternatives)
    const score = voiceQualityScore(v, preferredLang);
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }

  // If we somehow picked a non-English voice but English exists and language is unspecified, bias to English.
  if (!opts.language) {
    const english = voices.filter((v) => normalizeLang(v.lang).startsWith('en'));
    if (english.length > 0) {
      let ebest: SpeechSynthesisVoice | null = null;
      let escore = -Infinity;
      for (const v of english) {
        const s = voiceQualityScore(v, 'en');
        if (s > escore) {
          escore = s;
          ebest = v;
        }
      }
      return ebest || best;
    }
  }

  return best;
}

export function trimToSentences(text: string, maxSentences: number): string {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= maxSentences) return text;
  return parts.slice(0, maxSentences).join(' ').trim();
}

export function applyAiTutorStyleToSpokenText(
  base: string,
  aiTutor: { personality: string; responseStyle: string; analogiesEnabled: boolean; clinicalExamplesEnabled?: boolean },
  topicName?: string,
  subject?: string | null
): string {
  let text = base;

  // Response style affects length/structure
  if (aiTutor.responseStyle === 'concise') {
    text = trimToSentences(text, 2);
  } else if (aiTutor.responseStyle === 'interactive') {
    text = `${text} ... Now, quick check-in: can you explain that back in your own words?`;
  } else if (aiTutor.responseStyle === 'adaptive') {
    // Light heuristic: keep it shorter for long content, otherwise keep it detailed
    text = text.length > 450 ? trimToSentences(text, 3) : text;
  }

  // Personality affects tone (kept subtle so it doesn't feel spammy)
  if (aiTutor.personality === 'direct') {
    // Remove some fluff-y openers if present
    text = text.replace(/^(Now,|Let me explain this clearly\. \.\. |Notice how this works\. \.\. |Pay close attention here\. \.\. )/i, '').trim();
  } else if (aiTutor.personality === 'humorous') {
    text = `Quick fun note: learning sticks better when you smile. ... ${text}`;
  } else if (aiTutor.personality === 'formal') {
    text = `Let us proceed. ... ${text}`;
  } else {
    // encouraging (default) - keep as-is
  }

  // Optional curriculum-aware hooks (Generic, safe across domains)
  if (aiTutor.clinicalExamplesEnabled && topicName && subject && SUBJECT_KEYWORDS[subject]) {
    const subjectKeywords = SUBJECT_KEYWORDS[subject];
    if (subjectKeywords.some(keyword => topicName.toLowerCase().includes(keyword))) {
      text = `${text} ... In real-world scenarios related to ${subject}, this shows up in day-to-day understanding.`;
    }
  }

  return text;
}


