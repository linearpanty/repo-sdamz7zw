# ClawWords v4.1: patch round for the 11-04 re-audit must-fix items (examples)

Directory `~/clawwords-feedback/examples-2026-11-04-v4.1/` (a copy of `examples-2026-11-03-v4/`). `./run_all.sh` (log `run.log`) rebuilt it end to end on the v4.1 wordlist `../candidate-2026-11-04-v4.1/`. Only the 12 must-fix rows of `../reaudit-2026-11-04/issues.csv` were addressed. Should-fix and optional rows were not touched. Every change is a rule or a review entry: `ocr_rules.json` v4.1-2026-11-04.1, `sense_review.json` v4.1-2026-11-04.1, and the scripts. No output row was edited by hand. The full regenerated v4-style report is in `REPORT_full.md`.

## Counts

|  | v4 | v4.1 |
|---|---|---|
| cards in wordlist | 2558 | 2557 |
| example rows | 7516 | 7511 |
| primaries | 2556 | 2555 |
| alternates | 4960 | 4956 |
| missing (no primary) | 2 | 2 |
| rows with ocr_fixed=1 | 91 | 97 |

`diff_vs_v4.csv` has 3204 rows: **13 content changes, 5 removed, 0 added**, and 3186 rank-only rows. A rank-only row has the same sentence and citation; only its rank moved, because the wordlist dropped rid and re-ranked ride and mexico. Every content change belongs to one of the 12 items (unexplained: 0).

`verification.json` (rerun over all 7511 rows): C1 PASS, C2 PASS, C3 PASS, C4 PASS, C5 PASS, C6 PASS, C7 PASS; failures: 0.

## Method (rules, not row patches)

- **OCR pattern rules P1-P5** (`ocr_rules.json` `pattern_fix_rules`, code in `scripts/textfix.py` `pattern_fixes`, applied by s02 to every rendered body sentence). Each rewritten sentence gets `ocr_fixed=1` and is logged in `ocr_fixes.csv` with `pattern_fix:Pn`. P1 `Id`+lowercase word -> I'd. P2 `Ill`+lowercase word -> I'll. P2 is guarded: never `Ill-`, never after a capitalised name word (regnal III: 'King George Ill', 'Napoleon Ill'), and never when `ill <next word>` is attested as the adjective in clawwords.md (ill health). P3 `I'II`/`I'Il` -> I'll. P4 `youll` -> you'll. P5 is sentence-initial `There be` -> There'll be, so 'will there be' is never touched.
- **Reviewed line fixes** (`fix_rules`): **F9** L44408 'rate it you pay' -> 'rate if you pay' (it read for if). **F10** L28448 'lines of it you work' -> 'lines of if you work' is the same misread, found by scanning the corpus for 'it you' (2 body hits, both misreads). F10 is in no example row.
- **Sentence rejects** (`sense_review.json` `reject`, `*` scope because the defect is in the sentence): the kill, basically, college and educational v4 primaries. None of these 4 sentences is used by another card in v4.
- **Selection stability S1-S3** (`scripts/s04_select.py`, new in v4.1, reads the read-only v4 examples.csv). A v4 row is kept if its (card, sentence) is still eligible, including when the text now carries a v4.1 fix. Only emptied slots are refilled. A new primary may not take a sentence that another card uses in v4, and a kept primary is never swapped away. Without this rule the first run changed 71 rows on 42 cards, 30 of them outside the 12 items: new primaries took other cards' sentences and set off swap chains, and the -6 score for OCR-fixed sentences dropped the repaired alternates.
- `pin_primary`: kill -> L90073s1 and educational -> L91042s1. Under S2 the scorer picked context-dependent sentences here ('one of the main ones', 'all the activities'), and the better candidates were other cards' v4 rows. Every new primary was read and added to `reviewed_ok_v4`.
- **Wordlist** (`../candidate-2026-11-04-v4.1`, rerun): W10a LEMMA_FIX (riding, rid) -> ride; W10b PLACE_NAME_PARTS 'Mexico' after 'New' dropped. Details are in that directory's `REPORT.md` section 0 and `diff_vs_v4.csv`.

