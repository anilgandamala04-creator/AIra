/** App version (match package.json). */
export const APP_VERSION = '1.0.0';

/** Build identifier (e.g. from env or date). */
export const APP_BUILD = typeof import.meta.env?.VITE_APP_BUILD === 'string' ? import.meta.env.VITE_APP_BUILD : '';

/** Terms of Service URL. Replace with your actual ToS page. */
export const TERMS_OF_SERVICE_URL = '/terms';

/** Privacy Policy URL. Replace with your actual Privacy page. */
export const PRIVACY_POLICY_URL = '/privacy';
