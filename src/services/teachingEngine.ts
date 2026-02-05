/**
 * Teaching Engine Service
 * 
 * Delivers realistic and engaging teaching experiences using:
 * - Human-like voice explanations with natural speech patterns
 * - Topic-relevant visuals only (no distracting imagery)
 * - Real-time state synchronization
 * - Production-grade reliability
 */

import { pickBestHumanVoice, getHumanVoiceScore } from '../utils/voice';
import { useSettingsStore } from '../stores/settingsStore';
import { useTeachingStore } from '../stores/teachingStore';

// ============================================================================
// Types
// ============================================================================

export interface SpeechOptions {
  text: string;
  rate?: number;       // 0.5 - 2.0 (default from settings)
  pitch?: number;      // 0 - 2 (default 1)
  volume?: number;     // 0 - 1 (default 1)
  language?: string;   // BCP-47 language code
  voiceName?: string;  // Specific voice name
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (charIndex: number, charLength: number) => void;
  onError?: (error: Error) => void;
}

export interface TeachingContent {
  stepId: string;
  title: string;
  spokenContent: string;
  visualType: VisualType;
  keyConcepts?: string[];
  estimatedDuration?: number; // seconds
}

export type VisualType = 
  | 'diagram' 
  | 'chart' 
  | 'illustration' 
  | 'code' 
  | 'equation' 
  | 'process-flow'
  | 'anatomy'
  | 'circuit'
  | 'graph'
  | 'text';

// ============================================================================
// Voice Management
// ============================================================================

let speechCallbacks: Partial<SpeechOptions> = {};
let voicesLoaded = false;
let cachedBestVoice: SpeechSynthesisVoice | null = null;

/**
 * Initialize and cache voices when they're loaded
 */
function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (voicesLoaded && speechSynthesis.getVoices().length > 0) {
      resolve(speechSynthesis.getVoices());
      return;
    }

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded = true;
        // Cache the best human-like voice
        const settings = useSettingsStore.getState().settings;
        cachedBestVoice = pickBestHumanVoice(voices, {
          language: settings.language || 'en',
          preferredName: settings.accessibility.ttsVoice || undefined,
        });
        resolve(voices);
      }
    };

    // Try immediately
    loadVoices();

    // Also listen for voiceschanged event
    speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });

    // Timeout fallback
    setTimeout(() => {
      const voices = speechSynthesis.getVoices();
      resolve(voices);
    }, 1000);
  });
}

/**
 * Get the best available voice for human-like speech
 */
export async function getBestVoice(language?: string): Promise<SpeechSynthesisVoice | null> {
  await ensureVoicesLoaded();
  
  if (cachedBestVoice && !language) {
    return cachedBestVoice;
  }

  const voices = speechSynthesis.getVoices();
  const settings = useSettingsStore.getState().settings;
  
  return pickBestHumanVoice(voices, {
    language: language || settings.language || 'en',
    preferredName: settings.accessibility.ttsVoice || undefined,
  });
}

/**
 * Get all available voices with quality scores
 */
export async function getAvailableVoices(): Promise<Array<{
  voice: SpeechSynthesisVoice;
  score: number;
  isRecommended: boolean;
}>> {
  const voices = await ensureVoicesLoaded();
  const settings = useSettingsStore.getState().settings;
  const language = settings.language || 'en';

  return voices
    .map((voice) => ({
      voice,
      score: getHumanVoiceScore(voice, language),
      isRecommended: false,
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      isRecommended: index < 3, // Top 3 are recommended
    }));
}

// ============================================================================
// Speech Synthesis - Human-Like Voice
// ============================================================================

/**
 * Speak text with human-like voice
 * Uses the best available voice with natural speech patterns
 */
export async function speak(options: SpeechOptions): Promise<void> {
  const {
    text,
    rate,
    pitch = 1,
    volume = 1,
    language,
    voiceName,
    onStart,
    onEnd,
    onPause,
    onResume,
    onBoundary,
    onError,
  } = options;

  // Check if TTS is enabled
  const settings = useSettingsStore.getState().settings;
  if (!settings.accessibility.textToSpeech) {
    onEnd?.();
    return;
  }

  // Stop any current speech
  stop();

  try {
    const voice = voiceName
      ? (await ensureVoicesLoaded()).find((v) => v.name === voiceName)
      : await getBestVoice(language);

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    // Apply speech settings
    utterance.rate = rate ?? settings.accessibility.ttsSpeed ?? 1;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Store callbacks for pause/resume handling
    speechCallbacks = { onPause, onResume, onBoundary };

    // Event handlers
    utterance.onstart = () => {
      useTeachingStore.getState().setSpeaking(true);
      onStart?.();
    };

    utterance.onend = () => {
      useTeachingStore.getState().setSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      useTeachingStore.getState().setSpeaking(false);
      onError?.(new Error(event.error));
    };

    utterance.onpause = () => {
      speechCallbacks.onPause?.();
    };

    utterance.onresume = () => {
      speechCallbacks.onResume?.();
    };

    utterance.onboundary = (event) => {
      onBoundary?.(event.charIndex, event.charLength || 1);
    };

    speechSynthesis.speak(utterance);
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Speech synthesis failed'));
  }
}

