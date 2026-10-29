# Data Sources & License Attribution

ClawWords uses open-licensed corpora, graded vocabulary profiles, pronunciation dictionaries, and audio assets. Every non-legacy example sentence (`WORDS[50..]`) carries a verifiable provenance identifier in data (`examples[].source`, plus `examples[].zhSource` or `examples[].mt`).

---

## 1. English Example Sentences & Mandarin Translations

All non-legacy English example sentences (`WORDS[50..]`) are extracted verbatim by deterministic word-boundary scripts from the three open corpora below without AI generation, rewriting, or splicing. Words without an exact clean corpus match leave `examples: []`.

### 1.1 Tatoeba Corpus (`source: "tatoeba:<id>"`, `zhSource: "tatoeba:<id>"`)
- **Source**: [Tatoeba Project](https://tatoeba.org) (`eng_sentences_detailed.tsv.bz2`, `eng_sentences_CC0.tsv.bz2`, `cmn_sentences_detailed.tsv.bz2`, `eng-cmn_links.tsv.bz2` from [https://downloads.tatoeba.org/exports/](https://downloads.tatoeba.org/exports/))
- **License**: [Creative Commons Attribution 2.0 France (CC BY 2.0 FR)](https://creativecommons.org/licenses/by/2.0/fr/) (and [CC0 1.0 Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) for sentences in `eng_sentences_CC0.tsv.bz2`)
- **Attribution & Per-Sentence Lookup**:
  - Data derived from **Tatoeba (https://tatoeba.org)** and its community contributors (including CK, AlanF_US, Hybrid, Ergulis, Deniko, Amastan, Yorwba, Zifre, Fucongcong, GlossaMatik, Verdastelo9604, Crescendo, Muscidae, Aguilera, Martha, and other Tatoeba contributors).
  - Every Tatoeba English sentence records `source: "tatoeba:<sentence_id>"`, which resolves directly to its canonical Tatoeba page and contributor credit at `https://tatoeba.org/en/sentences/show/<sentence_id>`.
  - Aligned human Mandarin translations from Tatoeba record `zhSource: "tatoeba:<cmn_sentence_id>"` (`https://tatoeba.org/en/sentences/show/<cmn_sentence_id>`). Where original Tatoeba Mandarin sentences used Traditional Hanzi, deterministic script character conversion (`Traditional-Simplified`) was applied for script consistency.

### 1.2 English Wikinews (`source: "wikinews:<page_id>"`)
- **Source**: [English Wikinews](https://en.wikinews.org) (`enwikinews-latest-pages-articles.xml.bz2` from [https://dumps.wikimedia.org/enwikinews/](https://dumps.wikimedia.org/enwikinews/))
- **License**: [Creative Commons Attribution 2.5 Generic (CC BY 2.5)](https://creativecommons.org/licenses/by/2.5/)
- **Attribution & Per-Article Lookup**:
  - Sentences tagged `source: "wikinews:<page_id>"` come verbatim from English Wikinews articles contributed by Wikinews editors.
  - Each `<page_id>` resolves directly to its article and full revision/author history at `https://en.wikinews.org/?curid=<page_id>` (used page IDs include `9370`, `11421`, `18908`, `45584`, `52921`, `57769`, `59168`, `61383`, `81396`, `86720`, `120417`, `120677`, `122097`, `123568`, `128062`, `128078`, `131616`, `155278`, `189993`, `194159`, `197040`, `1390906`, `2845781`, `2931781`, `2963364`, `2969278`, `3049445`, `3049465`, `3052356`).

### 1.3 Project Gutenberg (`source: "gutenberg:pg<ebook_id>"`)
- **Source**: [Project Gutenberg](https://www.gutenberg.org)
- **License**: **Public Domain**
- **Books Indexed**:
  - `gutenberg:pg98` — Charles Dickens, *A Tale of Two Cities* (`https://www.gutenberg.org/ebooks/98`)
  - `gutenberg:pg1228` — Charles Darwin, *On the Origin of Species* (`https://www.gutenberg.org/ebooks/1228`)
  - `gutenberg:pg1342` — Jane Austen, *Pride and Prejudice* (`https://www.gutenberg.org/ebooks/1342`)
  - `gutenberg:pg35461` — Project Gutenberg eBook #35461 (`https://www.gutenberg.org/ebooks/35461`)

### 1.4 Machine-Translated Chinese Gloss Sentences (`mt: true`)
- Corpus sentences without an adopted Tatoeba human Mandarin translation are paired with an independent Simplified Chinese sentence translation generated specifically for that locked English sentence and explicitly marked `mt: true` in data (`examples[].mt`). No translations are copied from commercial dictionaries.

---

## 2. IELTS / CEFR Graded Wordlists & Word Frequency

### 2.1 Open Graded Vocabulary Profiles (`CEFR-J` + `Octanove C1/C2` + `NAWL`)
- **CEFR-J Vocabulary Profile v1.5** (`A1`–`B2`): Yukio Tono, Tokyo University of Foreign Studies; open release via [`openlanguageprofiles/olp-en-cefrj`](https://github.com/openlanguageprofiles/olp-en-cefrj) under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **Octanove Vocabulary Profile C1/C2 v1.0** (`C1`–`C2`): Octanove Labs (`openlanguageprofiles/olp-en-cefrj`), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **New Academic Word List (NAWL 1.0)**: Charles Browne, Brent Culligan & Joseph Phillips ([newgeneralservicelist.org](https://www.newgeneralservicelist.org/nawl-new-academic-word-list)), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **IELTS ↔ CEFR Mapping**: Aligned with the official Cambridge / IELTS CEFR correspondence (`A2` Foundation, `B1` Band 4.0–5.0, `B2` Band 5.5–6.5, `C1` Band 7.0–8.0, `C2` Band 8.5–9.0; basic `A1` excluded by default in [`src/config/lexicon.ts`](src/config/lexicon.ts)). Level metadata is stored strictly in data and never displayed in the learner UI.

### 2.2 Corpus Word Frequency
- **wordfreq 3.1.1**: Robyn Speer ([`rspeer/wordfreq`](https://github.com/rspeer/wordfreq), Luminoso Technologies), code under Apache-2.0 and frequency data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Used to compute English Zipf frequencies for global common-to-rare card ordering.

---

## 3. General American IPA, Definitions, Collocations & Audio

- **General American IPA**:
  - [`open-dict-data/ipa-dict`](https://github.com/open-dict-data/ipa-dict) (`en_US.txt`, MIT / Wiktionary CC BY-SA 3.0/4.0)
  - [CMU Pronouncing Dictionary (`cmudict`)](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) (Carnegie Mellon University, BSD-2-Clause)
- **Audio & Lexical Reference**:
  - [Word Atlas Open](https://github.com/designfuchen/word-atlas) ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)) — US pronunciation audio (`public/audio/us/*.mp3` and remote audio fallback) and cleaned Chinese sense / collocation cross-checking. (Word Atlas example sentences are not used.)
