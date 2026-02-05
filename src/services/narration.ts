import { speak, processTextForNaturalSpeech } from './teachingEngine';
import { useSettingsStore } from '../stores/settingsStore';

export type NarrationOptions = {
  enabled?: boolean;
  language?: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  maxChars?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function narrateText(text: string, options: NarrationOptions = {}): void {
  if (options.enabled === false) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const settings = useSettingsStore.getState().settings;
  if (!settings.accessibility.textToSpeech) return;

  const maxChars = options.maxChars ?? 2200;
  const baseText = normalizeText(text);
  if (!baseText) return;

  const clipped = baseText.length > maxChars ? `${baseText.slice(0, maxChars)}…` : baseText;
  const processed = processTextForNaturalSpeech(clipped);

  void speak({
    text: processed,
    rate: options.rate ?? settings.accessibility.ttsSpeed ?? 1,
    pitch: options.pitch ?? 1,
    volume: options.volume ?? 1,
    language: options.language ?? settings.language,
    voiceName: options.voiceName ?? (settings.accessibility.ttsVoice || undefined),
    onStart: options.onStart,
    onEnd: options.onEnd,
    onError: options.onError,
  });
}