## The 12 items

| # | card / issue row | role | class | before (v4) | after (v4.1) | why |
|---|---|---|---|---|---|---|
| 1 | benefit 412 | alt2 | content | And I said how Id benefited in many ways from going through that experience, he says. (book 8 TGT-B reading Section 2 L29667-29668) | And I said how I'd benefited in many ways from going through that experience, he says. (book 8 TGT-B reading Section 2 L29667-29668) | alt: OCR "Id" -> "I'd" (rule P1); same sentence, repaired text (ocr_fixed=1) |
| 2 | direct 2397 | alt1 | content | But for future reference, I'II give you the direct number. (book 6 T2 listening Part 1 L15270-15271) | But for future reference, I'll give you the direct number. (book 6 T2 listening Part 1 L15270-15271) | alt: OCR "I'II" -> "I'll" (rule P3); same sentence, repaired text (ocr_fixed=1) |
| 3 | rest 1726 | alt2 | content | Ill suggest that to the rest of the family. (book 11 T3 listening Part 1 L50860) | I'll suggest that to the rest of the family. (book 11 T3 listening Part 1 L50860) | alt: OCR "Ill" -> "I'll" (rule P2); same sentence, repaired text (ocr_fixed=1) |
| 4 | select 4002 | alt2 | content | So one thing I'm sure youll want to know is why we've selected this particular site for a housing development. (book 18 T2 listening Part 2 L90248-90249) | So one thing I'm sure you'll want to know is why we've selected this particular site for a housing development. (book 18 T2 listening Part 2 L90248-90249) | alt: OCR "youll" -> "you'll" (rule P4); same sentence, repaired text (ocr_fixed=1) |
| 5 | discount 5929 | alt1 | content | You can choose to pay at the end of each term or we do offer a slightly discounted rate it you pay every month. (book 10 T3 listening Part 1 L44406-44408) | You can choose to pay at the end of each term or we do offer a slightly discounted rate if you pay every month. (book 10 T3 listening Part 1 L44406-44408) | alt: real-word OCR "rate it you pay" -> "rate if you pay" (reviewed fix F9); same sentence, repaired text (ocr_fixed=1) |
| 6 | duty 6097 | primary | content | There be lifeguards on duty, so it's suitable for all ages. (book 15 T2 listening Part 1 L72620) | There'll be lifeguards on duty, so it's suitable for all ages. (book 15 T2 listening Part 1 L72620) | primary: "There be" -> "There'll be" (rule P5); same sentence, repaired text (ocr_fixed=1) |
| 7 | kill 2759 | primary | content | Amazonian manatees were killed between 1935 and 1954 for their meat, fat and skin, with the latter used to make leather. (book 20 T2 reading Passage 1 L99797-99798) | In Malawi's Majete National Park the elephant population had been wiped out by poachers, who killed the elephants for their ivory. (book 18 T1 listening Part 4 L90073-90075) | primary truncated by a stray full stop (L99796); full sentence is 26 words > 25 -> replaced; primary pinned in the v4.1 review |
| 8 | basically 5383 | alt1 | content | Basically, not enough's been spent on increasing the number of cycle lanes. (book 16 T4 listening Part 3 L79188) | Well there are basically two types of adult membership. (book 13 T2 listening Part 1 L62312) | primary fragment -> replaced; alternate slot refilled (the v4 alternate was promoted to primary or the slot lost its sentence) |
| 8 | basically 5383 | primary | content | Basically because it looks like the rock pools you find on a beach. (book 10 T1 listening Part 3 L43776) | Basically, not enough's been spent on increasing the number of cycle lanes. (book 16 T4 listening Part 3 L79188) | primary fragment -> replaced; primary re-selected |
| 9 | college 2432 | alt1 | content | I noticed a fitness centre next to the college. (book 6 T1 listening Part 3 L15079) | So, over the fierce objections of his mentor Hofmann, he left college to give birth to the modern chemical industry. (book 9 T1 reading Passage 1 L33068-33069) | primary fragment -> replaced; alternate slot refilled (the v4 alternate was promoted to primary or the slot lost its sentence) |
| 9 | college 2432 | primary | content | I suppose between 9 and, let me see, half-past, before I leave for the college. (book 5 T4 listening Part 1 L8651) | I noticed a fitness centre next to the college. (book 6 T1 listening Part 3 L15079) | primary fragment -> replaced; primary re-selected |
| 10 | educational 3548 | primary | content | You mean, whether it should just entertain children or should be educational, as well. (book 14 T4 listening Part 3 L68372-68373) | It was interesting to see the educational skills the children were developing by doing origami. (book 18 T4 listening Part 3 L91042-91043) | primary fragment -> replaced; primary pinned in the v4.1 review |
| 11 | mexico 5485 | alt1 | removed | 'What goes up must come down,' points out Jean-Claude Diels of the University of New Mexico. (book 8 T3 reading Passage 1 L27634-27635) | - (row dropped) | New Mexico tokens excluded from the card (wordlist W10b) -> New Mexico rows gone, country primary chosen; row dropped |
| 11 | mexico 5485 | alt2 | removed | This pattern continued until she moved permanently to New Mexico in 1949. (book 20 T4 reading Passage 1 L101603-101604) | - (row dropped) | New Mexico tokens excluded from the card (wordlist W10b) -> New Mexico rows gone, country primary chosen; row dropped |
| 11 | mexico 5485 | primary | content | In 1929, O'Keeffe made her first extended trip to the state of New Mexico. (book 20 T4 reading Passage 1 L101599) | Whistled languages survive today in Papua New Guinea, Mexico, Vietnam, Guyana, China, Nepal, Senegal, and a few mountainous pockets in southern Europe. (book 15 T4 reading Passage 2 L71993-71995) | New Mexico tokens excluded from the card (wordlist W10b) -> New Mexico rows gone, country primary chosen; primary re-selected |
| 12 | rid 5506 | alt1 | removed | Watch out especially for the great pumping machines which rid the mine of water. (book 10 T4 listening Part 2 L44844) | - (row dropped) | riding moved to ride (wordlist W10a); rid 6 tokens < 10 -> card dropped; row dropped |
| 12 | rid 5506 | alt2 | removed | Had he foreseen the speed advantage that would be conferred by riding acey-deucy? (book 17 T2 reading Passage 3 L81814) | - (row dropped) | riding moved to ride (wordlist W10a); rid 6 tokens < 10 -> card dropped; row dropped |
| 12 | rid 5506 | primary | removed | You have to wonder what happens when people get rid of old ones. (book 15 T4 listening Part 3 L73325) | - (row dropped) | riding moved to ride (wordlist W10a); rid 6 tokens < 10 -> card dropped; row dropped |

