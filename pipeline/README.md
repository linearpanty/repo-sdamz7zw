# ClawWords Illustration & Copy Production Pipeline

## Overview
To guarantee every word in `ClawWords` gets a vivid, memorable editorial illustration and crisp bilingual copy **without exceeding Claude's 5-hour usage quota**, production runs in **micro-batches of 5 words** following strict `WORDS` frequency/queue order.

## 3-Stage Division of Labor (`生图 -> 质检 -> 合格上线`)

1. **Stage 1: Creative Brief & Illustration Generation (`生图员 / image-generator`)**
   - Pick the next **5 pending words** via `node scripts/illus-pipeline.mjs status`.
   - Prepare each word's:
     - `sceneHook`: 2–3 word natural English collocation (e.g., `natural resource`, `gain access`, `hidden potential`, `smart method`, `appropriate attire`).
     - `sceneHookZh`: 4-character vivid Chinese phrase (`珍贵水源`, `获准通行`, `潜藏巨能`, `巧用杠杆`, `穿着得体`).
     - Two-tier examples: `examples[0]` (6–10 word everyday `i+1` sentence) + `examples[1]` (authentic Cambridge IELTS sentence).
   - Generate `4:5` New Yorker editorial ink-and-watercolor illustrations on warm cream paper (`#FAF6EE`) with **zero embedded text** and convert to `640x800` `.webp` (`public/illus/<id>.webp`).

2. **Stage 2: Independent Visual & Semantic QA (`质检员 / Claude QA`)**
   - Inspect all 5 generated illustrations + bilingual hooks in **one single compact English prompt** (minimizing token usage to stay well below Claude's 5-hour quota).
   - 4-Point Pass Criteria (must score `>= 8/10`):
     1. **Zero text/gibberish** in the artwork.
     2. **1-second semantic recognition**: a learner can immediately connect the visual action/contrast to the word's core meaning.
     3. **Style consistency**: warm cream background (`#FAF6EE`), expressive dark slate ink linework, terracotta (`#D97757`) & slate-blue (`#2D5A7B`) watercolor wash.
     4. **Copy & `i+1` quality**: natural 2–3 word collocation, accurate 4-char Chinese hook, and natural `i+1` example sentence.
   - Any image failing QA is regenerated once with a corrected visual prompt before release.

3. **Stage 3: Automated Gate & Live Deployment (`合格上线`)**
   - Run `node scripts/illus-pipeline.mjs verify <id1> <id2> ...` to update `pipeline/illus-ledger.json`.
   - Run `npm test && npm run lint && npm run build`.
   - Push to `origin/main` and deploy `dist/` to `origin/gh-pages`.
