/**
 * Detect if the same session is open in another tab and show a warning.
 * Uses BroadcastChannel to signal presence; other tabs receive and set warning state.
 */

import { useEffect, useState } from 'react';

const CHANNEL_NAME = 'aira-session';
const PING_MS = 2000;

function getTabId(): string {
  try {
    let id = sessionStorage.getItem('aira-tab-id');
    if (!id) {
      id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('aira-tab-id', id);
    }
    return id;
  } catch {
    return `tab-${Date.now()}`;
  }
}

export function useMultiTabWarning(sessionId: string | undefined): boolean {
  const [otherTabOpen, setOtherTabOpen] = useState(false);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') {
      setOtherTabOpen(false);
      return undefined;
    }

    const tabId = getTabId();
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return undefined;
    }

    const ping = () => {
      try {
        channel?.postMessage({ sessionId, tabId, at: Date.now() });
      } catch {
        // ignore
      }
    };

    const handleMessage = (e: MessageEvent) => {
      const data = e.data as { sessionId?: string; tabId?: string };
      if (data?.sessionId === sessionId && data?.tabId && data.tabId !== tabId) {
        setOtherTabOpen(true);
      }
    };

    channel.addEventListener('message', handleMessage);
    ping();
    const interval = setInterval(ping, PING_MS);

    return () => {
      channel?.removeEventListener('message', handleMessage);
      channel?.close();
      clearInterval(interval);
      setOtherTabOpen(false);
    };
  }, [sessionId]);

  return otherTabOpen;
}
