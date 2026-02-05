#!/usr/bin/env node
/**
 * Opens the app in the default browser.
 * Run this after "npm run dev" if the browser did not open automatically.
 * Default URL: http://localhost:5173 (change PORT below if your dev server uses another port)
 */
const { exec } = require('child_process');
const PORT = process.env.VITE_PORT || 5173;
const url = `http://localhost:${PORT}`;

const command = process.platform === 'win32'
  ? `start ${url}`
  : process.platform === 'darwin'
    ? `open "${url}"`
    : `xdg-open "${url}"`;

exec(command, (err) => {
  if (err) console.error('Could not open browser:', err.message);
  else console.log('Opening:', url);
});
