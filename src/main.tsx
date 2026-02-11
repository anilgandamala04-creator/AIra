/* eslint-disable react-refresh/only-export-components -- entry point: bootstrap and MinimalLoader are not exported components */
import { createElement, StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { setI18nReady } from './i18nBridge';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:system-ui;max-width:600px;margin:0 auto;"><h1>App failed to start</h1><p>Root element #root not found. Check index.html.</p></div>';
  throw new Error('Root element #root not found. Check index.html.');
}

/** Minimal loading shell: same look as index.html #root:empty so first paint is instant while App loads */
function MinimalLoader() {
  return createElement('div', {
    'aria-label': 'Loading',
    style: {
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #e2ddf5 0%, #eed5f2 25%, #f5d0e8 50%, #e8f4fc 85%, #bae6fd 100%)',
    },
  }, createElement('div', {
    style: {
      width: 40,
      height: 40,
      border: '3px solid rgba(255,255,255,0.8)',
      borderTopColor: '#8b7dd6',
      borderRadius: '50%',
      animation: 'aira-spin 0.8s linear infinite',
    },
  }));
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderError(el: HTMLElement, message: string, detail?: string) {
  const safeMessage = escapeHtml(message);
  const safeDetail = detail ? escapeHtml(detail) : '';
  el.innerHTML = `
    <div style="padding:2rem;font-family:system-ui;max-width:600px;margin:0 auto;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
      <h1 style="color:#b91c1c;margin:0 0 0.5rem;">Something went wrong</h1>
      <p style="color:#991b1b;margin:0 0 0.5rem;">${safeMessage}</p>
      ${safeDetail ? `<pre style="font-size:12px;overflow:auto;background:#fff;padding:1rem;border-radius:4px;">${safeDetail}</pre>` : ''}
      <p style="margin-top:1rem;"><button onclick="location.reload()" style="padding:0.5rem 1rem;cursor:pointer;">Reload Page</button></p>
      <p style="font-size:11px;color:#666;margin-top:1rem;">Tip: Check your connection or terminal.</p>
    </div>
  `;
}

const root = createRoot(rootEl);

(async function bootstrap() {
  // Paint loading shell immediately so user sees feedback while App + i18n load
  root.render(createElement(StrictMode, null, createElement(MinimalLoader)));

  await new Promise((r) => (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(r) : setTimeout(r, 0)));

  // Race the app import against a 10s timeout so we don't hang forever
  const timeoutPromise = new Promise<{ error: Error }>((_, reject) =>
    setTimeout(() => reject(new Error('App load timed out (server or network is slow).')), 10000)
  );

  const appPromise = Promise.race([
    import('./App'),
    timeoutPromise
  ]).catch((e) => ({ error: e }));

  const i18nPromise = import('./i18n').catch(() => null);
  const appResult = await appPromise;

  i18nPromise.then((i18nMod) => {
    if (i18nMod?.changeLanguage) setI18nReady(i18nMod.changeLanguage);
  });

  if (appResult && 'default' in appResult && appResult.default) {
    try {
      const App = appResult.default as ComponentType;
      root.render(createElement(StrictMode, null, createElement(App)));
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => { });
      }
    } catch (e) {
      const err = e as Error;
      const msg = err?.message ?? String(e);
      renderError(rootEl, 'Failed to load the app.', msg + (err?.stack ? '\n\n' + err.stack : ''));
      console.error('App bootstrap error:', e);
    }
  } else {
    const e = (appResult as { error: unknown })?.error;
    const err = e as Error;
    const msg = err?.message ?? String(e ?? 'Failed to load app');
    renderError(rootEl, 'Failed to load the app.', msg);
    console.error('App load error:', e);
  }
})();
