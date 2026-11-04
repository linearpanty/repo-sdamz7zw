# ClawWords v4.1 — STEP 2: exam example sentences, full report (v4 report regenerated on the v4.1 outputs; v4.1 changes: see REPORT.md)

Directory `~/clawwords-feedback/examples-2026-11-04-v4.1/` (copy of `examples-2026-11-03-v4/` + v4.1 patch). Rebuilt end to end by `./run_all.sh` (log `run.log`) from the read-only inputs: `../candidate-2026-11-04-v4.1/` (v4.1 wordlist, section_index, blocks/pickles, vendored word list), `../v3-inputs/v2src/clawwords.md`, `../examples-2026-11-03-exam/` (v3 examples, only for the comparison and the re-audit row lookup), `../reaudit-2026-11-03/` (issues.csv and its work scripts). The v3 STEP 2 scripts were copied into `scripts/` and changed; nothing was edited by hand in any output. Every decision is a rule in `scripts/` or an entry of the versioned review files `sense_review.json` (v4.1-2026-11-04.1) and `ocr_rules.json` (v4.1-2026-11-04.1).

## 1. Coverage

| | v4 | v3 |
|---|---|---|
| cards in the wordlist | 2557 | 2561 |
| cards with a primary | **2555** | 2559 |
| cards in missing.csv | **2** | 2 |
| alternates | 4956 (alt1 2527, alt2 2429) | 4983 |
| rows in examples.csv | 7511 | 7542 |
| cards with 3 / 2 / 1 / 0 rows | 2429 / 98 / 28 / 2 | 2448 / 87 / 24 / 2 |
| rows with ocr_fixed=1 (primaries) | 97 (17) | 64 (5) |
| verification failures (all rows) | 0 | 0 |

Missing (no usable sentence; nothing is shortened or invented):

| rank | card | reason |
|---|---|---|
| 2407 | universe | 11 body sentence(s) with the word, none usable: too long (9); short unpunctuated line followed by a capitalised line (2); does not start with a capital (1); review (1) |
| 2419 | sequence | 10 body sentence(s) with the word, none usable: too long (8); odd short word 'tht' (1); opening quote without closing (1); probable OCR misread 'nomes' (1) |

New cards of v4: May (3 rows) and ton (2 rows). Cards removed in v4 (stable, latin, plain, oppose, english-speaking) have no rows.

## 2. Changes vs v3

`v3_status`: **same** = identical sentence, role and citation in the v3 examples.csv for this card; **changed** = the card had a v3 row in this role, with another sentence or citation; **new** = no v3 row in this role (new card or a slot v3 left empty).

| role | same | changed | new |
|---|---|---|---|
| primary | 1872 | 681 | 2 |
| alt1 | 1640 | 882 | 5 |
| alt2 | 1338 | 1082 | 9 |

Why the 681 changed primaries changed (first matching reason):

| reason | primaries | examples |
|---|---|---|
| re-scored: v4 primary penalties (context opening, US spelling, sense penalties) preferred another sentence | 206 | child, student, language, tree, seem, room, major, market |
| v3 sentence is now another card's primary (uniqueness) | 137 | information, build, local, suggest, development, hour, environment, allow |
| v4 review: context-dependent, never primary | 121 | provide, develop, ask, result, talk, type, site, support |
| same sentence, citation corrected (v4 section_index, W1) | 108 | cause, space, range, special, factor, issue, hand, member |
| rejected by the re-audit / 11-01 guard | 58 | building, interesting, reason, sort, cover, demand, player, mountain |
| rejected by a new v4 quality/sense rule (next text starts in lowercase) | 31 | write, transport, service, ocean, distance, university, target, possibility |
| rejected in the v4 primary review (defect) | 6 | bike, organise, satellite, character, chicken, pour |
| v3 sentence no longer a candidate (v4 segmentation/token assignment or card token moved) | 6 | direct, rural, assignment, barrier, duty, mexico |
| rejected by a new v4 quality/sense rule (review) | 3 | college, educational, basically |
| same source sentence, text repaired by the pipeline (label/OCR/hyphen) | 3 | concert, clever, disappearance |
| rejected by a new v4 quality/sense rule (doubled word 'in in') | 1 | september |
| rejected by a new v4 quality/sense rule (closing quote without opening) | 1 | historian |

## 3. Pipeline fixes (scripts)

