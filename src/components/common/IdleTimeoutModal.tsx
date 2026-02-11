import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export default function IdleTimeoutModal() {
  const [warningSeconds, setWarningSeconds] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, { initialFocus: true, active: warningSeconds !== null });
  const { setWarningCallbacks, staySignedIn } = useIdleTimeout({
    idleMinutes: 45,
    warningSeconds: 60,
    enabled: true,
  });

  useEffect(() => {
    setWarningCallbacks(
      (seconds) => setWarningSeconds(seconds),
      () => setWarningSeconds(null)
    );
  }, [setWarningCallbacks]);

  return (
    <AnimatePresence>
      {warningSeconds !== null && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-labelledby="idle-timeout-title"
          aria-describedby="idle-timeout-desc"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-slate-700"
          >
            <h2 id="idle-timeout-title" className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-2">
              Still there?
            </h2>
            <p id="idle-timeout-desc" className="text-sm text-gray-600 dark:text-slate-300 mb-4">
              You’ve been inactive for a while. You’ll be signed out in{' '}
              <strong>{warningSeconds}</strong> second{warningSeconds !== 1 ? 's' : ''} to keep your account secure.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  staySignedIn();
                  setWarningSeconds(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Stay signed in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
