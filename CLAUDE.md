# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Depression Detection Engine — an NLP platform that classifies social media comments (Normal/Mild/Severe depression risk) using a local DistilBERT model via ONNX Runtime and Transformers.js. It scrapes Reddit threads or accepts manual JSON input, runs inference locally, and displays per-user risk rankings.

## Architecture

```
SourceCode/
├── backend-node/       Express.js API server (port 8080)
│   ├── server.js       POST /analyze_post, GET /health
│   └── services/
│       ├── inputResolver.js   Reddit URL → comment array (axios + Reddit JSON API)
│       ├── modelPredictor.js  Loads ONNX model via @xenova/transformers, runs inference
│       └── analyzer.js        Orchestrates prediction, aggregates per-user risk scores
├── frontend/           React + TypeScript + Vite (port 5173)
│   └── src/
│       ├── services/api.ts    Calls backend /analyze_post
│       ├── components/        CommentTable, UserRiskPanel
│       └── types/index.ts     Shared TypeScript interfaces
└── model-onnx/         Local DistilBERT ONNX weights (tracked via Git LFS)
```

The model outputs labels `LABEL_0/1/2` mapped to Normal/Mild/Severe. Risk scores are computed as `LABEL_TO_RISK[label] * confidence`.

## Commands

```bash
# Install all dependencies (from repo root)
npm run install-all

# Start backend (port 8080)
npm run start-backend

# Start frontend dev server (port 5173)
npm run start-frontend

# Build frontend for production
npm run build-frontend

# Or run directly from each package:
cd SourceCode/backend-node && npm start       # or: npm run dev (nodemon)
cd SourceCode/frontend && npm run dev
```

## Environment Variables

Copy `SourceCode/.env.example` to `SourceCode/.env`. The backend loads it via dotenv from `../../.env` relative to the services directory. Key variables:

- `GEMINI_API_KEY` — Gemini API key (if external explanation features are added)
- `VITE_API_BASE_URL` — Frontend's backend URL (defaults to `http://localhost:8080`)

## Key Design Decisions

- **Local-only inference**: `env.allowRemoteModels = false` in modelPredictor.js — the ONNX model must exist at `SourceCode/model-onnx/`. No network calls for ML.
- **Git LFS**: `.onnx` files are tracked via LFS. Run `git lfs pull` after cloning to get model weights.
- **Reddit-only scraping**: inputResolver.js only supports Reddit URLs (appends `.json` to fetch comments). Other platforms require the JSON fallback input.
- **No test suite**: Neither backend nor frontend has tests configured.
