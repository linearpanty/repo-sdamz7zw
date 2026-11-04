# ClawWords wordlist v4.1 — STEP 1 (wordlist only), 2026-11-04 patch of v4 (2026-11-03)

## 0. v4.1 patch (11-04 re-audit, must-fix rid 5506 and mexico 5485 only)

Two word rules were added (in `overrides_v4.py` + `build_v4.py`); nothing else in the pipeline changed:

- **W10a** LEMMA_FIX `(riding, rid) -> ride`: spaCy lemmatised the verb *riding* as *rid*. All 10 body tokens are the verb ride (horse/bike/wave riding, riding acey-deucy). rid now has 6 body tokens in 5 books, below the 10 x 3 threshold, so the **rid card is dropped**; ride: rank 963, 33/10 books (forms ride:16|riding:10|rides:6|rode:1).
- **W10b** PLACE_NAME_PARTS: *Mexico* directly after *New* (the US state New Mexico) is dropped like the other place-name parts (W8h). The audit listed 6 "New Mexico" tokens; 5 are body tokens (L27635, L101599, L101601, L101604, L101617) - L27701 is a reading_question line and was never counted. mexico: 16 -> 11 body tokens, 8 books, top_unit_share 0.091: still meets 10 x 3 and is not single-text, so the card stays (rank 2306, 11/8 books). Note (not changed, outside the must-fix scope): 2 of the remaining tokens are "Mexico City" (L2457, L20152); without them the count would be 9.

`diff_vs_v4.csv` (vs read-only `../candidate-2026-11-03-v4/`): 2558 -> 2557 cards; 1115 rows differ: 1 removed, 0 added, 2 with content changes, 1112 rank-only (rank shifts caused by the rid drop and the ride/mexico recounts).

| lemma | class | rank v4 -> v4.1 | count v4 -> v4.1 | changes |
|---|---|---|---|---|
| ride | content | 1350 -> 963 | 23 -> 33 | rank: 1350 -> 963 ; total_count: 23 -> 33 ; books: 9 -> 10 ; listening_count: 17 -> 21 ; reading_count: 6 -> 12 ; zipf: 4.96 -> 5.05 ; in_ebb2981: false -> true ; top_unit_share: 0.261 -> 0.182 ; distinct_units: 17 -> 23 ; rank_before_basic_filter: 1446 -> 1059 ; top3_unit_share: 0.391 -> 0.364 ; co |
| rid | removed | 1839 ->  | 16 ->  | (card dropped) |
| mexico | content | 1832 -> 2306 | 16 -> 11 | rank: 1832 -> 2306 ; total_count: 16 -> 11 ; books: 9 -> 8 ; reading_count: 14 -> 9 ; top_unit: 20-T4-R1 -> 04-T3-R2 ; top_unit_share: 0.25 -> 0.091 ; distinct_units: 13 -> 11 ; note: restored from proper-noun filter (country; 16 of 16 body tokens were tagged as proper nouns) -> restored from proper |

Sections 1-10 below are the v4 report regenerated on the v4.1 outputs (numbers are v4.1).

Directory `~/clawwords-feedback/candidate-2026-11-04-v4.1/` (copy of `candidate-2026-11-03-v4/` + W10a/W10b). Rebuilt end to end by `./run_all.sh` from the read-only inputs (`../v3-inputs/`, `../candidate-2026-11-01-v3/`, `../reaudit-2026-11-03/`, `../examples-2026-11-03-exam/examples.csv`) and the vendored word list `vendor/words.txt`, with `./.venv/bin/python` only (Python 3.12, spaCy 3.8.18 + en_core_web_md 3.8.0, wordfreq, pycountry). The v3 pipeline was copied here and changed only through rules with ids **W1-W9** (corpus/segmentation rules in `01_segment_v4.py` / `02_lemmatize_v4.py`, word rules in `overrides_v4.py` + `build_v4.py`); the v3 rules V1-V20, R1-R9, H1-H3, S1-S4 are unchanged unless a W rule says so. No output row was edited by hand. No example sentences were built (that is STEP 2).

## 1. Key numbers

|  | 10-31 final | v3 (11-01/11-03) | **v4** |
|---|---|---|---|
| cards in final list | 2977 | 2561 | **2557** |
| main list before the basic-word filter C | 3076 | 2663 | 2658 |
| counted body tokens | 497,417 (body + question paper + prompts) | 374,294 | 373,209 |
| body lines in section_index (is_body=1) | - | 33,031 | 32,912 |
| connectives_reserved.csv rows | 94 | 98 | 99 |
| month cards / weekday cards | - | 11 / 7 | 12 / 7 |
| instruction_word / single_text_flag | 51 / - | 113 / 158 | 117 / 158 |

**vs v3** (`diff_vs_v3.csv`): 2555 kept, **2 added, 6 removed**; 120 kept cards changed their count. **vs 10-31** (`diff_vs_1031.csv`): 2525 kept, 32 added, 452 removed (v3: 2529 / 32 / 448).

Added and removed vs v3 (all of them; reasons computed token by token, see `diff_vs_v3.csv`):

| lemma | status | v3 rank / count | v4 rank / count | reason |
|---|---|---|---|---|
| latin | removed | 1464 / 21 | - / 11 | removed: place_single_text (final rule 3): restored nationality/language/people word propped up by one passage (top_uni; -10 moved to (dropped) (W8h "Latin America(n)" is a place name, not the language Latin) |
| rid | removed | 1848 / 16 | - / 6 | below 10x3: 6 body tokens / 5 books; -10 moved to ride |
| plain | removed | 1935 / 15 | - / 7 | below 10x3: 7 body tokens / 2 books; -8 moved to plains (W8i independent-sense form (own lemma)) |
| oppose | removed | 2242 / 12 | - / 7 | below 10x3: 7 body tokens / 4 books; -5 moved to as opposed to (W8b "as opposed to" -> reserved phrase (connectives)) |
| stable | removed | 2339 / 11 | - / 8 | below 10x3: 8 body tokens / 6 books; -3 moved to stables (W8i independent-sense form (own lemma)) |
| english-speaking | removed | 2503 / 10 | - / 7 | below 10x3: 7 body tokens / 6 books; -3 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body) |
| ton | added | - / 0 | 2167 / 12 | W8e ton (imperial/US ton, not merged into tonne); +11 moved from tonne (W8e ton (imperial/US ton, not merged into tonne)); +1 moved from (dropped) (W8e ton (imperial/US ton, not merged into tonne)) |
| may | added | - / 12 | 2236 / 12 | W9 user decision 1: May kept as the 23rd filter-C exception; V13 month May (date context);  |

Largest count changes of kept cards (20 largest drops; the full list with reasons is in `diff_vs_v3.csv`):

