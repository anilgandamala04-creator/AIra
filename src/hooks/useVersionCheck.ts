/**
 * Periodically checks for a new app version and reports when a newer deploy is live.
 * Compares the main script URL in the deployed index.html with the current page's script.
 */
import { useEffect, useState } from 'react';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function getCurrentScriptHash(): string | null {
  if (typeof document === 'undefined') return null;
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (src && src.includes('assets/') && src.endsWith('.js')) return src;
  }
  return null;
}

export function useVersionCheck(): boolean {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    const currentHash = getCurrentScriptHash();
    if (!currentHash) return;

    const check = async () => {
      try {
        const res = await fetch(`/?t=${Date.now()}`, { cache: 'no-store' });
        const html = await res.text();
        const match = html.match(/src="([^"]*assets\/[^"]+\.js)"/) || html.match(/src='([^']*assets\/[^']+\.js)'/);
        const deployedScript = match ? match[1] : null;
        const deployedHash = deployedScript ? new URL(deployedScript, window.location.origin).href : null;
        if (deployedHash && deployedHash !== currentHash) {
          setNewVersionAvailable(true);
        }
      } catch {
        // ignore network errors
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return newVersionAvailable;
}
