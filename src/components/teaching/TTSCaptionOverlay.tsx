import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTeachingStore } from '../../stores/teachingStore';

interface TTSCaptionOverlayProps {
  stepId: string;
}

/**
 * Shows synchronized captions while TTS plays. Listens to speech-boundary events.
 */
export default function TTSCaptionOverlay({ stepId }: TTSCaptionOverlayProps) {
  const showCaptions = useSettingsStore((s) => s.settings.accessibility.showCaptions);
  const textToSpeech = useSettingsStore((s) => s.settings.accessibility.textToSpeech);
  const isSpeaking = useTeachingStore((s) => s.isSpeaking);

  const [currentPhrase, setCurrentPhrase] = useState('');

  useEffect(() => {
    if (!showCaptions || !textToSpeech) return;

    const handleBoundary = (e: Event) => {
      const ev = e as CustomEvent<{ stepId: string; currentPhrase?: string }>;
      if (ev.detail?.stepId === stepId && ev.detail.currentPhrase) {
        setCurrentPhrase(ev.detail.currentPhrase);
      }
    };

    const handleEnd = (e: Event) => {
      const ev = e as CustomEvent<{ stepId: string }>;
      if (ev.detail?.stepId === stepId) {
        setCurrentPhrase('');
      }
    };

    window.addEventListener('speech-boundary', handleBoundary);
    window.addEventListener('speech-end', handleEnd);
    return () => {
      window.removeEventListener('speech-boundary', handleBoundary);
      window.removeEventListener('speech-end', handleEnd);
    };
  }, [stepId, showCaptions, textToSpeech]);

  if (!showCaptions || !isSpeaking || !currentPhrase) return null;

  return (
    <div
      className="absolute bottom-4 left-4 right-4 z-20 px-4 py-3 bg-black/70 text-white text-center text-sm sm:text-base rounded-lg max-h-20 overflow-y-auto"
      role="region"
      aria-live="polite"
      aria-label="Captions"
    >
      {currentPhrase}
    </div>
  );
}
