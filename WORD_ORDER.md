# Word introduction order

New cards are introduced by English word frequency, common first. The order is fixed, never shuffled per day, and never sorted alphabetically.

Due cards still come before unseen words. Inside both groups, selection walks `WORDS` in index order:

1. **Indices `0–49` (Legacy Core 50)**: The original 50 headwords preserved verbatim in their established frequency rank so existing `localStorage` (`clawwords.progress.v3`) histories remain 100% compatible.
2. **Indices `50..N-1` (Graded IELTS/CEFR Pool)**: Selected and ordered according to the centralized configuration in [`src/config/lexicon.ts`](src/config/lexicon.ts) (`LEXICON_CONFIG`).

## Centralized Configuration (`src/config/lexicon.ts`)

All three selection and ordering switches live in `LEXICON_CONFIG`:

- `wordlistSource` (default `'cefrj-octanove-nawl'`): Publicly verifiable open graded wordlists — **CEFR-J Vocabulary Profile v1.5** (`A1`–`B2`) + **Octanove Vocabulary Profile C1/C2 v1.0** (`C1`–`C2`) + **New Academic Word List (NAWL 1.0)**, mapped via the Cambridge / IELTS ↔ CEFR alignment.
- `includedLevels` (default `['A2', 'B1', 'B2', 'C1', 'C2']`): Excludes basic `A1` words by default while keeping `A2` through `C2`. Level tags exist strictly in data (`Word.level`) and are never displayed in the UI.
- `groupByLevel` (default `false`):
  - `false`: Global descending `zipf_frequency(word, "en")` order from common to rare across all included levels.
  - `true`: Grouped in `includedLevels` order, sorted by descending `zipf_frequency(word, "en")` within each level.

## Frequency Source & Non-Alphabetical Tie-Breaking

Ranks use `zipf_frequency(word, "en")` from [wordfreq](https://github.com/rspeer/wordfreq) **3.1.1** (Robyn Speer, Zenodo `https://doi.org/10.5281/zenodo.7199437`). A higher Zipf score is more common. When two post-legacy words share the exact quantized 2-decimal Zipf score, ties are broken deterministically by 32-bit FNV-1a hash of `id` rather than alphabetically, preventing alphabetical runs inside equal-Zipf buckets.

## First 15 new-word ids (`0–14`)

`available`, `access`, `approach`, `challenge`, `benefit`, `authority`, `aware`, `capacity`, `appropriate`, `capable`, `affect`, `accurate`, `achieve`, `assume`, `category`
