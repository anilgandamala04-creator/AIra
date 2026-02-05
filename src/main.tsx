import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:system-ui;max-width:600px;margin:0 auto;"><h1>App failed to start</h1><p>Root element #root not found. Check index.html.</p></div>';
  throw new Error('Root element #root not found. Check index.html.');
}

function renderError(el: HTMLElement, message: string, detail?: string) {
  el.innerHTML = `
    <div style="padding:2rem;font-family:system-ui;max-width:600px;margin:0 auto;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
      <h1 style="color:#b91c1c;margin:0 0 0.5rem;">Something went wrong</h1>
      <p style="color:#991b1b;margin:0 0 0.5rem;">${message}</p>
      ${detail ? `<pre style="font-size:12px;overflow:auto;background:#fff;padding:1rem;border-radius:4px;">${detail}</pre>` : ''}
      <p style="margin-top:1rem;"><button onclick="location.reload()" style="padding:0.5rem 1rem;cursor:pointer;">Reload page</button></p>
    </div>
  `;
}

(async function bootstrap() {
  let i18nLoaded = false;
  try {
    await import('./i18n');
    i18nLoaded = true;
  } catch (e) {
    renderError(rootEl, 'Failed to load translations.', String((e as Error)?.message ?? e));
    console.error('i18n load error:', e);
  }

  if (i18nLoaded) {
    try {
      const App = (await import('./App')).default;
      createRoot(rootEl).render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
    } catch (e) {
      const err = e as Error;
      const msg = err?.message ?? String(e);
      const isFirebaseConfig = /invalid-api-key|Missing environment|Firebase.*config/i.test(msg);
      const friendlyMessage = isFirebaseConfig
        ? 'Firebase is not configured correctly. In AIra/.env set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and other VITE_FIREBASE_* from your Firebase project (Project settings → Your apps → Web app).'
        : 'Failed to load the app.';
      renderError(rootEl, friendlyMessage, isFirebaseConfig ? undefined : msg + (err?.stack ? '\n\n' + err.stack : ''));
      console.error('App bootstrap error:', e);
    }
  }
})();
