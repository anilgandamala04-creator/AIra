import { useState, useRef, useCallback } from 'react';
import { BookMarked } from 'lucide-react';
import { useResourceStore } from '../../stores/resourceStore';
import { toast } from '../../stores/toastStore';

interface HighlightToNoteProps {
  content: string;
  topicName: string;
  sessionId: string;
  stepTitle: string;
  stepIndex: number;
  className?: string;
}

/**
 * Renders step content as selectable text. When the user selects text, shows
 * "Add to notes" to save the selection as a note snippet (topic + step reference).
 */
export default function HighlightToNote({
  content,
  topicName,
  sessionId,
  stepTitle,
  stepIndex,
  className = '',
}: HighlightToNoteProps) {
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addNoteFromHighlight = useResourceStore((s) => s.addNoteFromHighlight);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString()?.trim();
    if (!text || text.length < 2) {
      setSelection(null);
      return;
    }
    const range = sel?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();
    if (rect) setSelection({ text, rect });
    else setSelection(null);
  }, []);

  const handleAddToNotes = useCallback(() => {
    if (!selection) return;
    addNoteFromHighlight({
      topicName,
      sessionId,
      stepTitle,
      stepIndex,
      snippetText: selection.text,
    });
    toast.success('Saved to notes');
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [selection, topicName, sessionId, stepTitle, stepIndex, addNoteFromHighlight]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="text-gray-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed select-text whitespace-pre-wrap break-words"
        data-reading-content
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {content}
      </div>
      {selection && (
        <div
          className="fixed z-50 flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg"
          style={{
            left: selection.rect.left,
            top: selection.rect.top - 44,
          }}
        >
          <button
            type="button"
            onClick={handleAddToNotes}
            className="flex items-center gap-1.5 font-medium hover:bg-slate-700 rounded px-2 py-1"
          >
            <BookMarked className="w-4 h-4" />
            Add to notes
          </button>
        </div>
      )}
    </div>
  );
}
