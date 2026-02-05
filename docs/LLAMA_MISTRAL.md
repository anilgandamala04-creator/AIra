# LLaMA & Mistral Backend Integration

This document describes how the AIra backend integrates **LLaMA** (via Groq or OpenRouter) and **Mistral** for real-time AI processing across all application features.

## Overview

- **LLaMA**: Provided by Groq (fast inference) or OpenRouter (multi-model). Used when `model: 'llama'` or when Mistral is not configured.
- **Mistral**: Native Mistral API. Used when `model: 'mistral'` and `MISTRAL_API_KEY` is set.
- All AI requests go through the backend; the frontend calls `VITE_API_URL` (e.g. `http://localhost:5000`).

## AI Features and Endpoints

| Feature            | Frontend usage                    | Backend endpoint              | Model choice        |
|--------------------|-----------------------------------|-------------------------------|---------------------|
| **Chat**           | TeachingPage -> generateContent   | POST /api/generate-content    | User/settings       |
| **Doubt resolution** | doubtStore -> resolveDoubt     | POST /api/resolve-doubt       | User/settings/DOUBT_RESOLUTION_MODEL |
| **Notes**          | resourceStore -> generateContent | POST /api/generate-content    | User/settings       |
| **Mind map**       | resourceStore -> generateContent | POST /api/generate-content    | User/settings       |
| **Flashcards**     | resourceStore -> generateContent | POST /api/generate-content    | User/settings       |

- **Generate content** (chat, notes, mind map, flashcards): single prompt to single text response.
- **Resolve doubt**: question + context to structured JSON (explanation, examples, optional quiz).

## Timeouts

- **Default request timeout**: 60 seconds (AI_REQUEST_TIMEOUT_MS).
- **Configurable**: set `AI_REQUEST_TIMEOUT_MS` in `backend/.env` (milliseconds; minimum 5000).
- LLaMA (Groq/OpenRouter) and Mistral calls both use this timeout; overdue requests are aborted and return an error to the client.

## Validation

- **Prompt / question length**: Min 1 character (non-empty), max **32,000** characters (AI_PROMPT_MAX_LENGTH).
- Validation is applied in the backend (aiService and server) and frontend (aiApi).
- Invalid input returns **400** with a clear message (e.g. "Prompt cannot be empty", "Prompt exceeds maximum length (32000 characters)").

## Health Check

- **Endpoint**: GET /health
- **Response**: status, provider, models (llama, mistral), limits (maxPromptLength: 32000).
- This is a **configuration** health check (which providers are configured), not a live connectivity test to the AI APIs.

## Configuration

See **backend/ENV_SETUP.md** for OpenRouter, Groq, Mistral, Ollama, AI_PROVIDER, DOUBT_RESOLUTION_MODEL, and AI_REQUEST_TIMEOUT_MS.

## Error Handling

- **400**: Validation (empty or over-length prompt/question). Client should show the returned error message.
- **500**: Model/network failure. Client should show a generic failure message and allow retry.

## Summary

LLaMA and Mistral are integrated so that **all** AI features (chat, doubt resolution, notes, mind map, flashcards) use the same backend with consistent timeouts, validation, and health reporting for real-time AI processing.
