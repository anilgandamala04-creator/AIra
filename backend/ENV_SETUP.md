# Backend environment setup

Create a `backend/.env` file (it is gitignored) with your API keys.

## OpenRouter (recommended)

To use [OpenRouter](https://openrouter.ai) for AI (chat, doubt resolution):

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_PROVIDER=openrouter
```

Optional:

- `OPENROUTER_API_URL` – defaults to `https://openrouter.ai/api/v1`
- `OPENROUTER_MODEL` – defaults to `meta-llama/llama-3.1-8b-instant`; use any [OpenRouter model ID](https://openrouter.ai/docs/models)
- `APP_ORIGIN` – e.g. `http://localhost:3001` (for referrer header)

## Other providers

- **Mistral:** `MISTRAL_API_KEY=...`, `MISTRAL_MODEL=mistral-small-latest`
- **Ollama (local):** `AI_PROVIDER=ollama`, `OLLAMA_BASE_URL=http://localhost:11434/v1`

## Timeouts & validation

- **Request timeout:** `AI_REQUEST_TIMEOUT_MS` (default `60000` ms; min 5000). Applies to LLaMA and Mistral calls.
- **Prompt length:** Max 32,000 characters; empty prompts/questions are rejected. See `docs/LLAMA_MISTRAL.md` for health and validation details.

After creating `.env`, restart the backend (`npm run dev` or `node dist/server.js`).