| lemma | v3 rank | v4 rank | v3 count | v4 count | reason (largest causes) |
|---|---|---|---|---|---|
| speaker | 64 | 851 | 177 | 37 | -140 W3: speaker label stripped inside the line |
| friend | 218 | 451 | 104 | 64 | -31 W3: speaker label stripped inside the line; -9 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body) |
| general | 115 | 191 | 139 | 110 | -28 W1a/W1c: printed running page header (Test n / General Training: Reading and Wr; -1 W1c: GT section title 'General Training: Reading and Writing' is a heading |
| training | 189 | 310 | 112 | 83 | -28 W1a/W1c: printed running page header (Test n / General Training: Reading and Wr; -1 W1c: GT section title 'General Training: Reading and Writing' is a heading |
| student | 15 | 18 | 289 | 263 | -24 W3: speaker label stripped inside the line; -2 W2: narrator/rubric turn or transcription note inside a tapescript is non- |
| write | 42 | 54 | 214 | 191 | -13 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body); -10 W1a/W1c: printed running page header (Test n / General Training: Reading and Wr |
| letter | 595 | 960 | 53 | 33 | -20 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body) |
| question | 60 | 76 | 181 | 162 | -13 W2: GT/reading rubric 'Read the text below and answer Questions ...' is no; -6 W2: narrator/rubric turn or transcription note inside a tapescript is non- |
| woman | 99 | 141 | 146 | 127 | -19 W3: speaker label stripped inside the line |
| writing | 453 | 682 | 65 | 46 | -18 W1a/W1c: printed running page header (Test n / General Training: Reading and Wr; -1 W1c: GT section title 'General Training: Reading and Writing' is a heading |
| millimetre | 930 | 1919 | 34 | 15 | -19 moved to mm (W6 mm not after a number: hesitation sound (filler)) |
| answer | 248 | 332 | 96 | 79 | -14 W2: GT/reading rubric 'Read the text below and answer Questions ...' is no; -3 W2: narrator/rubric turn or transcription note inside a tapescript is non- |
| text | 629 | 829 | 50 | 38 | -12 W2: GT/reading rubric 'Read the text below and answer Questions ...' is no |
| tonne | 1127 | 1766 | 28 | 17 | -11 moved to ton (W8e ton (imperial/US ton, not merged into tonne)) |
| explain | 211 | 240 | 106 | 97 | -9 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body) |
| describe | 309 | 346 | 83 | 77 | -6 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body) |
| test | 243 | 259 | 98 | 93 | -4 W1d: heading-only line ('Test l', 'TEST. 2') is not body; -1 W1a/W1c: printed running page header (Test n / General Training: Reading and Wr |
| mexico | 1840 | 2306 | 16 | 11 | -5 moved to (dropped) (W10b "New Mexico" (US state) is not the country Mexico) |
| course | 65 | 72 | 173 | 169 | -3 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body); -1 moved to of course (V4 discourse idiom -> connectives) |
| recently | 320 | 340 | 82 | 78 | -4 W1c: GT Writing page no longer flipped to Reading (task prompt is non-body) |

