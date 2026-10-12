export {};

declare global {
  interface Window {
    /** Set by the inline script in app/layout.tsx when the first-visit loader should play. */
    __amLoader?: boolean;
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }

  /** The parts of the Web Speech API's recognition interface the voice assistant uses (not in lib.dom yet). */
  interface SpeechRecognitionInstance extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
  }

  type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
}
