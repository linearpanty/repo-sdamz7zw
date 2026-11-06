# ClawWords Illustration & Copy Production Pipeline

## Overview
Every word in `ClawWords` goes through a strict **3-Stage Production & Multimodal QA Pipeline** in **micro-batches of 5 words** following `WORDS` queue order. Both image generation (`image-generator`) and multimodal QA (`read_file` visual inspection) run natively inside Antigravity with **zero consumption of external Claude 5-hour quotas**.

## 3-Stage Division of Labor (`生图 -> 严苛质检(>=9.0分) -> 合格上线`)

1. **Stage 1: Creative Brief & Illustration Generation (`生图员 / image-generator`)**
   - Pick the next **5 pending words** via `node scripts/illus-pipeline.mjs status`.
   - Prepare each word's:
     - `sceneHook`: 2–3 word natural English collocation.
     - `sceneHookZh`: 4-character vivid Chinese phrase.
     - Two-tier examples: `examples[0]` (6–10 word everyday `i+1` sentence) + `examples[1]` (authentic Cambridge IELTS sentence).
   - Generate `3:4` / `4:5` New Yorker editorial ink-and-watercolor illustrations on warm cream paper (`#FAF6EE`) and convert to `640x800` `.webp` (`public/illus/<id>.webp`).
   - **Mandatory Composition Rule**: Keep the **top 18–20% of the canvas** as clean, open warm cream paper (`#FAF6EE`) so the top-centered bilingual capsule header never collides with dark ink or subjects.

2. **Stage 2: Strict Multimodal Visual & Semantic QA (`严苛质检员 / Antigravity Multimodal Vision`)**
   - Inspect every final `640x800` `.webp` image in `public/illus/` directly via `read_file`.
   - **6-Point Scoring Rubric (Must score `>= 9.0 / 10` to pass; `< 9.0` is immediately rejected and regenerated)**:
     1. **Visual Focal Point == Word Meaning (80% Rule)**: If you cover the word, the #1 visual focal point occupying 80% of the frame must immediately evoke the word's core meaning itself—never let a large human portrait, face, or bystander torso hijack the center of the frame (e.g., `process` must focus on the 3-stage transformation flow, not a smiling baker's portrait).
     2. **Zero text/gibberish** anywhere in the artwork.
     3. **Flawless physical & narrative logic** (no duplicate shadows, no inverted scales, no weird pipes).
     4. **Top 25–28% cream paper breathing room** so the top-centered bilingual header sits cleanly.
     5. **1-second semantic recognition** of the target word's core meaning.
     6. **House style consistency**: warm cream paper (`#FAF6EE`), expressive dark slate ink outlines (`#1C1917`), terracotta (`#D97757`) & slate-blue (`#2D5A7B`) watercolor wash.

3. **Stage 3: Automated Gate & Live Deployment (`合格上线`)**
   - Run `node scripts/illus-pipeline.mjs verify <id1> <id2> ...` to update `pipeline/illus-ledger.json`.
   - Run `npm test && npm run lint && npm run build`.
   - Push to `origin/main` and deploy `dist/` to `origin/gh-pages`.