Count increases (16 cards): popular 107->108 (+1 W1c: GT running header no longer opens a question block (passage text resto); purpose 76->77 (+1 W1c: GT running header no longer opens a question block (passage text resto); shoe 41->42 (+1 W1c: GT running header no longer opens a question block (passage text resto); storey 20->21 (+1 W5 line-end de-hyphenation (-storey: dash + space)); well-known 18->19 (+1 W5 line-end de-hyphenation (well-known: keep hyphen)); substance 17->18 (+1 W1c: GT running header no longer opens a question block (passage text resto); blame 13->14 (+1 W1c: GT running header no longer opens a question block (passage text resto); explosion 12->13 (+1 W1c: GT running header no longer opens a question block (passage text resto); neolithic 12->13 (+1 moved from (dropped) (v3 dropped it: proper_noun)); explosive 10->11 (+1 W1c: GT running header no longer opens a question block (passage text resto); lay 22->26 (+3 moved from lie (W8a lay (verb lay: base form / object follows)); +1 moved from lie (W8a); ride 23->33 (+10 moved from rid).

## 2. The four user decisions and how they were applied

| decision | how it is applied | result (checked in sanity_checks_v4.json) |
|---|---|---|
| 1. May (month) is KEPT | **W9** (`overrides_v4.FILTER_C_EXTRA_EXCEPTIONS`, used by `build_v4.KEEP_C`): May is the **23rd exception** to filter C (final rule 8). The V13 date-context rule still decides which "May" tokens are the month (the other ~440 are the modal). | may: rank 2236, 12 tokens / 6 books, display 'May', month_flag=true; 12 of 12 months are cards |
| 2. Number words stay removed | No change: V6 `NUMBER_WORDS` (cardinals and ordinals incl. thousand, million, billion) remain in the removal list. | thousand 118, million 115, billion 34 body tokens; none is a card |
| 3. Rule-7 always-keep words stay | No change: final rule 7 keeps error, sentence, vocabulary, overall, percentage, candidate, chart, score, overview, adequate, grammar, graph regardless of the threshold. | chart 3, graph 6, overview 7, sentence 8, grammar 7 (all 12 present) |
| 4. Body-only cut accepted; GT reading = body | No change to the counting rule: only section_index region passage/tapescript is counted; General Training reading texts are region passage (body). v4 only corrects lines that were mislabelled (W1c/W2). | GT body tokens: 17909 (GT reading); vs 10-31: 452 removed (v3: 448) |

Consequence of decision 1 for the counts: May has 12 date-context tokens in 6 books, so it also passes 10 x 3 on its own.

## 3. Pipeline fixes (rules W1-W9), evidence and counts

All section_index changes vs v3 are in `section_index_fixes_v4.csv` (one row per contiguous range: line_from, line_to, book, field, old, new, lines_changed, body_lines_changed, rule). Lines changed per rule and field (body = body line in v3 or v4):

| rule | field | ranges | lines | body lines |
|---|---|---|---|---|
| W1a/W1b | test/part | 6 | 59 | 30 |
| W1a/W1c | is_body | 29 | 29 | 29 |
| W1a/W1c | region | 164 | 164 | 29 |
| W1a/W1c | text_clean | 63 | 63 | 28 |
| W1c | is_body | 68 | 68 | 68 |
| W1c | region | 74 | 74 | 68 |
| W1c | section | 84 | 84 | 63 |
| W1c | test/part | 262 | 4089 | 1796 |
| W1d | is_body | 6 | 6 | 6 |
| W1d | region | 9 | 9 | 6 |
| W1d | text_clean | 11 | 11 | 4 |
| W2 | is_body | 25 | 25 | 25 |
| W2 | region | 59 | 59 | 25 |
| W2 | text_clean | 2 | 2 | 2 |
| W3 | is_body | 1 | 1 | 1 |
| W3 | region | 2 | 2 | 1 |
| W3 | text_clean | 18 | 264 | 264 |
| W4 | text_clean | 17 | 17 | 17 |
| W8f | text_clean | 4 | 7 | 7 |
| W8g | region | 1 | 1 | 0 |
| W8g | text_clean | 111 | 132 | 108 |
| W8k | text_clean | 13 | 13 | 13 |
| region change (side effect of W1c/W2 state change) | region | 1 | 1 | 0 |

Body lines: v3 33,031 -> v4 32,912.

### W1 Citations from real section headings, not running page headers

- **W1a** (`01_segment_v4.py`, tapescript post-pass): a "Test n" line is a real test heading only when it is printed in capitals ("TEST 2", the tapescript heading style) or the next content line is a SECTION/PART 1 heading. Every other "Test n" line is the printed running page header: it is no longer a DP anchor, so it can never override the nearest real TEST/SECTION/PART heading. Real tapescript test headings: 58; running headers ignored: 99.
- **W1b**: R7 extended: page-end Q markers numbered for the previous test (Q38-40 printed after 'TEST 2 / SECTION 1' on the same page) are moved before the TEST heading (19 markers).
- **W1c** General Training: the running page header 'General Training: Reading and Writing' (65 lines) no longer resets the GT test letter (GT-A/GT-B -> 'GT'), no longer flips a Writing page back to Reading and no longer opens a reading question block; 'You should spend about 20 minutes on this task' (Writing rubric) no longer flips Writing -> Reading. Effect: GT test letters restored on 4,089 lines (1,796 body); **GT Writing Task 1 prompts ('Write a letter to ...', 63 body lines in books 5-10) are no longer counted as reading-passage body text**; 29 GT header/title lines that v3 counted as passage text are non-body; 5 passage lines of book 10 GT-B that the header had pushed into a question block are body again.
- **W1d**: heading-only lines ('Test l', 'TEST. 2', OCR 'QI5' marker) are never body; TESTNO/TEST_HEAD also accept the OCR form 'TEST. 2' (book 10 L43924, which v3 counted as tapescript text).

| known span | v3 label (body lines) | v4 label (body lines) |
|---|---|---|
| book 8 L30236-30279 (heading TEST 2 / SECTION 1 at L30235-30236; running header "Test 1" at L30281) | {'T1 part 4': 24} | {'T2 part 1': 24} |
| book 12 L56831-56836 (end of T6 Section 4 lecture, running header "Test 7" at L56830; TEST 7 heading at L56837) | {'T7 part 1': 6} | {'T6 part 4': 6} |

All W1a/W1b test/part changes (**59 lines, 30 body**): book 8 L30235-30281: T1 listening part 4 -> T2 listening part 1 (47 lines); book 8 L30282-30284: T1 listening part 4 -> T2 listening part 1 (3 lines); book 10 L43923-43923: T2 listening part 1 -> T1 listening part 4 (1 lines); book 12 L56830-56830: T7 listening part 1 -> T6 listening part 4 (1 lines); book 12 L56831-56836: T7 listening part 1 -> T6 listening part 4 (6 lines); book 13 L62947-62947: T4 listening part 1 -> T3 listening part 4 (1 lines).

**All-book scan** (`check_citations_v4.py`, an independent heading walk: every body line is compared with the nearest preceding real heading of its stream; a disagreement is "page header beats heading" when a running header lies between the heading and the line and the label follows the header):

|  | v3 section_index | v4 section_index |
|---|---|---|
| body lines checked (tapescript / academic reading / GT reading) | 13,275 / 14,717 / 1,873 | 13,260 / 14,714 / 1,776 |
| spans where a page header beats a real heading | **40** (1,772 body lines) | **0** |
| other disagreements (lost headings, decided by Q markers / question numbers) | 14 spans | 12 spans |

The v3 page-header spans are the 2 known ones plus 38 GT spans (the GT header reset GT-A/GT-B to 'GT' on every page and sent Writing Task 1 prompts to Reading part 0). (The scanner classes the book 8 span as 'other' in v3 because its running header is printed *below* the text; it is fixed all the same.) The remaining v4 "other" spans were all inspected; none involves a running header: book 4 reading L390-409 labelled T1 P2, last heading says P1; book 9 tapescript L37397-37407 labelled T4 P2, last heading says T4 P3; book 21 reading L104026-104098 labelled T1 P2, last heading says P1; book 21 reading L104155-104220 labelled T1 P3, last heading says P1; book 21 reading L104694-104767 labelled T2 P2, last heading says P1; book 21 reading L104816-104946 labelled T2 P3, last heading says P1; book 21 reading L105423-105481 labelled T3 P2, last heading says P1; book 21 reading L105531-105601 labelled T3 P3, last heading says P1; book 21 reading L106061-106131 labelled T4 P2, last heading says P1; book 21 reading L106208-106280 labelled T4 P3, last heading says P1; book 21 tapescript L106730-106784 labelled T1 P4, last heading says T1 P3; book 21 tapescript L107049-107105 labelled T2 P4, last heading says T2 P3. They are the known lost-heading cases (book 21 T1/T2 Part 4 lectures and book 21 T4 whose 'TEST 4' heading is missing, decided by Q markers as in v3), book 9 L37397-37407 (v3 R7 decision: inline markers win), and academic reading passages whose 'READING PASSAGE n' heading was lost in OCR (book 14 T3/T4, book 21: only 'READING PASSAGE 1' survives), where the v3 R4 question-number DP is right and the naive scan is not.

### W2 Rubric lines inside body regions (13 GT lines + systematic scan)

The 13 GT lines "Read the text below and answer Questions …" (books 5-10): L7229, L13893, L14221, L14406, L21748, L22100, L22225, L29166, L29470, L29634, L35959, L42580, L42727. v3: is_body = 13/13; v4: is_body = 0/13 (region instruction).
Systematic scan (W2 regex `RUBRIC_IN_BODY` in reading text, `NARR_IN` in tapescripts): 48 reading lines matched the rubric pattern (the 13 body lines above, the book 14 OCR line 'we your drawer in boxes to on your answer sheel.' L66935, and lines that v3 already had as non-body question text); 7 + 1 narrator lines and 2 transcription notes inside book 20 tapescripts ('Part two, you will hear a potter …', '… look at questions 11 to 16. Now listen carefully and answer questions 11 to 16.', 'Narrator/Instructor: …', 'Here is the transcript of the conversation … based on the provided sources:'). All are non-body in v4.

| word | v3 body count | v4 body count | of which on the 13 GT lines (v3) | other v4 changes | v4 card status |
|---|---|---|---|---|---|
| answer | 96 | 79 | 13 | 4 | rank 332, 79/18 books |
| question | 181 | 162 | 13 | 6 | rank 76, 162/18 books |
| read | 235 | 194 | 13 | 28 | not a card: filter C (zipf_headword 5.54) |
| text | 50 | 38 | 12 | 0 | rank 829, 38/14 books |
| below | 62 | 49 | 13 | 0 | not a card: connectives_reserved.csv |

('Other v4 changes' = narrator turns of book 20 (W2), GT writing prompts and running headers (W1c), speaker-label lines and the W5 re-tokenisation.)

### W3 Speaker labels stripped inside lines

v3 stripped only CAPITAL labels at the line start ('MAN:'). Book 20 prints its tapescripts with labels such as 'Speaker 1 (Woman):', 'Narrator/Instructor:', title-case names/roles (Colin, Finn, House Owner, Lecturer, Maya, Rosie, Shelley Meyer, Student 1, Student 2) and multi-word roles ('Design and Technology Lecturer:'), often mid-line ('try Paloma. Speaker 1 (Woman): Where's that?'). W3 removes 'Speaker n (X):', 'Narrator…:', role labels and the book's own label inventory (title-case labels opening >= 3 lines of the book, or role words) at the line start or after a sentence end, and known CAPITAL labels after a sentence end, in tapescript lines only. Lines changed: **260**. Sanity check: no body token is 'Speaker' + digit, no body token from the label inventory is followed by ':', no 'Speaker n'/'Narrator' left in tapescript text_clean.

| card | v3 count | v4 count | cause (diff_vs_v3.csv) |
|---|---|---|---|
| speaker | 177 | 37 | -140 W3: speaker label stripped inside the line |
| friend | 104 | 64 | -31 W3: speaker label stripped inside the line; -9 W1c: GT Writing page no longer flipped to Reading (task prompt is non |
| student | 289 | 263 | -24 W3: speaker label stripped inside the line; -2 W2: narrator/rubric turn or transcription note inside a tapescript is |
| woman | 146 | 127 | -19 W3: speaker label stripped inside the line |
| lecturer | 18 | 16 | -2 W3: speaker label stripped inside the line |

### W4 End punctuation from OCR'd quotes

'.?' '.!' -> '.', '?.' -> '?', '!.' -> '!' after a word, not after abbreviations ('Fine, after 5 p.m.?' kept). Lines changed: **17**, e.g. `L13189: Trading sHatters to fan?.  =>  Trading sHatters to fan?` | `L21081: some design hints,' says Gharib. We're just waiting for him to report back.!' So whether  =>  some design hints,' says Gharib. We're just waiting for him to report back.' So whether` | `L29324: bacteria and protozoa?.  =>  bacteria and protozoa?` | `L29776: she can open the door to another culture.!  =>  she can open the door to another culture.`. Left in body text after a word: 0 (sanity check).

### W5 De-hyphenation with a dictionary + corpus evidence

v3 joined a line-end 'xxx-' + 'yyy' unless wordfreq gave the joined string zipf 0; wordfreq knows highgrade, alltime, socalled … as rare web tokens, so real hyphens were lost. W5 (`02_lemmatize_v4.py dehyphen_keep`): (a) keep the hyphen when the hyphenated compound is printed elsewhere in clawwords.md more often than the solid form (sub-compounds count: 'two-year-old' is evidence for 'year-old'), or the break is inside a longer compound ('nose-' + 'to-tail'); (e) a spaced dash or a function word on one side of an unattested compound is a dash: kept, words separated (v3 deleted it: 'andrepair'); (b) join when the solid form is a dictionary word (vendored list incl. regular inflections, or wordfreq zipf >= 3) or printed solid >= 2 times; (c) keep when both halves are words (British spellings accepted: 'six-millimetre'); (d) otherwise join.

| decision | rule | line-end breaks |
|---|---|---|
| dash + space | e | 93 |
| join | b | 55 |
| join | d | 1 |
| keep hyphen | a | 78 |
| keep hyphen | c | 50 |

277 line-end breaks in total; **137 decided differently from v3** (107 in body text; every one is listed in `dehyphenation_v4.csv` with the rule). The audit compounds: small-scale (L7086: keep hyphen, rule a), year-old (L14666: keep hyphen, rule a), state-of (L14986: keep hyphen, rule a), part-time (L15047: keep hyphen, rule a), high-grade (L54850: keep hyphen, rule a), part-time (L74339: keep hyphen, rule a), so-called (L87773: keep hyphen, rule a), prize-winning (L90993: keep hyphen, rule a), all-time (L105362: keep hyphen, rule c), year-old (L106087: keep hyphen, rule a).

### W6 mm -> millimetre only after a number

'mm' becomes the millimetre only after a number ('6.8 mm', '18 mm', '5mm', 'five mm'); 'Mm.' / 'Mm, I see' stays the hesitation filler (removed). **millimetre: v3 34 -> v4 15 tokens** in 8 books (rank 930 -> 1919); forms millimetres:7|mm:4|millimetre:3|millimeters:1. The re-audit expected 'about 15': the real number is 15 (4 'mm' after a number + 11 spelled-out millimetre(s)/millimeters). **The card still passes 10 x 3** and stays.

### W7 No system paths: vendored word list

`vendor/words.txt` = byte-identical copy of the macOS system word list `/usr/share/dict/words` (symlink to `web2`, Webster's Second International, 235,976 lines), copied once on 2026-11-03; **sha256 be41ad97963bf8dabedd5871d5d691596175269d540956b0f9965a885c2bbab9** (recorded in `vendor/SOURCE.txt`, asserted on load by `wordlist_v4.py` and in the sanity checks). It is read only through `wordlist_v4.py` (W5 de-hyphenation, W8f OCR g/q check). Because web2 is a 1934 American list, `is_word` also accepts regular inflections of listed words and words with wordfreq zipf >= 3 (online, email, wellbeing). Grep of every `*.py` / `*.sh` here for the system dictionary path, the system temp dir and the old workspace path: no hits (sanity check W7). The v3 wordlist scripts did not read the system dictionary either; the dependency was in the STEP 2 example scripts (`quality.py`), which can now use `vendor/words.txt`.

### W8 Wordlist-level should-fix items (REAUDIT.md section 3) and cheap extras

| id | item | rule | before (v3) -> after (v4) | status |
|---|---|---|---|---|
| W8a | lay as past tense of lie | VBD/VBN 'lay' -> lie unless a base-form context (to/modal/even …) or an object follows (them/it/their/eggs/foundations …); 'a/the lay …' = adjective lay | lay 22 -> 26, lie 42 -> 38. Token check: the 7 'lay' tokens v3 had on the lay card were all verb/adjective lay (spaCy already sent past-tense 'lay' to lie); the real v3 errors ran the other way: 3 verb uses ('lay them out', 'lay it among', 'lay the foundations') and 'a lay doctor' were counted under lie. Fixed. | fixed |
| W8b | "as opposed to" counted for oppose | 'opposed' in 'as opposed to' -> phrase 'as opposed to', reserved with the connectives | oppose 12 -> 7 -> below 10 x 3, card removed; 'as opposed to' 5 tokens in connectives_reserved.csv | fixed |
| W8c | percent vs per cent display | display = majority body spelling; card id stays percent | display 'percent' -> 'per cent', aliases 'percent' | fixed |
| W8d | locate shown as located | V16 participle display threshold 0.66 -> 0.75 | locate displayed 'locate'. Side effect (same rule): associate 'associated' -> 'associate', publish 'published' -> 'publish', restrict 'restricted' -> 'restrict', intend 'intended' -> 'intend', attach 'attached' -> 'attach' | fixed |
| W8e | tonne vs tons | ton(s) no longer merged into tonne; 'metric ton(s)' = tonne | tonne 28 -> 17, new card ton 0 -> 12 | fixed |
| W8f | qanat OCR 'ganat' | non-word whose g->q variant is printed within 300 lines | 7 lines (ganat/ganats -> qanat/qanats, Saqgara -> Saqqara); 0 left | fixed |
| W8g | asterisk residue | footnote/glossary asterisks removed from text_clean | 138 lines; 0 asterisks left in body text | fixed |
| W8h | wales / latin counts (issues.csv) | 'Wales' in 'New South Wales', 'Latin' in 'Latin America(n)' are place-name parts (dropped) | wales 18 -> 14; latin 21 -> 11 -> removed by final rule 3 (now single-text) | fixed |
| W8i | plain/plains, stable/stables, indoor/indoors (issues.csv), rich/riches (11-01) | independent-sense forms get their own lemma | plain 15 -> 7 (removed), stable 11 -> 8 (removed), indoor 15 -> 11, rich 32 -> 30; plains 8, stables 3, indoors 4, riches 2 tokens (below 10 x 3) | fixed |
| W8j | french note '5 capitalised tokens' | note text 'N of M body tokens were tagged as proper nouns' | restored from proper-noun filter (nationality/language/people; 5 of 36 body tokens were tagged as proper nouns | fixed |
| W8k | OCR '1' for I, 'II' for 'll (must-fix rows suppose/identify/maintain) | '1' before a verb after punctuation/conjunction or before a cognition verb; 'II'/' ll' after a pronoun | 9 + 4 lines; 0 left in body text | fixed |
| - | US spelling on British cards (analyzed) | - | example choice | deferred to STEP 2 |
| - | heading glued to sentence ('Stepwells A millennium ago') | - | passage titles are body lines by design; the sentence boundary is an example-level fix | deferred to STEP 2 |
| - | thin cards (about 11) | - | example coverage | deferred to STEP 2 |
| - | demand/demanding, coin/coined, counter (v), centre/centred, reason/reasoned, interest/interested | - | noun and verb of one lemma share a card (fixed inflection rule); demanding is VERB-tagged so V10/V16 do not apply - a new -ing adjective rule could move other cards | deferred with reason |


### W9 May

See decision 1. In v3 May was the reported filter-C conflict; in v4 it is a card (rank 2236).

## 4. Re-audit (`../reaudit-2026-11-03/issues.csv`, 350 rows) mapping: `reaudit_resolution_v4.csv`

One row per issues.csv row (issue_no = 1-based data row). Note: the re-audit's `row` column is the **file line** of the v3 `examples.csv` (header = line 1), i.e. data row + 1 — verified on answer/745, claim/1208, concert/4450 — not the data row number. Status values: **fixed** (wordlist/system row, verified in the v4 outputs), **root_cause_fixed** (examples.csv row whose cause is fixed in v4 and verified at the cited clawwords.md lines; the example itself is only replaced when STEP 2 rebuilds examples.csv), **moot_card_removed** (the card is no longer in the list), **deferred_step2**, **deferred_with_reason**.

| type | severity | rows | fixed | root_cause_fixed | moot_card_removed | deferred_step2 | deferred_with_reason | not_fixed |
|---|---|---|---|---|---|---|---|---|
| system | must-fix | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| system | should-fix | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| wordlist | must-fix | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| wordlist | should-fix | 15 | 10 | 0 | 0 | 2 | 3 | 0 |
| wordlist | optional | 18 | 2 | 0 | 0 | 13 | 3 | 0 |
| example_rootcause | must-fix | 28 | 0 | 26 | 2 | 0 | 0 | 0 |
| example_rootcause | should-fix | 18 | 0 | 15 | 3 | 0 | 0 | 0 |
| example_rootcause | optional | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| example_only | must-fix | 36 | 0 | 0 | 0 | 36 | 0 | 0 |
| example_only | should-fix | 120 | 0 | 0 | 0 | 120 | 0 | 0 |
| example_only | optional | 109 | 0 | 0 | 0 | 109 | 0 | 0 |

**Not everything is resolved:** 286 of 350 rows are deferred (280 to STEP 2, 6 with a reason), including 36 must-fix example rows (real-word OCR misreads such as 'concert half', fragments and comma splices, sense choices such as demand/demanding, sight/site, and the 5 rows carried over from 11-01). These are sentence-level: STEP 2 must re-select or repair them, and the re-audit's estimate (~190 affected cards across all primaries) means a full primary review is still needed in STEP 2. Rows marked root_cause_fixed still point at v3 example rows until STEP 2 reruns.

Wordlist and system rows (all):

| # | card | severity | status | rule | verification |
|---|---|---|---|---|---|
| 1 | (system) section_index | must-fix | fixed | W1a/W1b | book 8 L30236-30279 body labels {('2', '1'): 24}; book 12 L56831-56836 {('6', '4'): 6}; all-book scan: page-header-beats-heading spans = 0 |
| 47 | millimetre | must-fix | fixed | W6 | v4 rank 1919, 15 tokens/8 books, display 'millimetre', aliases 'millimeter/mm'; forms millimetres:7/mm:4/millimetre:3/millimeters:1; passes 10x3: True |
| 48 | millimetre | must-fix | fixed | W6 | v4 rank 1919, 15 tokens/8 books, display 'millimetre', aliases 'millimeter/mm'; forms millimetres:7/mm:4/millimetre:3/millimeters:1; passes 10x3: True |
| 68 | (system) examples | should-fix | fixed | W5 | line-end breaks of the 8 audit compounds kept hyphenated (missing: []); dehyphenation_v4.csv: {'join': 56, 'keep hyphen': 128, 'dash + space': 93} |
| 69 | (system) section_index | should-fix | fixed | W2 | 13 GT rubric lines is_body=1 left: []; regions Counter({'instruction': 13}) |
| 90 | coin | should-fix | deferred_with_reason |  | noun and verb of one lemma share a card (fixed inflection rule); 'coined' (1-2 tokens) does not change the card. v4 rank 1818, 16 tokens/10 books, display 'coin' |
| 95 | counter | should-fix | deferred_with_reason |  | noun and verb of one lemma share a card (fixed inflection rule); the card schema has no sense split. v4 rank 1779, 17 tokens/7 books, display 'counter' |
| 101 | demand | should-fix | deferred_with_reason |  | 'demanding' (7 tokens) is VERB-tagged by spaCy, so V10/V16 (adjectival forms) do not apply; separating it needs a new adjective rule for -ing forms that could move other cards - deferred, card still p |
| 118 | follower | should-fix | deferred_step2 | V17 | wordlist side already done: single_text_flag=true, top_unit_share 0.692; example diversity is STEP 2 |
| 130 | indian | should-fix | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 1616, 19 tokens/7 books, display 'Indian' |
| 132 | indoor | should-fix | fixed | W8i | v4 rank 2352, 11 tokens/7 books, display 'indoor'; v4: not a card (4 body tokens/4 books) |
| 146 | latin | should-fix | fixed | W8h | v4: not a card (11 body tokens/5 books); Latin America tokens no longer counted, latin then removed by final rule 3 (single text) |
| 147 | lay | should-fix | fixed | W8a | v4 rank 1193, 26 tokens/13 books, display 'lay'; v4 rank 816, 38 tokens/18 books, display 'lie'; lay forms {'laid': 14, 'lays': 1, 'lay': 11}; 'lay' tokens on lie: 5 (past tense) |
| 148 | lie / lay | should-fix | fixed | W8a | v4 rank 1193, 26 tokens/13 books, display 'lay'; v4 rank 816, 38 tokens/18 books, display 'lie'; lay forms {'laid': 14, 'lays': 1, 'lay': 11}; 'lay' tokens on lie: 5 (past tense) |
| 153 | locate | should-fix | fixed | W8d | v4 rank 821, 38 tokens/16 books, display 'locate' |
| 173 | oppose | should-fix | fixed | W8b | v4: not a card (7 body tokens/4 books) (below 10x3 once 'as opposed to' is out); 'as opposed to' 5 tokens, reserved: True |
| 177 | percent | should-fix | fixed | W8c | v4 rank 316, 82 tokens/16 books, display 'per cent', aliases 'percent' |
| 180 | plain | should-fix | fixed | W8i | v4: not a card (7 body tokens/2 books); v4: not a card (8 body tokens/6 books) |
| 209 | stable | should-fix | fixed | W8i | v4: not a card (8 body tokens/6 books); v4: not a card (3 body tokens/2 books) |
| 221 | wales | should-fix | fixed | W8h | v4 rank 1985, 14 tokens/8 books, display 'Wales'; New South Wales tokens no longer counted |
| 242 | centre | optional | deferred_with_reason |  | 'centred' is an inflection of the verb centre, which shares the card (fixed rule). v4 rank 56, 189 tokens/18 books, display 'centre', aliases 'center' |
| 258 | environmentally | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2172, 12 tokens/9 books, display 'environmentally' |
| 272 | french | optional | fixed | W8j | note: restored from proper-noun filter (nationality/language/people; 5 of 36 body tokens were tagged as proper nouns) |
| 278 | highlight | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2174, 12 tokens/9 books, display 'highlight' |
| 280 | hugely | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2473, 10 tokens/7 books, display 'hugely' |
| 284 | interest | optional | deferred_with_reason |  | 1 stray 'interested' token tagged VERB stays with interest (V10 needs a majority); not worth a special case. v4 rank 286, 87 tokens/18 books, display 'interest' |
| 288 | joint | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2333, 11 tokens/7 books, display 'joint' |
| 306 | occupation | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2096, 13 tokens/8 books, display 'occupation' |
| 311 | prevention | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2408, 11 tokens/3 books, display 'prevention' |
| 317 | reason | optional | deferred_with_reason |  | 'reasoned' is an inflection of the verb reason, which shares the card (fixed rule). v4 rank 135, 129 tokens/18 books, display 'reason' |
| 322 | safely | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2463, 10 tokens/7 books, display 'safely' |
| 328 | sporting | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2359, 11 tokens/6 books, display 'sporting' |
| 336 | television | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2177, 12 tokens/8 books, display 'television' |
| 338 | tidal | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2279, 12 tokens/3 books, display 'tidal' |
| 339 | tonne | optional | fixed | W8e | v4 rank 1766, 17 tokens/8 books, display 'tonne'; v4 rank 2167, 12 tokens/9 books, display 'ton'; tonne forms {'tonnes': 13, 'tonne': 3, 'tons': 1} |
| 345 | varied | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2175, 12 tokens/9 books, display 'varied' |
| 347 | victim | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2462, 10 tokens/7 books, display 'victim' |
| 348 | warship | optional | deferred_step2 |  | example coverage/diversity (STEP 2); v4 rank 2549, 10 tokens/3 books, display 'warship' |

Example rows whose root cause is a v4 rule (all):

| # | card | row | severity | status | rule | verification |
|---|---|---|---|---|---|---|
| 8 | answer | 745 | must-fix | root_cause_fixed | W2 | L22100-22100: region instruction, is_body 0 |
| 12 | claim | 1208 | must-fix | root_cause_fixed | W1a/W1b | L30258-30259: v4 labels {('8', '2', '1'): 2} |
| 16 | conflict | 3905 | must-fix | root_cause_fixed | W1a/W1b | L56831-56831: v4 labels {('12', '6', '4'): 1} |
| 19 | cure | 6862 | must-fix | root_cause_fixed | W8k | L29347-29348: v4 text_clean 'than a field of purple coneflowers in all their glory. And with a few ' |
| 20 | decade | 1090 | must-fix | root_cause_fixed | W3 | L102427-102427: v4 text_clean 'But in this country anyway, that all changed decades ago. And' |
| 22 | department | 1916 | must-fix | root_cause_fixed | W1a/W1b | L56831-56832: v4 labels {('12', '6', '4'): 2} |
| 23 | diet | 2568 | must-fix | root_cause_fixed | W4 | L65158-65158: v4 text_clean 'nology. Let's make sure children have a rich diet of play experiences.' |
| 26 | electronic | 6969 | must-fix | root_cause_fixed | W5 | L14985-14986: L14986 state-of: keep hyphen (a: part of a multi-part hyphen compound ) |
| 29 | friendly | 5627 | must-fix | root_cause_fixed | W3 | L102295-102296: v4 text_clean 'Yeah, there's a lively atmosphere and the waiters are really' |
| 31 | historian | 4784 | must-fix | root_cause_fixed | W4 | L40246-40247: v4 text_clean ' there are one or two missing factors that you need to open the lock.'' |
| 32 | identify | 937 | must-fix | root_cause_fixed | W8k | L22667-22668: v4 text_clean 'Thanks, Philip. So now I guess the two main things to remember here' |
| 33 | incredible | 7201 | must-fix | root_cause_fixed | W3 | L102308-102308: v4 text_clean 'Oh, the views would be incredible from up there.' |
| 34 | infection | 7215 | must-fix | root_cause_fixed | W4 | L29322-29324: v4 text_clean 'infections and found it to be effective against bacteria and protozoa?' |
| 35 | insurance | 3080 | must-fix | root_cause_fixed | W1a/W1b | L30257-30258: v4 labels {('8', '2', '1'): 2} |
| 38 | judgement | 4798 | must-fix | root_cause_fixed | W3 | L102449-102449: v4 text_clean 'Yes, I read that it was hard to reach a judgment. as the definition' |
| 39 | language | 59 | must-fix | root_cause_fixed | W4 | L29775-29776: v4 text_clean 'By learning another language she can open the door to another culture.' |
| 40 | latin | 4391 | must-fix | moot_card_removed | W8h | L30881-30882: tokens now [('latin', None)]; v4: not a card (11 body tokens/5 books) |
| 42 | lose | 639 | must-fix | root_cause_fixed | W3 | L102574-102574: v4 text_clean 'I'm losing touch with my friends and colleagues.' |
| 44 | maintain | 1824 | must-fix | root_cause_fixed | W8k | L7997-7997: v4 text_clean 'Yes. good. Do you think you'll maintain the contact now?' |
| 45 | memory | 1618 | must-fix | root_cause_fixed | W3 | L102602-102603: v4 text_clean 'So recently I've noticed she's started to have quite bad' |
| 51 | recently | 961 | must-fix | root_cause_fixed | W3 | L103110-103111: v4 text_clean 'Sandra, I seem to remember you had some family visitors staying' |
| 55 | single | 1123 | must-fix | root_cause_fixed | W4 | L65149-65150: v4 text_clean 'r, not a single child said this through the whole year of the project.' |
| 57 | speaker | 193 | must-fix | root_cause_fixed | W3 | L102314-102315: v4 text_clean 'newspapers. that would be a memorable place for a' |
| 58 | stable | 6935 | must-fix | moot_card_removed | W8i | L95958-95959: tokens now [('stables', 'stables')]; v4: not a card (8 body tokens/6 books) |
| 62 | suppose | 852 | must-fix | root_cause_fixed | W8k | L90312-90312: v4 text_clean 'Me neither. I suppose 1783 is a long time ago.' |
| 63 | text | 1888 | must-fix | root_cause_fixed | W2 | L29470-29470: region instruction, is_body 0 |
| 65 | wales | 5020 | must-fix | root_cause_fixed | W8h | L30454-30456: tokens now [('wales', None)]; v4 rank 1985, 14 tokens/8 books, display 'Wales' |
| 67 | worry | 2302 | must-fix | root_cause_fixed | W1a/W1b | L30275-30275: v4 labels {('8', '2', '1'): 1} |
| 87 | clever | 5793 | should-fix | root_cause_fixed | W5 | L7085-7086: L7086 small-scale: keep hyphen (a: hyphenated form printed elsewhere (10) |
| 108 | enrol | 6454 | should-fix | root_cause_fixed | W5 | L15046-15047: L15047 part-time: keep hyphen (a: hyphenated form printed elsewhere (38) |
| 119 | fossil | 3351 | should-fix | root_cause_fixed | W5 | L14664-14666: L14666 year-old: keep hyphen (a: part of a multi-part hyphen compound ) |
| 124 | hit | 3890 | should-fix | root_cause_fixed | W5 | L105361-105362: L105362 all-time: keep hyphen (c: joined form not a word, both halves a) |
| 136 | interval | 7263 | should-fix | root_cause_fixed | W8f | L77321-77322: v4 text_clean has qanat: True |
| 141 | journal | 5146 | should-fix | root_cause_fixed | W8g | L103914-103914: asterisks left in text_clean: 0 |
| 144 | knowledge | 1045 | should-fix | root_cause_fixed | W8g | L106228-106229: asterisks left in text_clean: 0 |
| 149 | lighting | 6271 | should-fix | root_cause_fixed | W5 | L14985-14986: L14986 state-of: keep hyphen (a: part of a multi-part hyphen compound ) |
| 166 | narrow | 4939 | should-fix | root_cause_fixed | W5 | L87772-87773: L87773 so-called: keep hyphen (a: hyphenated form printed elsewhere (13) |
| 167 | oil | 1177 | should-fix | root_cause_fixed | W5 | L54849-54850: L54850 high-grade: keep hyphen (a: hyphenated form printed elsewhere (2x) |
| 171 | oppose | 6661 | should-fix | moot_card_removed | W8b | v4: not a card (7 body tokens/4 books); 'as opposed to' reserved with the connectives |
| 172 | oppose | 6662 | should-fix | moot_card_removed | W8b | v4: not a card (7 body tokens/4 books); 'as opposed to' reserved with the connectives |
| 179 | photographic | 7078 | should-fix | root_cause_fixed | W5 | L90992-90993: L90993 prize-winning: keep hyphen (a: hyphenated form printed elsewhere (2x) |
| 181 | plain | 5790 | should-fix | moot_card_removed | W8i | L470-472: tokens now [('plains', 'plains')]; v4: not a card (7 body tokens/2 books) |
| 208 | spirit | 6710 | should-fix | root_cause_fixed | W8g | L71298-71300: asterisks left in text_clean: 0 |
| 211 | straightforward | 4627 | should-fix | root_cause_fixed | W8f | L77357-77359: v4 text_clean has qanat: True |
| 216 | tonne | 3381 | should-fix | root_cause_fixed | W8e | L46954-46958: tokens [('tons', 'ton')] |
| 220 | vertical | 4440 | should-fix | root_cause_fixed | W8f | L77321-77322: v4 text_clean has qanat: True |
| 275 | gifted | 5109 | optional | root_cause_fixed | W5 | L14590-14593: line-end decision now recorded: L14592 air-borne: join (dehyphenation_v4.csv; blocks_v4.jsonl sep=hyph_joined) - STEP 2 sets ocr_fixed from it |

## 5. 11-01 audit (`audit_resolution.csv`, same format as v3)

| type | fixed | partially_fixed | not_fixed | wontfix_with_reason | deferred_step2 |
|---|---|---|---|---|---|
| wordlist | 228 | 7 | 1 | 52 | 6 |
| example_rootcause | 169 | 0 | 0 | 0 | 41 |
| example_only | 0 | 0 | 0 | 0 | 275 |

Changes vs v3: May (missing_month) wontfix -> fixed (W9); lay (homograph) not_fixed -> fixed (W8a); rich/stable (wrong_merge) not_fixed -> fixed (W8i); ton (duplicate of tonne) -> wontfix_with_reason (superseded by the re-audit, W8e); display forms whose participle display was dropped by W8d -> wontfix_with_reason (superseded). As in v3, deferred_step2 rows are not resolved by this step.

## 6. Files for STEP 2 (same structure as v3, names *_v4)

| v3 file | v4 file | note |
|---|---|---|
| final_wordlist.csv, app_export_wordlist.csv, card_forms.csv, merges.csv, removed_words.csv, connectives_reserved.csv, main_before_basic_filter.csv, gerund_decisions.csv, restored_proper_nouns.csv | same names | same columns as v3 |
| section_index.csv | section_index.csv | same columns; text_clean now without speaker labels (W3), with W4/W8f/W8g/W8k OCR fixes |
| lines_v3.jsonl / tokens_v3.pkl / sents_v3.pkl / staged_v3.pkl | lines_v4.jsonl / tokens_v4.pkl / sents_v4.pkl / staged_v4.pkl | same record/tuple layout |
| build_v3.py / overrides_v3.py | build_v4.py / overrides_v4.py | pass 1 still ends at '# ---------- pass 2'; the load lines read *_v4.pkl (an s00-style copy must substitute the v4 names) |
| (re-implemented in STEP 2 s02) | **blocks_v4.jsonl** | the exact spaCy input blocks: key, text, per line [line, start, length, sep] with sep in start/space/newline/hyph_joined/hyph_kept/dash_space - no need to re-implement the W5 joining |
| (STEP 2 v3_pass1.py) | **card_tokens_v4.pkl** | (staged index, line, surface form, card, rule) for every body token: the exact token -> card assignment of the counts |
| audit_resolution.csv | audit_resolution.csv + **reaudit_resolution_v4.csv** | 11-01 audit as before; 11-03 re-audit mapping |
| - | dehyphenation_v4.csv, section_index_fixes_v4.csv, citation_scan_v3/v4.csv/.json, diff_vs_v3.csv | evidence files |
| - | vendor/words.txt + wordlist_v4.py | the dictionary STEP 2 should use instead of the system file |

## 7. Sanity checks (`sanity_checks_v4.json`)

- PASS: final_wordlist.csv starts with the exact 10-31 columns; new columns appended at the end — ['single_text_flag', 'top3_unit_share', 'count_outside_top_unit', 'month_flag', 'weekday_flag', 'question_count', 'prompt_count', 'nonbody_exam_count']
- PASS: ranks are 1..N and contiguous — 2557
- PASS: sorted by total_count desc (ties by books)
- PASS: section counts sum to total_count on every card
- PASS: no duplicate lemmas
- PASS: no lemma contains a digit
- PASS: is_body tokens come only from regions passage/tapescript — 0
- PASS: writing_count and speaking_count are 0 (prompts, cue cards, model answers not counted)
- PASS: sum of all card total_counts == body tokens aggregated in the build — 373209
- PASS: rule 1: yes / sure / goodbye not in the list
- PASS: rule 2: several / whole / various / due to / serious in the list — []
- PASS: rule 4: advanced / concerned / based / fishing are own cards
- PASS: rule 7: the 12 keep-anyway words are present — []
- PASS: rule 8: no card with zipf_headword >= 5.5 except the 22 exceptions + May (W9) — ['base', 'based', 'cause', 23]
- PASS: rule 3: no restored city names; place words removed when single-text — 3
- PASS: connectives are not in the main list — set()
- PASS: threshold: every card has >= 10 body tokens in >= 3 books unless rule 7 / closed set
- PASS: bad cards gone — []
- PASS: expected new/merged cards present — []
- PASS: 12 months flagged in the list (May kept by W9) — []
- PASS: weekdays flagged
- PASS: ant / lizard / tortoise carry single_text_flag
- PASS: bee card forms do not include being (bee/being) — {'bee': 4, 'bees': 15}
- PASS: no merged_from lists a spaCy lemma error (hop, cop, sens, taxis, instal)
- PASS: paragraph fell (10-31 count 104, v4 3) — rank 392 -> not a card
- PASS: writer fell (10-31 count 185, v4 37) — rank 146 -> 843
- PASS: passage fell (10-31 count 56, v4 8) — rank 798 -> not a card
- PASS: sentence fell (10-31 count 33, v4 8) — rank 1308 -> 2551
- PASS: correct fell (10-31 count 70, v4 23) — rank 641 -> 1342
- PASS: app export has no note column — ['rank', 'lemma', 'display_form', 'aliases', 'total_count', 'books', 'instruction_word', 'single_text_flag', 'month_flag', 'weekday_flag']
- PASS: section_index.csv has one row per clawwords.md line (109,121) — 109121
- PASS: book 12 tests are 5-8
- PASS: every academic test has body text for passages 1-3 — []
- PASS: every book has tapescript text for 4 tests x 4 parts — []
- PASS: known lost-heading cases are part 4 — {'b21_T1_lecture L106730-106784': {'T1 part 4': 47}, 'b21_T2_lecture L107049-107105': {'T2 part 4': 44}, 'b14_T4_lecture L68478-68532': {'T4 part 4': 45}}
- PASS: no body line in listening is out of its part range (Q markers) — remaining 2 are OCR-misread markers (Q2/ for Q21, Q3 for Q31)
- PASS: audit: every wordlist / root-cause issue has a status
- PASS: audit 11-01: no wordlist must-fix left not_fixed
- PASS: D1 May (month) is present, month_flag, kept as the 23rd filter-C exception (W9) — may: rank 2236, 12 tokens/6 books
- PASS: D2 number words absent (thousand, million, billion and all V6 NUMBER_WORDS) — []
- PASS: D3 rule-7 always-keep words present (chart, graph, overview + 9) — {'error': '17', 'sentence': '8', 'vocabulary': '15', 'overall': '23', 'percentage': '10', 'candidate': '11', 'chart': '3', 'score': '21', 'overview': '7', 'adeq
- PASS: D4 body-only counting with GT reading texts counted as body — GT body tokens: 17909
- PASS: W1 citation span book 8 L30236-30279 = Test 2 Section 1 — {('8', '2', '1'): 24}
- PASS: W1 citation span book 12 L56831-56836 = Test 6 Section 4 — {('12', '6', '4'): 6}
- PASS: W1 all-book scan: no span where a running page header beats a real heading — v4 {'other': 12} (v3 {'other': 14, 'page_header_beats_heading': 40})
- PASS: W2 the 13 GT "Read the text below and answer Questions" lines are non-body — {}
- PASS: W2 no body line left with a "read the text below / answer questions n" rubric — []
- PASS: W1c no GT body line outside a reading section (GT writing prompts are non-body) — []
- PASS: W3 no speaker labels left in body tokens (Speaker n / known name or role label followed by ":") — []
- PASS: W3 no "Speaker n (X):" / "Narrator:" label left in tapescript text_clean — []
- PASS: W4 no ".?" ".!" "?." "!." left in body text after a word — []
- PASS: W5 the audit compounds keep their hyphen (high-grade, all-time, so-called, small-scale, part-time, prize-winning, 215-million-year-old, state-of-the-art) — {'high-grade': 'keep hyphen', 'all-time': 'keep hyphen', 'so-called': 'keep hyphen', 'small-scale': 'keep hyphen', 'part-time': 'keep hyphen', 'prize-winning': 
- PASS: W6 millimetre count (mm only after a number) and threshold — millimetre 15 tokens / 8 books (v3 34); passes 10x3: True; forms millimetres:7|mm:4|millimetre:3|millimeters:1
- PASS: W6 no "Mm" interjection counted in millimetre — {'millimetres': 7, 'millimetre': 3, 'mm': 4, 'millimeters': 1}
- PASS: W7 no script here references a system dictionary, temp-dir or workspace path — []
- PASS: W7 vendored word list present with the recorded sha256 — be41ad97963bf8dabedd5871d5d691596175269d540956b0f9965a885c2bbab9
- PASS: W8a lay: no past-tense lay (VBD, no object/base context) on the lay card — {'': 21, 'W8a lay (verb lay: base form / object follows)': 3, 'W8a lay (adjective: a lay doctor, the lay visitor)': 2}
- PASS: W8b 'as opposed to' is reserved with the connectives, never counted in oppose — Counter({'as opposed to': 5})
- PASS: W8c percent displayed 'per cent' (majority spelling), alias percent — ('per cent', 'percent')
- PASS: W8d locate displayed 'locate' — locate
- PASS: W8e tonne has no ton/tons except metric ton — {'tonnes': 13, 'tonne': 3, 'tons': 1}
- PASS: W8f no OCR 'ganat' left in body text — []
- PASS: W8g no asterisk left in body text — []
- PASS: W8k no OCR '1' for I / 'II' for 'll left in body text — []
- PASS: re-audit: every issues.csv row has a status; none not_fixed — []

## 8. Random sample (`samples_30.csv`, seed 20261103)

| v4 rank | lemma | v4 count/books | v3 rank | v3 count/books | change |
|---|---|---|---|---|---|
| 122 | interested | 135/17 | 126 | 135/17 | 0 |
| 224 | collect | 102/17 | 228 | 102/17 | 0 |
| 367 | economic | 74/15 | 369 | 74/15 | 0 |
| 469 | essential | 63/16 | 473 | 63/16 | 0 |
| 481 | solution | 62/16 | 483 | 62/16 | 0 |
| 548 | reveal | 56/16 | 551 | 56/16 | 0 |
| 589 | participant | 53/13 | 594 | 53/13 | 0 |
| 665 | track | 47/15 | 669 | 47/15 | 0 |
| 668 | guide | 47/15 | 672 | 47/15 | 0 |
| 731 | coast | 43/15 | 734 | 43/15 | 0 |
| 734 | analysis | 43/14 | 737 | 43/14 | 0 |
| 776 | entire | 40/17 | 780 | 40/17 | 0 |
| 796 | clearly | 39/16 | 801 | 39/16 | 0 |
| 840 | wash | 37/16 | 844 | 37/16 | 0 |
| 995 | chapter | 32/8 | 996 | 32/8 | 0 |
| 1041 | income | 30/14 | 1041 | 30/14 | 0 |
| 1281 | debate | 24/13 | 1282 | 24/13 | 0 |
| 1315 | bilingual | 24/5 | 1315 | 24/5 | 0 |
| 1332 | boost | 23/12 | 1332 | 23/12 | 0 |
| 1392 | ball | 22/11 | 1396 | 22/11 | 0 |
| 1855 | pesticide | 16/7 | 1864 | 16/7 | 0 |
| 1858 | rail | 16/7 | 1867 | 16/7 | 0 |
| 1864 | litter | 16/6 | 1873 | 16/6 | 0 |
| 2053 | specialise | 13/10 | 2058 | 13/10 | 0 |
| 2083 | distribute | 13/8 | 2087 | 13/8 | 0 |
| 2165 | upper | 12/9 | 2169 | 12/9 | 0 |
| 2166 | pound | 12/9 | 2170 | 12/9 | 0 |
| 2170 | remains | 12/9 | 2173 | 12/9 | 0 |
| 2521 | problem-solving | 10/5 | 2524 | 10/5 | 0 |
| 2539 | cousin | 10/4 | 2542 | 10/4 | 0 |

## 9. Limitations

- Real-word OCR errors (half/hall, port/part, temps/Thames, Lcuador …) are not corrected: no safe general rule exists; they affect example text far more than counts. The 1/I and II/ll patterns were the only cheap general ones.
- W1 relies on the printed conventions (tapescript test headings in capitals or followed by SECTION/PART 1; running headers in title case). A real heading lost by OCR is still recovered only from Q markers (as in v3); the scan lists 12 such 'other' spans, all inspected and none caused by a page header.
- W3 strips only labels it can recognise (Speaker n (X), Narrator, role words, labels opening >= 3 lines of a book, CAPITAL labels). A one-off label in mid-line with an unknown name ('So. Andrew: have you seen …', book 5) is left; it may also be a vocative.
- W5 depends on a 1934 American word list plus wordfreq; 1 break is still joined as 'a word broken inside' ('echo-locationv', an OCR line), and odd OCR splits ('compare- son', 'influence- imagine') are kept hyphenated. All 277 decisions are listed for review.
- W8a is context-based; a past-tense 'lay' directly followed by an object word of the list (rare) would be counted as lay.
- W8d's threshold change also changed 5 other display forms (associate, publish, restrict, intend, attach now show the base verb); intended as the same rule, but it is a visible change.
- The examples.csv rows of the re-audit are not edited here; root_cause_fixed means the cause is gone and verified at the cited lines - the rows themselves are replaced only when STEP 2 reruns. Sentence-level must-fix rows (36) remain open for STEP 2.
- The body-only cut vs 10-31 (decision 4: 448 removed in v3) now stands at 452 removed / 32 added; the difference from v3 is exactly the 6 removals and 2 additions vs v3 listed in section 1 (GT writing prompts, place-name parts, independent-sense forms, as opposed to; ton, May).
- No paper books were available; source-text errors are judged from context only.

## 10. Reproduction

`./run_all.sh` (log `run.log`) rebuilds every output above from the read-only inputs, with `PYTHONHASHSEED=0`. Steps: make_v2_instr -> 01_segment_v4 -> check_section_index, section_index_fixes_v4, check_citations_v4 (v3 and v4) -> 02_lemmatize_v4 -> scan_lemma_errors -> 03_stage_tokens_v4 -> build_v4 -> v3_card_tokens (runs the read-only v3 builder pass 1, writes nothing there), diff_vs_v3, diff_vs_1031 -> note_review -> resolve_audit_1101, resolve_reaudit_v4 -> samples_30 -> sanity_checks_v4 -> write_report_v4.

Clean-state reproduction check (`reproducibility.txt`):

```
Clean-state reproduction check, 2026-11-03
Method: all 45 generated files moved out of the directory (only scripts, run_all.sh, vendor/, PROMPT.md left), ./run_all.sh run (A); outputs moved out again, ./run_all.sh run (B); sha256 of all 45 outputs compared.
Result: 44 of 45 files byte-identical between A and B. The only difference is run.log (it contains the start timestamp and timings).
Both runs: 65 sanity checks, 0 hard failures. The outputs in this directory are those of run B.
Key sha256 (run B):
8a4b31b5109e6b734bae23e350c4343db8d28118f9b91a908d093d08a2162b5e  card_forms.csv
ee896034c75df22ac2c9f37451f5c3a8dcd8c578c73b5def160a89e6e38b6b2a  final_wordlist.csv
114283d68d494917ce10a9c9af6a7632d047bfd805ccb7ff3a79b66786899f87  merges.csv
23450160a70d1fa32f8a81c9b089f4f849ee59b44e255b4cb2c3515312ddf0e7  section_index.csv
41ccef32a072686cc5e11105939fc1dbab7e2e7bedf1d8a83b8ce5d8583eb181  sents_v4.pkl
fab7e8f998026e76b3439681f9896241035f9000154d893376cc85ef37c82264  staged_v4.pkl
91c387d5d77aab95fd2bdde5b35a0b54f86a0a351c1011003a4e67f528e0e533  tokens_v4.pkl
Note: REPORT.md was regenerated once more after this file was written (write_report_v4.py), to include this section; that is the only change after run B.
```

Inputs are read-only and were not modified. No git, GitHub, network or remote host was used; nothing outside this directory was written.