**Threshold outcomes (10 body tokens in >= 3 books).**

- **rid (item 12):** v4 had 16 tokens = riding:10 + rid:6. With riding moved to ride, rid has **6 tokens, below the threshold, so the card is dropped** (v4 rank 1839). Its 3 example rows are removed. ride: 23 -> 33 tokens, 9 -> 10 books, rank 1350 -> 963; card_forms now has riding:10. The ride example rows are unchanged, because S1 kept them.
- **mexico (item 11):** the audit listed 6 'New Mexico' tokens, but 5 are body tokens (L27635, L101599, L101601, L101604, L101617). L27701 is a reading_question line and was never counted. mexico: 16 -> **11 tokens in 8 books**, top_unit_share 0.091. That still meets 10 x 3, and the single-text place rule (final rule 3) does not fire, so **the card stays** (rank 1832 -> 2306). All 3 v4 rows were New Mexico sentences. Only 1 of the 11 country sentences passes the filters (10 are too long, truncated, heading-fused or OCR-garbled). So mexico now has **1 primary and 0 alternates**. Caveat, not changed because it is outside the must-fix scope: 2 of the 11 tokens are 'Mexico City' (L2457, L20152). Excluding those too would leave 9 tokens, below the threshold. That is a decision for you.
- **kill (item 7):** joining 'It is estimated that 140,000.' (L99796) with L99797 gives the full sentence, but it has 26 words (27 by the pipeline's counter, which splits '140,000'; the audit's '25 words' is an undercount). That is above 25, so the documented repair is impossible. The truncated sentence is rejected for every card, and a new kill primary was chosen. The two kill alternates are unchanged.

