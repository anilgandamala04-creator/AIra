# AIra Backend

Express backend that powers AI capabilities using **LLaMA** (via Groq) and **Mistral** (via Mistral AI API).

## Models

- **LLaMA** – Groq API (fast inference). Set `GROQ_API_KEY`.
- **Mistral** – Mistral AI API. Set `MISTRAL_API_KEY`.

Optional fallbacks when Groq is not set: OpenRouter (`OPENROUTER_API_KEY`) or Ollama (`OLLAMA_BASE_URL`).

## Environment variables

### Quick Setup

Run the setup script to create `.env` file automatically:
```bash
npm run setup
```

### Manual Setup

Create a `.env` file in this directory:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLaMA | **Yes** |
| `MISTRAL_API_KEY` | Mistral API key | **Yes** |
| `FRONTEND_URL` | Comma-separated frontend URLs for CORS | Recommended |
| `AI_PROVIDER` | Provider: `openrouter` \| `ollama` (default: `openrouter`) | No |
| `OPENROUTER_MODEL` | OpenRouter model ID (default: `qwen/qwen-2.5-7b-instruct`) | No |
| `MISTRAL_MODEL` | Mistral model ID (default: `mistral-small-latest`) | No |
| `DOUBT_RESOLUTION_MODEL` | Model for doubt resolution: `llama` or `mistral` (default: `llama`) | No |
| `AI_REQUEST_TIMEOUT_MS` | Request timeout in milliseconds (default: 60000) | No |

## Run

```bash
npm install
npm run dev    # development (ts-node-dev)
npm run start  # build + run (tsc && node dist/server.js)
```

## Endpoints

- `GET /health` – Status and which models are configured (`llama`, `mistral`).
- `POST /api/resolve-doubt` – Body: `{ question, context }`. Uses LLaMA or Mistral per `DOUBT_RESOLUTION_MODEL`.
- `POST /api/generate-content` – Body: `{ prompt, model? }`. `model` is `llama` or `mistral` (default: `llama`).