/**
 * Speak teaching content with natural pauses and emphasis
 */
export async function speakTeachingContent(content: TeachingContent): Promise<void> {
  const { spokenContent, title } = content;
  
  // Add natural introduction
  const introduction = `Let's learn about ${title}.`;
  
  // Process text for natural speech patterns
  const processedText = processTextForNaturalSpeech(spokenContent);
  
  const fullText = `${introduction} ${processedText}`;
  
  return speak({
    text: fullText,
    onStart: () => {
      useTeachingStore.getState().setSpeaking(true);
    },
    onEnd: () => {
      useTeachingStore.getState().setSpeaking(false);
    },
  });
}

/**
 * Process text to sound more natural when spoken
 */
export function processTextForNaturalSpeech(text: string): string {
  let processed = text;
  
  // Add slight pauses after sentences
  processed = processed.replace(/\. /g, '. ');
  
  // Handle abbreviations for better pronunciation
  processed = processed.replace(/e\.g\./gi, 'for example');
  processed = processed.replace(/i\.e\./gi, 'that is');
  processed = processed.replace(/etc\./gi, 'and so on');
  processed = processed.replace(/vs\./gi, 'versus');
  
  // Handle common technical terms
  processed = processed.replace(/API/g, 'A P I');
  processed = processed.replace(/HTML/g, 'H T M L');
  processed = processed.replace(/CSS/g, 'C S S');
  processed = processed.replace(/SQL/g, 'sequel');
  processed = processed.replace(/DNA/g, 'D N A');
  processed = processed.replace(/RNA/g, 'R N A');
  processed = processed.replace(/ECG/g, 'E C G');
  processed = processed.replace(/EKG/g, 'E K G');
  
  // Handle numbers and units
  processed = processed.replace(/(\d+)°C/g, '$1 degrees Celsius');
  processed = processed.replace(/(\d+)°F/g, '$1 degrees Fahrenheit');
  processed = processed.replace(/(\d+)%/g, '$1 percent');
  processed = processed.replace(/(\d+)km/g, '$1 kilometers');
  processed = processed.replace(/(\d+)m\b/g, '$1 meters');
  processed = processed.replace(/(\d+)cm/g, '$1 centimeters');
  processed = processed.replace(/(\d+)mm/g, '$1 millimeters');
  
  return processed;
}

/**
 * Stop current speech
 */
export function stop(): void {
  speechSynthesis.cancel();
  useTeachingStore.getState().setSpeaking(false);
}

/**
 * Pause current speech
 */
export function pause(): void {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
}

/**
 * Resume paused speech
 */
export function resume(): void {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  return speechSynthesis.speaking;
}

/**
 * Check if speech is paused
 */
export function isPaused(): boolean {
  return speechSynthesis.paused;
}

// ============================================================================
// Visual Selection - Topic-Relevant Only
// ============================================================================

/**
 * Topic to visual mapping
 * Maps topic keywords to appropriate educational visuals
 * Ensures only topic-relevant visuals are shown
 */