## Every application of the v4.1 OCR rules (`ocr_rule_applications_v41.csv`)

| sentence | rule | lines | used in examples | after |
|---|---|---|---|---|
| L8173s0 | P2 | L8173-8173 | not selected | I'll take you to have a look at it in a minute. |
| L8433s0 | P2 | L8433-8437 | not selected | It was a good thing he gave us the course outline at the beginning, in the first session, that was useful, so  |
| L15270s1 | P3 | L15270-15271 | direct alt1 | But for future reference, I'll give you the direct number. |
| L28447s1 | F10 | L28447-28449 | not selected | However, the Japanese attitude towards education runs along the lines of if you work hard enough, you can do a |
| L29667s1 | P1 | L29667-29668 | benefit alt2 | And I said how I'd benefited in many ways from going through that experience, he says. |
| L29939s0 | P2 | L29939-29939 | not selected | I'll do it. |
| L30152s1 | P3 | L30152-30153 | not selected | I'll find out about them. |
| L44323s0 | P2 | L44323-44323 | not selected | I'll put four down because that's how old she'll be when she starts. |
| L44388s0 | P2 | L44388-44388 | not selected | Oh, I'll make a note of that. |
| L44406s1 | F9 | L44406-44408 | discount alt1 | You can choose to pay at the end of each term or we do offer a slightly discounted rate if you pay every month |
| L44409s1 | P2 | L44409-44409 | not selected | I'll do that then. |
| L44613s1 | P2 | L44613-44614 | not selected | I'll get some of the final year students to give me some tips... maybe see if I can read what they wrote. |
| L44753s0 | P2 | L44753-44755 | not selected | Oh, yes, I'll list all the jobs separately with individual prices That'd be a great help. |
| L44800s0 | P3 | L44800-44800 | not selected | So, I'll look forward to seeing you tomorrow at |
| L50724s0 | P2 | L50724-50724 | not selected | I'll make my amendments using those, then I can scan it into our report. |
| L50860s1 | P2 | L50860-50860 | rest alt2 | I'll suggest that to the rest of the family. |
| L72620s1 | P5 | L72620-72620 | duty primary | There'll be lifeguards on duty, so it's suitable for all ages. |
| L73084s1 | P3 | L73084-73085 | not selected | I'll avoid that. |
| L90248s1 | P4 | L90248-90249 | select alt2 | So one thing I'm sure you'll want to know is why we've selected this particular site for a housing development |
| L97002s0 | P2 | L97002-97002 | not selected | I'll just give you my phone number, in case you can't find me. |

20 body sentences were rewritten. 6 of them are used in examples.csv: the 6 must-fix rows. No other example row contains any of the 5 patterns or 'it you' (`ocr_fixes.csv` lists every ocr_fixed=1 row). Sentences that were not selected were still rewritten, but they changed no output. Not handled (outside scope): 'Ive got' (L15604, in no example sentence) is the same kind of dropped apostrophe, with no rule in v4.1.

## Other changed rows

None (0). Within the 12 cards, the only rows beyond the flagged row are alternate-slot refills: college alt1 and basically alt1, where the v4 alt1 was promoted to primary. The kill and educational alternates are unchanged. mexico alt1/alt2 were dropped with no replacement, and rid's 3 rows were removed with the card. 3186 rows differ only in `rank`.

Inputs are read-only and were not modified. Nothing was written outside `examples-2026-11-04-v4.1/` and `candidate-2026-11-04-v4.1/`. No git, network or remote service was used.