| step | change vs v3 |
|---|---|
| s01 | v3 s00/s01 (copy of the builder) replaced: reads the v4 per-token card assignment `card_tokens_v4.pkl` + `staged_v4.pkl`; asserts the per-card counts and forms reproduce v4 `final_wordlist.csv` / `card_forms.csv` exactly (0 mismatches). |
| s02 | uses the exact v4 spaCy blocks (`blocks_v4.jsonl`) and v4 `section_index` (real-heading citations, GT rubric lines non-body, speaker labels stripped); de-hyphenation follows the v4 W5 decision per line (hyph_joined / hyph_kept / dash_space) instead of v3's own guess; new structural rejects: **next text starts in lowercase** (a stray full stop cut the sentence: building, assume, lizard, engineering), **glossary/footnote lines** (`* term: gloss`), **heading fused with a one-letter word** ('Stepwells' + 'A millennium ago'); the W4 '.?' residue right after a sentence end is cited and removed as an OCR fix; reviewed line-level OCR fixes (`ocr_rules.json` fix_rules). |
| textfix | new section_index fix types re-applied word by word: end_punct_quote, g_for_q (qanat), asterisk (footnote markers, 'Lego*' -> 'Lego'), digit1_for_I, II_for_ll (you'll). |
| quality | vendored word list (no system path, sha256 checked); **comma splice** (', What is', ', It doesn't', ', You'll', ', Laughter has'); 'Especially/Like how/Such as' fragment openers; **doubled words** ('in in', 'I I'); doubled end punctuation; non-Latin garbage letters; stray hyphen after a function word ('is-said'); lowercase l in an acronym ('AlS'); OCR-garbled names one letter from a name printed >= 3 times ('Lcuador', 'Treland'); misspellings one letter from a very common word. |
| s03 | **re-audit guard**: every must-fix v3 sentence is rejected for its card (for all cards when the defect is in the text), should-fix sentences are 'soft' rejects (last-resort primary only), optional ones penalised; same guard for the 11-01 audit sentences; sense-rule types reject_forms / require_forms / penalty_regex / penalty_pos; US spelling feature; PERSON-name tokens rejected on lowercase cards ('Giel Ton', 'Whendee Silver'); subordinate-clause test skips a leading And/But/Even ('And even if ... '). |
| s04 | **primary-only penalties** for context-dependent openings (pronoun/demonstrative -30, back-reference/connective -20, dialogue opener -10); US spelling on a British card -25; `no_primary` list from the review; `pin_primary`; swap logic avoids no_primary sentences; `v3_status`; `ocr_fixes.csv`. |
| s05 | checks C1-C7 (below), with a word-level verifier that every sentence/sentence_raw difference is a documented fix. |
| s06 | systematic real-word OCR scan (confusion set + clawwords.md bigrams, from the re-audit's script). |
| s07 | fragment/splice/context flagger over all primaries (and alternates) -> `primary_scan.csv`. |
| s08 / s09 | re-audit mapping; regression (re-audit prechecks, 11-01 map, v3 rejects, targeted checks). |

Sense rules added (sense_review.json card_rules): demand (no 'demanding'), sight (no 'sight' for site), wales (no 'New South Wales'), mine (gold mine / verb penalised), tonne (no 'tons'), shopping (place/object modifier penalised); stable and latin are no longer cards.

## 4. Re-audit resolution (`reaudit_mapping.csv`, all 350 rows + the 5 old 11-01 rows)

Statuses: fixed (reviewed OCR fix, or a card-level example item now satisfied), fixed-by-pipeline (the defect is gone through a STEP 1/STEP 2 rule: label stripped, punctuation, qanat, hyphen, citation, wordlist rule), replaced (the v3 sentence is no longer used for that card), deferred, not-applicable (card removed in v4). The re-audit `row` is the file line of the v3 examples.csv (header = line 1); every row's card name matches.

| severity | rows | fixed | fixed-by-pipeline | replaced | deferred | not-applicable |
|---|---|---|---|---|---|---|
| must-fix | 67 | 6 | 13 | 46 | 0 | 2 |
| should-fix | 155 | 0 | 20 | 122 | 6 | 7 |
| optional | 128 | 0 | 2 | 80 | 46 | 0 |

**Must-fix: 65 of 67 resolved; 2 not-applicable (cards stable and latin were removed from the v4 wordlist — not counted as fixed); 0 deferred.** No must-fix sentence is used again for its card unless repaired (OCR fix / label strip / punctuation) or its only defect was the citation; no sentence-level must-fix defect (OCR, garble, fragment, splice) is used by any other card (guard scope "*").

Must-fix rows that are not "replaced" (the sentence is kept, repaired or re-cited):

| # | card | status | note |
|---|---|---|---|
| 1 | (system) section_index | fixed-by-pipeline | STEP 1 rule W1a/W1b: book 8 L30236-30279 body labels {('2', '1'): 24}; book 12 L56831-56836 {('6', '4'): 6}; all-book scan: page-header-beats-heading spans = 0 |
| 3 | accuracy | fixed | same source sentence, repaired (alt2, ocr_fixed=1): v3 "This is the kind of accuracy that AlS scientists' research is bringing" -> v4 "This is the kind of accuracy that AIS scientists' resea |
| 12 | claim | fixed-by-pipeline | citation corrected by STEP 1 W1 (v4 section_index): b8 T1 listening Part 4 L30258-30259 -> b8 T2 listening Part 1 L30258-30259; text unchanged (primary) |
| 15 | concert | fixed | same source sentence, repaired (primary, ocr_fixed=1): v3 'I think I heard something about a plan to replace the existing concert' -> v4 'I think I heard something about a plan to replace th |
| 16 | conflict | fixed-by-pipeline | citation corrected by STEP 1 W1 (v4 section_index): b12 T7 listening Part 1 L56831-56831 -> b12 T6 listening Part 4 L56831-56831; text unchanged (alt1) |
| 22 | department | fixed-by-pipeline | citation corrected by STEP 1 W1 (v4 section_index): b12 T7 listening Part 1 L56831-56832 -> b12 T6 listening Part 4 L56831-56832; text unchanged (primary) |
| 25 | disappearance | fixed | same source sentence, repaired (primary, ocr_fixed=1): v3 'The effect of global warming on rainfall and other weather patterns ma' -> v4 'The effect of global warming on rainfall and other w |
| 26 | electronic | fixed-by-pipeline | same source sentence, repaired (alt2, ocr_fixed=0): v3 'And the stateof-the-art electronic sound and lighting systems have bee' -> v4 'And the state-of-the-art electronic sound and lighting  |
| 29 | friendly | fixed-by-pipeline | same source sentence, repaired (alt1, ocr_fixed=0): v3 "Speaker 2 (Friend): Yeah, there's a lively atmosphere and the waiters " -> v4 "Yeah, there's a lively atmosphere and the waiters are r |
| 33 | incredible | fixed-by-pipeline | same source sentence, repaired (alt1, ocr_fixed=0): v3 'Speaker 1 (Woman): Oh, the views would be incredible from up there.' -> v4 'Oh, the views would be incredible from up there.' |
| 35 | insurance | fixed-by-pipeline | citation corrected by STEP 1 W1 (v4 section_index): b8 T1 listening Part 4 L30257-30258 -> b8 T2 listening Part 1 L30257-30258; text unchanged (primary) |
| 40 | latin | not-applicable | card 'latin' removed in v4 (STEP 1); not counted as fixed |
| 44 | maintain | fixed-by-pipeline | same source sentence, repaired (alt2, ocr_fixed=1): v3 'Do you think you II maintain the contact now?' -> v4 "Do you think you'll maintain the contact now?" |
| 45 | memory | fixed-by-pipeline | same source sentence, repaired (alt1, ocr_fixed=0): v3 "Speaker 1 (Woman Carer): So recently I've noticed she's started to hav" -> v4 "So recently I've noticed she's started to have quite ba |
| 46 | message | fixed | same source sentence, repaired (alt2, ocr_fixed=1): v3 'The solution was to get a message to Voyager I to instruct it to use s' -> v4 'The solution was to get a message to Voyager 1 to instr |
| 47 | millimetre | fixed-by-pipeline | STEP 1 rule W6: v4 rank 1919, 15 tokens/8 books, display 'millimetre', aliases 'millimeter|mm'; forms millimetres:7|mm:4|millimetre:3|millimeters:1; passes 10x3: True |
| 48 | millimetre | fixed-by-pipeline | STEP 1 rule W6: v4 rank 1919, 15 tokens/8 books, display 'millimetre', aliases 'millimeter|mm'; forms millimetres:7|mm:4|millimetre:3|millimeters:1; passes 10x3: True |
| 53 | rural | fixed | same source sentence, repaired (alt1, ocr_fixed=1): v3 'Where I lived in Lcuador was a very rural area.' -> v4 'Where I lived in Ecuador was a very rural area.' |
| 58 | stable | not-applicable | card 'stable' removed in v4 (STEP 1); not counted as fixed |
| 64 | upper | fixed | same source sentence, repaired (alt1, ocr_fixed=1): v3 'They returned many times to explore further, ond on an independent tri' -> v4 'They returned many times to explore further, and on an  |
| 67 | worry | fixed-by-pipeline | citation corrected by STEP 1 W1 (v4 section_index): b8 T1 listening Part 4 L30275-30275 -> b8 T2 listening Part 1 L30275-30275; text unchanged (alt2) |

The 5 unfixed 11-01 must-fix rows:

| card | v3 row | status | v4 row now in that role |
|---|---|---|---|
| suggestion | 3020 | replaced | primary: "There are just a few suggestions I'd like to make." |
| stand | 1716 | replaced | alt1: 'The 28-year-old already stands out in the rarefied world of blindfold chess.' |
| attention | 1129 | replaced | alt2: 'So, maybe I should mention a particular way that nanotechnology is used, to focu' |
| lunch | 2574 | replaced | alt1: 'Do you run a lunch club in the village for elderly people?' |
| risk | 1227 | replaced | alt1: "There's also the risk of introducing new diseases." |

### Should-fix and optional

Should-fix: 142 addressed (fixed 0, fixed-by-pipeline 20, replaced 122), **6 deferred**, 7 not-applicable (removed cards). Optional: 82 addressed, **46 deferred** (optional rows only get a score penalty; when the flagged sentence is still the best eligible one it stays).

Named should-fix items: qanat (vertical/straightforward/interval): fixed by g_for_q or replaced; tonne: no tons (rule); analyse/ageing: British spelling (US spelling penalty; 0 British-display primaries use a US form); asterisk residue (knowledge/journal/spirit/Lego*): stripped as a documented OCR clean-up (ocr_fixed=1) or the row replaced, 0 asterisks left; percent: displayed "per cent", every percent primary shows "per cent"; thin cards: see section 7.

**All deferred re-audit rows** (none is claimed resolved):

| # | card | severity | reason |
|---|---|---|---|
| 90 | coin | should-fix | wordlist-level, deferred in STEP 1: noun and verb of one lemma share a card (fixed inflection rule); 'coined' (1-2 tokens) does not change the card. v4 rank 1818, 16 tokens/10 books, display 'coin |
| 95 | counter | should-fix | wordlist-level, deferred in STEP 1: noun and verb of one lemma share a card (fixed inflection rule); the card schema has no sense split. v4 rank 1779, 17 tokens/7 books, display 'counter' |
| 101 | demand | should-fix | wordlist-level, deferred in STEP 1: 'demanding' (7 tokens) is VERB-tagged by spaCy, so V10/V16 (adjectival forms) do not apply; separating it needs a new adjective rule for -ing forms that could m. Ex |
| 118 | follower | should-fix | v4: 3 rows from 1 text(s); only 5 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 130 | indian | should-fix | v4: 1 rows from 1 text(s); only 1 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 131 | indian | should-fix | same sentence still used as primary: card has no other eligible sentence (re-audit should-fix fallback) |
| 226 | allocate | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 230 | archaeology | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 242 | centre | optional | wordlist-level, deferred in STEP 1: 'centred' is an inflection of the verb centre, which shares the card (fixed rule). v4 rank 56, 189 tokens/18 books, display 'centre', aliases 'center' |
| 244 | chinese | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 245 | cloud | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 247 | column | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 249 | consumption | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 250 | cotton | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 256 | east | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 258 | environmentally | optional | v4: 2 rows from 2 text(s); only 3 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 259 | equip | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 260 | estate | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 263 | expression | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 266 | father | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 268 | fight | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 278 | highlight | optional | v4: 1 rows from 1 text(s); only 1 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 280 | hugely | optional | v4: 1 rows from 1 text(s); only 1 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 282 | initial | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 284 | interest | optional | wordlist-level, deferred in STEP 1: 1 stray 'interested' token tagged VERB stays with interest (V10 needs a majority); not worth a special case. v4 rank 286, 87 tokens/18 books, display 'interest' |
| 286 | investment | optional | same sentence still used as primary: optional: score penalty only, still the best eligible sentence |
| 287 | january | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 288 | joint | optional | v4: 1 rows from 1 text(s); only 1 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 289 | knit | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 291 | lay | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 295 | makeup | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 298 | meaning | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 299 | microbe | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 302 | moral | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 305 | occasion | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 306 | occupation | optional | v4: 2 rows from 2 text(s); only 2 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 311 | prevention | optional | v4: 2 rows from 1 text(s); only 2 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 312 | productive | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 314 | property | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 317 | reason | optional | wordlist-level, deferred in STEP 1: 'reasoned' is an inflection of the verb reason, which shares the card (fixed rule). v4 rank 135, 129 tokens/18 books, display 'reason' |
| 322 | safely | optional | v4: 2 rows from 2 text(s); only 2 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 327 | sporting | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |
| 328 | sporting | optional | v4: 2 rows from 2 text(s); only 2 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 332 | switch | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 336 | television | optional | v4: 2 rows from 2 text(s); only 2 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 338 | tidal | optional | v4: 3 rows from 2 text(s); only 5 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 340 | tourism | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 343 | typically | optional | same sentence still used as alt2: optional: score penalty only, still the best eligible sentence |
| 345 | varied | optional | v4: 2 rows from 2 text(s); only 3 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 347 | victim | optional | v4: 1 rows from 1 text(s); only 1 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 348 | warship | optional | v4: 3 rows from 1 text(s); only 5 distinct eligible sentence(s) for this card (the others are > 25 words, fragments, garbled, or other cards' primaries); no sentence is invented |
| 349 | wildlife | optional | same sentence still used as alt1: optional: score penalty only, still the best eligible sentence |

## 5. Primary scan and context-dependent primaries (`primary_scan.csv`)

Rule flags over all primaries (s07), then reading. Read in the v4 review: every flagged primary, every primary whose sentence changed vs v3 (iterated until no unread changed primary was left) and a random sample of 300 of the 1,150 unchanged primaries that the v3 review had not read.

| result | entries |
|---|---|
| not flagged | 1591 |
| read: kept | 953 |
| read: never primary (context-dependent; may be an alternate) | 328 |
| read: rejected for all cards (pipeline chose another sentence) | 16 |
| read: context-dependent, kept only because the card has no other eligible sentence | 11 |
| read: rejected for this card | 2 |

Review decisions in sense_review.json: reviewed_ok_v4 991, no_primary (context-dependent, may still be an alternate) 328, rejects for every card (fragments, garbles, fillers, glued headings) 18. Primary flag counts: {'short': 154, 'ends_weak': 74, 'comma_capital': 14, 'question': 26, 'opens_conj': 16, 'opens_dialogue': 14, 'opens_context': 10, 'opens_backref': 8}.

**Primaries opening with It/This/They/These/That/He/She/Such: 10** (re-audit: 173). With the re-audit's wider regex (also And/But/So/Or/Because/Which/Those/There, which counts existential "There is/are"): 144 (v3: 173). Remaining ones and why:

| card | sentence | why it stays |
|---|---|---|
| educational | It was interesting to see the educational skills the children were developing by doing origami. | read and kept in the review (dummy/time subject, or a thin card whose sentence is otherwise self-contained) |
| compete | It helps that lecturers speak clearly, don't have to compete with background chatter, and say much the same th | read and kept in the review (dummy/time subject, or a thin card whose sentence is otherwise self-contained) |
| foundation | This year we've identified the foundations of an ancient bridge. | read and kept in the review (dummy/time subject, or a thin card whose sentence is otherwise self-contained) |
| derive | This means a widespread reintroduction would involve existing or new hybrid strains derived from resistant, ge | no other eligible sentence for this card |
| highlight | They had a video with all the highlights of the festival at a stand in the lobby to the library, so I heard th | no other eligible sentence for this card |
| cyclist | It attracted huge numbers of cyclists where previously there were hardly any. | no other eligible sentence for this card |
| invisible | It is probable that many undiagnosed children exist in the education system with 'invisible' disabilities. | read and kept in the review (dummy/time subject, or a thin card whose sentence is otherwise self-contained) |
| victim | He believes the perennial theme of women as victims in stories like Little Red Riding Hood explains why they c | read and kept in the review (dummy/time subject, or a thin card whose sentence is otherwise self-contained) |
| abundance | It's not surprising then, that the Aborigines linked this abundance to the new creatures they witnessed. | no other eligible sentence for this card |
| feat | This has been the decade of AI, with one astonishing feat after another. | read and kept in the review (dummy/time subject, or a thin card whose sentence is otherwise self-contained) |

Cards whose primary is a sentence read as context-dependent, kept only because the card has no other eligible sentence (11): skyscraper ("Part two of the book begins with a discussion of the economi..."); explorer ("And quite early on he knew he wanted to become an explorer w..."); calorie ("Did you have any idea how many calories they contain?..."); derive ("This means a widespread reintroduction would involve existin..."); upper ("Yet in museums, fine period rooms give only an image of the ..."); highlight ("They had a video with all the highlights of the festival at ..."); treasure ("I guess he treasures things like first editions and other ra..."); cyclist ("It attracted huge numbers of cyclists where previously there..."); canoe ("As trees became scarce and they could no longer construct wo..."); abundance ("It's not surprising then, that the Aborigines linked this ab..."); pile ("For example, Ames observed bears putting objects in piles an...").

Sample result (honest residual estimate): in the random sample of 300 unchanged, previously unread primaries, ~48 were judged context-dependent mid-sentence (e.g. "the selection of those", "In short, they ...") and 1 had an OCR error ('workd'); all of them were demoted/rejected. The ~850 unchanged, unread primaries outside the sample were not read individually: by the same rate roughly 15% of them (~130) may still depend on context in a milder way (unresolved "they", "these X" mid-sentence) and ~0.3% may carry an undetected OCR misread. These are should-fix level, not must-fix.

## 6. OCR fixes (`ocr_fixes.csv`, `ocr_rules.json`)

97 rows have ocr_fixed=1; each lists the fix types, sentence_raw (before), sentence (after) and the evidence. Fix types: {'watermark_COM': 1, 'asterisk': 5, 'Id_to_Id': 1, 'pattern_fix': 5, 'inline_Q_marker': 38, 'end_punct_quote': 2, 't_for_f': 3, 'midsentence_If_In': 2, 'II_for_ll': 1, 'Al_to_AI': 25, 'reviewed_fix': 8, 'kiln': 1, 'L_to_I': 1, 'digit1_to_a': 2, 'g_for_q': 2}.

Reviewed line-level fixes (fix_rules; only unambiguous single-word misreads with the correct form attested):

| id | line | before -> after | evidence |
|---|---|---|---|
| F1 | 30697 | concert half -> concert hall | fixed collocation 'concert hall'; the next lines say 'replace the existing concert hall with a larger one' (re-audit #15) |
| F2 | 7346 | playing a port in -> playing a part in | idiom 'play a part in'; same passage b5 GT-B p124-125 (re-audit #25) |
| F3 | 7310 | every port of the -> every part of the | 'every part of the globe' (re-audit #30) |
| F4 | 7356 | ond on -> and on | re-audit #64 |
| F5 | 7911 | Lcuador -> Ecuador | Ecuador is printed correctly in the same talk (re-audit #53) |
| F6 | 10953 | AlS -> AIS | Australian Institute of Sport, 'AIS' elsewhere in the passage (re-audit #3) |
| F7 | 34824 | Voyager I  -> Voyager 1  | same passage prints 'Voyager 1' (L34924) (re-audit #46) |
| F8 | 2057 | what is-said -> what is said | re-audit #28 |
| F9 | 44408 | rate it you pay -> rate if you pay | conditional 'a discounted rate if you pay every month'; 'it you pay' is ungrammatical (11-04 re-audit must-fix discount 5929) |
| F10 | 28448 | lines of it you work -> lines of if you work | '... along the lines of if you work hard enough, you can do almost anything' (L28448-28449); found by the v4.1 corpus scan for 'it you' (2 body hits, both misreads) |

Not repaired, sentence avoided instead (15 new reject patterns): `\briver temps\b` ('temps' for 'Thames' (transcription error; not repaired: the original wording is a guess)); `\bhigh vise\b` ('high vise' for 'high-vis' (11-01 must-fix, re-audit #52; not repaired: hi-vis/high-vis is a guess)); `\bgoverment\b` (source misspelling 'goverment' (re-audit #40)); `\bthing weren't\b` (source error 'thing' for 'things' (re-audit #66)); `\bdon't ve\b|\bovate\b|\beative\b|\bvironment\b` (column-crop garble ('ve' for 'have', 'ovate' for 'innovate') (re-audit #56)); `\bphone I I\b` (garbled 'phone I I wanted' (re-audit #4)); `\bparallax angle would be very difficult to determine\b` (corrupt source line (OCR line duplication, states the opposite of the passage) (re-audit #6)); `\btoday's value of methods in accuracy\b` (garbled across a page break (re-audit #2)); `\bcome up with creative new I\b` (two speaker turns merged, words lost (re-audit #18)); `\bweck\b` ('weck' for 'week' (OCR e->c; found by the v4 real-word scan)); `\bTreland\b` ('Treland' for 'Ireland' (OCR I->T; found by the v4 real-word scan)); `\buncovered the sight of\b` ('sight' for 'site' (homophone error in the source; found by the v4 real-word scan, re-audit #54)); `\bcrossbar that be familiar\b` (words lost in the source ('that be familiar with today'; found by the v4 real-word scan)); `\bcarly\b` ('carly' for 'early' (OCR e->c; found in the v4 primary scan and the real-word scan)); `\bworkd\b` ('workd' for 'world' (OCR; found in the v4 primary sample review)).

Real-word scan (s06) over all 7511 selected sentences: 289 candidates, all read: {'not an error (reviewed)': 289}. Confirmed misreads found by the scan and the review (weck, Treland, sight-for-site, 'that be familiar', carly, workd) became reject patterns and those sentences are gone.

## 7. Verification (`verification.json`)

| check | rows | failures | result |
|---|---|---|---|
| C1 verbatim vs clawwords.md after documented normalisations | 7511 | 0 | PASS |
| C2 8-25 words | 7511 | 0 | PASS |
| C3 is_body=1 for every cited line | 7511 | 0 | PASS |
| C4 card form present | 7511 | 0 | PASS |
| C5 no speaker label | 7511 | 0 | PASS |
| C6 no bad end punctuation | 7511 | 0 | PASS |
| C7 citation consistent with v4 section_index | 7511 | 0 | PASS |

All other checks of s05 (quality.hard re-run on every row, unique primaries, <= 2 alternates, page-break splices, lettered lists, GT part 0, bee/being, -ing verbal use): failures 0. Noise lines skipped inside cited ranges: {'q_marker': 104, 'watermark': 3, 'page_number': 5}.

### Regression (required fix 8)

Re-audit `prechecks.py` (its check section copied at run time, paths adapted) — v3 count -> v4 count:

| precheck | v3 | v4 |
|---|---|---|
| ends_on_function_word | 117 | 122 |
| length_out_of_8_25 | 26 | 29 |
| ocr_fixed_rows | 64 | 97 |
| ocr_suspect_pattern | 62 | 61 |
| part_ne_nearest_heading | 478 | 493 |
| passage_question_sentence | 49 | 47 |
| passage_row_after_Questions_heading | 680 | 692 |
| primary_starts_with_anaphor_or_conj | 173 | 144 |
| punctuation_glitch | 5 | 0 |
| raw_not_verbatim_at_lines | 11 | 12 |
| rubric_like_text | 6 | 3 |
| speaker_label_in_sentence | 8 | 0 |
| test_ne_nearest_heading | 80 | 76 |

Notes: speaker_label 8 -> 0, punctuation_glitch 5 -> 0. The remaining prechecks counts are heuristics the re-audit itself classed as mostly false positives: raw_not_verbatim only skips lines of the form "Q31" (rows citing a page-number line or a "Q9 & 10" marker line between two sentence lines fail it; s05 C1 checks the same rows with the documented noise-line rule and finds 0 failures); length_out_of_8_25 counts whitespace tokens such as " - " and "£4.50" (C2 counts words: 0 outside 8-25); part/test_ne_nearest_heading compare with a naive nearest heading (the v4 section_index is the STEP 1 heading-verified citation, C7 = 0); passage_row_after_Questions_heading is the known GT/academic layout (passages printed after their question blocks).

11-01 regression (`regression_map.csv` logic): {'must-fix|STILL_USED_same_card': 2, 'must-fix|sentence_no_longer_used': 239, 'must-fix|still_used_other_card': 18, 'optional|STILL_USED_same_card': 4, 'optional|sentence_no_longer_used': 41, 'optional|still_used_other_card': 52, 'should-fix|STILL_USED_same_card': 2, 'should-fix|sentence_no_longer_used': 59, 'should-fix|still_used_other_card': 65}. Must-fix 11-01 sentences used again for the same card with identical text (excluding citation issues): **0**. Rows still used for the same card: expedition (must-fix citation_mismatch, identical=True); genetic (must-fix citation_mismatch, identical=True); derive (should-fix ocr_error, identical=False); spanish (should-fix ocr_error, identical=False); cue (optional near_duplicate, identical=True); disability (optional near_duplicate, identical=True); mangrove (optional near_duplicate, identical=True); usa (optional ocr_error, identical=True) (citation issues already corrected in v3; the two should-fix OCR ones are repaired: non-native, high- and low-frequency; the optional ones are near-duplicate/cosmetic notes).

v3 fixes: v3 review rejects missing from the v4 review file: 0; rows matching a v3 review reject: 0; rows matching a v3 real-word reject pattern: 0.

Targeted re-audit checks (hits in the v4 output):

| check | hits |
|---|---|
| speaker label (Speaker n / Narrator / NAME:) | 0 |
| OCR quote residue '.?' '.!' '?.' '!.' | 0 |
| 'ganat' (qanat OCR) | 0 |
| asterisk residue | 0 |
| tonne card shows 'tons' | 0 |
| US spelling of the card word on a British-display primary | 0 |
| wales card uses 'New South Wales' | 0 |
| 'Latin America' anywhere / latin card | 0 |
| demand card uses 'demanding' | 0 |
| sight card: 'sight' written for 'site' | 0 |
| mine primary is the verb or 'gold mine' | 0 |
| shopping primary is a place/object modifier (shopping centre/mall ...) | 0 |
| percent primary does not show the display 'per cent' | 0 |
| cited line is a GT rubric / instruction / heading line | 0 |
| OCR/garble strings named in the re-audit | 0 |
| primary opens with It/This/They/These/That/He/She/Such | 10 |

## 8. Thin cards

126 cards have fewer than 3 rows (v3: 111). In every case all eligible sentences are used (eligible = distinct sentences that pass every rule; the others are > 25 words, fragments, garbled, context-dependent rejects or other cards' primaries). No sentence was shortened or invented.

| rank | card | rows | eligible distinct sentences |
|---|---|---|---|
| 1284 | ill | 2 | 2 |
| 1486 | tip | 2 | 3 |
| 1553 | unable | 2 | 2 |
| 1616 | indian | 1 | 1 |
| 1620 | volcano | 2 | 4 |
| 1627 | skyscraper | 2 | 2 |
| 1631 | corridor | 2 | 3 |
| 1682 | solar | 2 | 4 |
| 1747 | hypothesis | 2 | 4 |
| 1844 | mineral | 2 | 4 |
| 1907 | significance | 2 | 3 |
| 1918 | nest | 2 | 2 |
| 1930 | predictable | 2 | 5 |
| 1932 | tide | 2 | 2 |
| 1933 | oak | 2 | 4 |
| 1935 | mould | 1 | 2 |
| 1936 | medium | 1 | 1 |
| 1983 | specimen | 2 | 3 |
| 1986 | observer | 1 | 1 |
| 2010 | dam | 2 | 2 |
| 2027 | wolf | 2 | 3 |
| 2044 | productive | 2 | 3 |
| 2048 | precisely | 1 | 1 |
| 2054 | millennium | 2 | 2 |
| 2064 | resistance | 2 | 2 |
| 2077 | antibiotic | 1 | 1 |
| 2096 | occupation | 2 | 2 |
| 2098 | lighting | 2 | 6 |
| 2099 | attach | 2 | 3 |
| 2103 | peer | 2 | 3 |
| 2105 | fan | 2 | 2 |
| 2110 | selection | 2 | 2 |
| 2129 | irrigation | 2 | 3 |
| 2130 | tent | 2 | 5 |
| 2135 | wise | 2 | 3 |
| 2143 | stamp | 2 | 2 |
| 2159 | derive | 1 | 1 |
| 2163 | aside | 2 | 4 |
| 2165 | upper | 2 | 2 |
| 2167 | ton | 2 | 3 |
| 2172 | environmentally | 2 | 3 |
| 2174 | highlight | 1 | 1 |
| 2175 | varied | 2 | 3 |
| 2177 | television | 2 | 2 |
| 2179 | muscle | 2 | 5 |
| 2187 | treasure | 1 | 2 |
| 2190 | random | 2 | 3 |
| 2204 | bath | 2 | 6 |
| 2210 | proper | 1 | 3 |
| 2212 | entitled | 2 | 4 |
| 2213 | output | 2 | 3 |
| 2217 | characterise | 2 | 2 |
| 2221 | steal | 2 | 2 |
| 2224 | silver | 1 | 1 |
| 2231 | battle | 2 | 3 |
| 2234 | reproduction | 2 | 2 |
| 2238 | discharge | 1 | 4 |
| 2241 | copper | 1 | 4 |
| 2250 | likelihood | 2 | 2 |
| 2259 | reservation | 2 | 4 |
| 2262 | childhood | 2 | 2 |
| 2273 | domesticated | 2 | 3 |
| 2274 | mutation | 2 | 6 |
| 2280 | resemble | 2 | 2 |
| 2284 | realistic | 2 | 4 |
| 2292 | substantial | 2 | 2 |
| 2296 | appearance | 2 | 3 |
| 2305 | boil | 2 | 2 |
| 2306 | mexico | 1 | 1 |
| 2308 | desk | 2 | 6 |
| 2314 | cyclist | 2 | 2 |
| 2325 | reinforce | 1 | 2 |
| 2333 | joint | 1 | 1 |
| 2334 | august | 2 | 2 |
| 2335 | norm | 2 | 6 |
| 2336 | participation | 2 | 4 |
| 2340 | religious | 2 | 3 |
| 2342 | traveller | 2 | 2 |
| 2348 | dna | 1 | 1 |
| 2352 | indoor | 2 | 9 |
| 2355 | singer | 2 | 2 |
| 2359 | sporting | 2 | 2 |
| 2370 | urgent | 1 | 1 |
| 2379 | calendar | 2 | 2 |
| 2380 | rush | 2 | 2 |
| 2382 | desirable | 2 | 2 |
| 2387 | aircraft | 1 | 1 |
| 2391 | automated | 2 | 3 |
| 2399 | robotic | 2 | 2 |
| 2403 | dictionary | 2 | 3 |
| 2408 | prevention | 2 | 2 |
| 2409 | cement | 2 | 2 |
| 2413 | anticipate | 2 | 2 |
| 2414 | politician | 1 | 1 |
| 2425 | weak | 2 | 5 |
| 2437 | venture | 1 | 1 |
| 2441 | confirm | 2 | 2 |
| 2443 | ruin | 2 | 3 |
| 2455 | crack | 2 | 2 |
| 2462 | victim | 1 | 1 |
| 2463 | safely | 2 | 2 |
| 2467 | abundance | 2 | 2 |
| 2470 | grade | 2 | 2 |
| 2471 | leisure | 1 | 2 |
| 2473 | hugely | 1 | 1 |
| 2478 | kilogram | 1 | 1 |
| 2479 | pipe | 2 | 4 |
| 2489 | thin | 2 | 2 |
| 2501 | accumulate | 2 | 4 |
| 2502 | breakthrough | 2 | 4 |
| 2512 | pile | 2 | 2 |
| 2515 | flavour | 2 | 3 |
| 2516 | grid | 1 | 2 |
| 2519 | oxygen | 2 | 3 |
| 2524 | bolt | 2 | 3 |
| 2527 | witness | 2 | 4 |
| 2528 | tin | 2 | 8 |
| 2534 | t-shirt | 1 | 1 |
| 2537 | burst | 2 | 2 |
| 2539 | cousin | 2 | 3 |
| 2540 | burial | 1 | 2 |
| 2541 | crossing | 2 | 3 |
| 2551 | sentence | 2 | 2 |
| 2553 | grammar | 2 | 2 |
| 2554 | overview | 2 | 2 |
| 2557 | chart | 2 | 2 |

## 9. Deferred items and known limitations

- **Re-audit rows deferred: 6 should-fix and 46 optional** (all listed in section 4); 0 must-fix. Not "0 unresolved".
- indian: the only usable sentence is the Native-American sense ("Indian reservation schools"); kept as a last-resort primary (re-audit #130/#131 deferred). The card has 1 row.
- Wordlist-level items deferred in STEP 1 stay deferred (coin/coined, counter, demand count incl. 'demanding', centre/centred, reason/reasoned, interest): example side handled where possible (demand has no 'demanding' row).
- ton: its count (STEP 1) includes the surname 'Ton' (Giel Ton); STEP 2 rejects that row (PERSON rule), so the card shows 2 rows. Worth a wordlist look.
- Context dependence: 10 primaries open with It/This/They/... (read; dummy subjects or no other option); 11 cards keep a context-dependent primary for lack of any other sentence;
  the ~850 unread unchanged primaries may contain ~15% milder context dependence (sample estimate, section 5). Alternates were scanned by rules only ({'short': 467, 'question': 264, 'opens_backref': 399, 'opens_conj': 687, 'opens_dialogue': 241, 'ends_weak': 253, 'opens_context': 514, 'comma_capital': 38, 'subordinate_only': 3, 'heading_prefix': 1}), not read.
- Real-word OCR errors are only found where the confusion set/bigram scan or a reader sees them; book 5 GT-B (glow-worm passage) has many a/o misreads, and other sentences of it may remain among alternates.
- The 'next text starts in lowercase' rule also drops some legitimate sentences (speaker turns whose next turn was OCR'd in lowercase, glossary lines without asterisks): fewer candidates, never wrong ones.
- de-hyphenation follows the v4 W5 decisions; W5's own limitations (rare OCR splits kept hyphenated) carry over; such sentences are rejected by the garble rules when detected.
- No paper books were available; source errors are judged from context only.

## 10. Files and reproduction

| file | content |
|---|---|
| examples.csv | v3 columns + v3_status |
| missing.csv | cards without a usable sentence, with the reason |
| ocr_fixes.csv | every ocr_fixed=1 row: fix types, before (sentence_raw), after (sentence), evidence |
| primary_scan.csv | every primary with its rule flags and review result + every primary rejected/demoted in the review |
| reaudit_mapping.csv | all 350 re-audit rows + the 5 old 11-01 rows: status, v4 sentence_id, note |
| sense_review.json / ocr_rules.json | versioned review decisions (card rules, rejects, no_primary, pin, reviewed lists; reject patterns, fix_rules, scan decisions) |
| verification.json | C1-C7 per-row checks, all s05 checks, regression results |
| samples_30.csv | 30 random cards (seed 20261103) with primary, alternates and citations |
| long_span_review.csv | rows citing >= 4 lines with their raw lines |
| run_all.sh / run.log | full rebuild from a clean state |
| tools/, review_log/ | helpers used while reading (they only write sense_review.json / ocr_rules.json) and the decision lists of every review round (audit trail; not run by run_all.sh) |
| sense_review_v3.json, ocr_rules_v3.json | unchanged copies of the v3 review files (used by s09 to prove the v3 fixes are still enforced) |

`./run_all.sh` removes all outputs and `work/`, then runs s01 -> s11 (s01 card tokens, s02 sentences, s03 candidates, s04 selection, s05 verification, s06 OCR scan, s07 primary scan, s08 re-audit mapping, s09 regression, s10 samples, s11 report). The review helpers used while reading (`work/review_round.py` style decisions) only ever wrote to sense_review.json / ocr_rules.json, which are inputs of the run. No git, network or remote service was used; nothing outside this directory was written.

