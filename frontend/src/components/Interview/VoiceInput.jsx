import { useState, useRef, useCallback } from "react";

export default function VoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [supported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const recognitionRef = useRef(null);

  const toggleListening = useCallback(() => {
    if (!supported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      onTranscript(" " + transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, supported, onTranscript]);

  if (!supported) return null;

  return (
    <button
      onClick={toggleListening}
      title={isListening ? "Stop recording" : "Start voice input"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        isListening
          ? "bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse"
          : "bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500"
      }`}
    >
      <span>{isListening ? "⏹" : "🎤"}</span>
      <span>{isListening ? "Listening..." : "Voice"}</span>
    </button>
  );
}
