const ALLOWED_ORIGINS = [
  'https://airaedtech.web.app',
  'https://airaedtech.firebaseapp.com',
  'https://aira-education-c822b.web.app',
  'https://aira-education-c822b.firebaseapp.com',
  'https://aira-learning-a3884.web.app',
  'https://aira-learning-a3884.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  if (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.dev')) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

export function setCors(res: { setHeader: (k: string, v: string) => void }, origin?: string) {
  const allow = isAllowedOrigin(origin);
  res.setHeader('Access-Control-Allow-Origin', allow && origin ? origin : (origin || ALLOWED_ORIGINS[0]));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}