const TOPIC_VISUAL_MAP: Record<string, string> = {
  // Medicine - Cardiology
  'heart': 'BloodFlowVisual',
  'cardiac': 'BloodFlowVisual',
  'blood-flow': 'BloodFlowVisual',
  'coronary': 'CoronaryArteriesVisual',
  'arteries': 'CoronaryArteriesVisual',
  'valve': 'HeartValvesVisual',
  'valves': 'HeartValvesVisual',
  'ecg': 'ECGBasicsVisual',
  'ekg': 'ECGBasicsVisual',
  'electrocardiogram': 'ECGBasicsVisual',
  
  // Medicine - Neurology
  'brain': 'BrainStructureVisual',
  'neuron': 'NeuronVisual',
  'neurons': 'NeuronVisual',
  'synapse': 'NeuronVisual',
  'spinal': 'SpinalCordVisual',
  'spine': 'SpinalCordVisual',
  'stroke': 'StrokeVisual',
  'ischemia': 'StrokeVisual',
  
  // Biology - Genetics
  'dna': 'DNAStructureVisual',
  'double-helix': 'DNAStructureVisual',
  'replication': 'DNAReplicationVisual',
  'transcription': 'DNATranscriptionVisual',
  'translation': 'DNATranslationVisual',
  'protein-synthesis': 'DNATranslationVisual',
  'heredity': 'HeredityVisual',
  'genetics': 'HeredityVisual',
  'mendel': 'HeredityVisual',
  'punnett': 'HeredityVisual',
  
  // Biology - Cell
  'cell': 'CellStructureVisual',
  'cell-structure': 'CellStructureVisual',
  'organelles': 'CellStructureVisual',
  'mitochondria': 'CellStructureVisual',
  
  // Engineering - Software
  'react': 'ReactComponentVisual',
  'component': 'ReactComponentVisual',
  'sorting': 'SortingAlgorithmVisual',
  'algorithm': 'SortingAlgorithmVisual',
  'graph': 'GraphVisualizationVisual',
  'data-structure': 'GraphVisualizationVisual',
  'sql': 'SQLBasicsVisual',
  'database': 'SQLBasicsVisual',
  'api': 'APIDesignVisual',
  'rest': 'APIDesignVisual',
  
  // Engineering - Electrical
  'dc-circuit': 'DCCircuitVisual',
  'ac-circuit': 'ACCircuitVisual',
  'circuit': 'DCCircuitVisual',
  'ohm': 'DCCircuitVisual',
  'kirchhoff': 'DCCircuitVisual',
  
  // Physics
  'newton': 'NewtonsLawsVisual',
  'force': 'NewtonsLawsVisual',
  'motion': 'KinematicsVisual',
  'kinematics': 'KinematicsVisual',
  'velocity': 'KinematicsVisual',
  'thermodynamics': 'ThermodynamicsVisual',
  'heat': 'ThermodynamicsVisual',
  'entropy': 'ThermodynamicsVisual',
  
  // Business
  'seo': 'SEOVisual',
  'marketing': 'SEOVisual',
  'stock': 'StockMarketVisual',
  'market': 'StockMarketVisual',
  'investing': 'StockMarketVisual',
  
  // Law
  'contract': 'ContractFormationVisual',
  'legal': 'ContractFormationVisual',
  
  // Psychology
  'anxiety': 'AnxietyVisual',
  'stress': 'AnxietyVisual',
  'cbt': 'CBTVisual',
  'cognitive-behavioral': 'CBTVisual',
  'therapy': 'CBTVisual',
  
  // Technology - AI/ML
  'supervised': 'SupervisedLearningVisual',
  'machine-learning': 'SupervisedLearningVisual',
  'neural-network': 'NeuralNetworkVisual',
  'deep-learning': 'NeuralNetworkVisual',
  'encryption': 'EncryptionVisual',
  'cryptography': 'EncryptionVisual',
  'security': 'EncryptionVisual',
};

/**
 * Get the appropriate visual component for a topic
 * Returns null if no topic-relevant visual exists (avoid distracting imagery)
 */
export function getVisualForTopic(topicId: string, topicName: string): string | null {
  const searchTerms = [
    topicId.toLowerCase(),
    topicName.toLowerCase(),
    ...topicId.split('-'),
    ...topicName.split(' ').map(w => w.toLowerCase()),
  ];
  
  for (const term of searchTerms) {
    if (TOPIC_VISUAL_MAP[term]) {
      return TOPIC_VISUAL_MAP[term];
    }
  }
  
  // Check for partial matches
  for (const [key, visual] of Object.entries(TOPIC_VISUAL_MAP)) {
    if (searchTerms.some(term => term.includes(key) || key.includes(term))) {
      return visual;
    }
  }
  
  // Return null instead of a generic visual - no distracting imagery
  return null;
}

/**
 * Check if a topic has a relevant visual
 */
export function hasRelevantVisual(topicId: string, topicName: string): boolean {
  return getVisualForTopic(topicId, topicName) !== null;
}

// ============================================================================
// Teaching Session Control
// ============================================================================

/**
 * Start a teaching step with voice and synchronized visuals
 */
export async function startTeachingStep(content: TeachingContent): Promise<void> {
  const store = useTeachingStore.getState();
  
  // Set the current step
  if (store.currentSession) {
    const stepIndex = store.currentSession.teachingSteps?.findIndex(
      (s) => s.id === content.stepId
    );
    if (stepIndex !== undefined && stepIndex >= 0) {
      store.goToStep(stepIndex);
    }
  }
  
  // Start speaking the content
  await speakTeachingContent(content);
}

/**
 * Complete current teaching step and move to next
 */
export function completeAndAdvance(): void {
  const store = useTeachingStore.getState();
  const currentStep = store.getCurrentStepData();
  
  if (currentStep) {
    store.completeStep(currentStep.id);
    store.nextStep();
  }
}

/**
 * Pause the current teaching session
 */
export function pauseTeaching(): void {
  pause();
  useTeachingStore.getState().pause();
}

/**
 * Resume the current teaching session
 */
export function resumeTeaching(): void {
  resume();
  useTeachingStore.getState().resume();
}

// ============================================================================
// Export for external use
// ============================================================================

export const teachingEngine = {
  speak,
  speakTeachingContent,
  stop,
  pause,
  resume,
  isSpeaking,
  isPaused,
  getBestVoice,
  getAvailableVoices,
  getVisualForTopic,
  hasRelevantVisual,
  startTeachingStep,
  completeAndAdvance,
  pauseTeaching,
  resumeTeaching,
};

export default teachingEngine;
