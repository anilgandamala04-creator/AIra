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

  // Natural / neural / online voices tend to sound most human
  if (name.includes('neural')) score += 220;
  if (name.includes('natural')) score += 200;
  if (name.includes('online')) score += 180;
  if (name.includes('premium')) score += 120;
  if (name.includes('enhanced')) score += 90;

  // Vendor preference (Windows: Microsoft Online (Natural) voices are best)
  if (name.includes('microsoft') || uri.includes('microsoft')) score += 110;
  if (name.includes('google') || uri.includes('google')) score += 90;

  // Prefer not-compact voices (compact tends to be robotic)
  if (name.includes('compact')) score -= 120;

  // Prefer non-localService if available (often indicates cloud/online voices)
  // (Not all browsers set this accurately; we keep it as a mild signal.)
  if (v.localService === false) score += 25;

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

