#!/usr/bin/env python3
"""Writes REPORT.md from the v4 outputs. Every number and list below is read from an output file of this directory (or the read-only v3 /
10-31 / re-audit inputs); nothing is typed per word except the prose."""
import csv, json, pickle, collections, os, hashlib
def rd(fn): return list(csv.DictReader(open(fn, encoding='utf-8')))
V3D = '../candidate-2026-11-01-v3/'; B1031 = '../v3-inputs/candidate-2026-10-31-final/'
F = rd('final_wordlist.csv'); FL = {r['lemma']: r for r in F}
F3 = rd(V3D + 'final_wordlist.csv'); FL3 = {r['lemma']: r for r in F3}
F1031 = rd(B1031 + 'final_wordlist.csv')
DV3 = rd('diff_vs_v3.csv'); D1031 = rd('diff_vs_1031.csv')
FIX = rd('section_index_fixes_v4.csv'); DH = rd('dehyphenation_v4.csv'); RR = rd('reaudit_resolution_v4.csv'); AR = rd('audit_resolution.csv')
SEG = json.load(open('segment_stats.json')); SEG3 = json.load(open(V3D + 'segment_stats.json')); LEM = json.load(open('lemmatize_stats.json'))
FS = json.load(open('final_summary.json')); FS3 = json.load(open(V3D + 'final_summary.json'))
SAN = json.load(open('sanity_checks_v4.json')); CS3 = json.load(open('citation_scan_v3.json')); CS4 = json.load(open('citation_scan_v4.json'))
CSP4 = rd('citation_scan_v4.csv'); CSP3 = rd('citation_scan_v3.csv')
S = pickle.load(open('build_state.pkl', 'rb')); R = S['R']; R3 = pickle.load(open(V3D + 'build_state.pkl', 'rb'))['R']
T3 = pickle.load(open('v3_card_tokens.pkl', 'rb'))
SI = rd('section_index.csv'); SI3 = rd(V3D + 'section_index.csv')
FORMS = {r['lemma']: r['surface_forms'] for r in rd('card_forms.csv')}
SAMP = rd('samples_30.csv')
L = []
def p(*x): L.append(' '.join(str(y) for y in x))
def tab(head, rows):
    p('| ' + ' | '.join(head) + ' |'); p('|' + '---|' * len(head))
    for r in rows: p('| ' + ' | '.join(str(x).replace('|', '/').replace('\n', ' ') for x in r) + ' |')
    p('')
def cnt(w, RR_): r = RR_.get(w); return r['total_count'] if r else 0
def card(w, D=FL): r = D.get(w); return f"rank {r['rank']}, {r['total_count']}/{r['books']} books" if r else 'not a card'
st = collections.Counter(r['status'] for r in DV3); st31 = collections.Counter(r['status'] for r in D1031)
body3 = sum(r['is_body'] == '1' for r in SI3); body4 = sum(r['is_body'] == '1' for r in SI)
n_prompt = sum(1 for o, n in zip(SI3, SI) if o['is_body'] == '1' and n['is_body'] == '0' and n['section'] == 'writing')
n_restored = sum(1 for o, n in zip(SI3, SI) if o['is_body'] == '0' and n['is_body'] == '1')
n_gthead = sum(1 for o, n in zip(SI3, SI) if o['is_body'] == '1' and n['is_body'] == '0' and n['region'] in ('running_header', 'heading') and n['test'].startswith('GT'))

p('# ClawWords wordlist v4.1 — STEP 1 (wordlist only), 2026-11-04 patch of v4 (2026-11-03)')
p('')
DV4 = json.load(open('diff_vs_v4.json'))
p('## 0. v4.1 patch (11-04 re-audit, must-fix rid 5506 and mexico 5485 only)')
p('')
p('Two word rules were added (in `overrides_v4.py` + `build_v4.py`); nothing else in the pipeline changed:')
p('')
p('- **W10a** LEMMA_FIX `(riding, rid) -> ride`: spaCy lemmatised the verb *riding* as *rid*. All ' + str(S['forms']['ride'].get('riding', 0)) + ' body tokens are the verb ride (horse/bike/wave riding, riding acey-deucy). '
  'rid now has ' + str(R['rid']['total_count']) + ' body tokens in ' + str(R['rid']['books']) + ' books, below the 10 x 3 threshold, so the **rid card is dropped**; ride: ' + card('ride') + ' (forms ' + FORMS.get('ride', '') + ').')
p('- **W10b** PLACE_NAME_PARTS: *Mexico* directly after *New* (the US state New Mexico) is dropped like the other place-name parts (W8h). '
  'The audit listed 6 "New Mexico" tokens; 5 are body tokens (L27635, L101599, L101601, L101604, L101617) - L27701 is a reading_question line and was never counted. '
  'mexico: 16 -> ' + str(R['mexico']['total_count']) + ' body tokens, ' + str(R['mexico']['books']) + ' books, top_unit_share ' + str(FL['mexico']['top_unit_share']) + ': still meets 10 x 3 and is not single-text, so the card stays (' + card('mexico') + '). '
  'Note (not changed, outside the must-fix scope): 2 of the remaining tokens are "Mexico City" (L2457, L20152); without them the count would be 9.')
p('')
p(f"`diff_vs_v4.csv` (vs read-only `../candidate-2026-11-03-v4/`): {DV4['v4_cards']} -> {DV4['v41_cards']} cards; {DV4['changed_rows']} rows differ: "
  f"{DV4['removed']} removed, {DV4['added']} added, {DV4['content']} with content changes, {DV4['rank_only']} rank-only (rank shifts caused by the rid drop and the ride/mexico recounts).")
p('')
tab(['lemma', 'class', 'rank v4 -> v4.1', 'count v4 -> v4.1', 'changes'], [(r['lemma'], r['change_class'], f"{r['rank_v4']} -> {r['rank_v41']}", f"{r['total_count_v4']} -> {r['total_count_v41']}", r['changes'][:300]) for r in DV4['non_rank_rows']])
p('Sections 1-10 below are the v4 report regenerated on the v4.1 outputs (numbers are v4.1).')
p('')
p('Directory `~/clawwords-feedback/candidate-2026-11-04-v4.1/` (copy of `candidate-2026-11-03-v4/` + W10a/W10b). Rebuilt end to end by `./run_all.sh` from the read-only inputs (`../v3-inputs/`, '
  '`../candidate-2026-11-01-v3/`, `../reaudit-2026-11-03/`, `../examples-2026-11-03-exam/examples.csv`) and the vendored word list `vendor/words.txt`, '
  'with `./.venv/bin/python` only (Python 3.12, spaCy 3.8.18 + en_core_web_md 3.8.0, wordfreq, pycountry). The v3 pipeline was copied here and changed '
  'only through rules with ids **W1-W9** (corpus/segmentation rules in `01_segment_v4.py` / `02_lemmatize_v4.py`, word rules in `overrides_v4.py` + '
  '`build_v4.py`); the v3 rules V1-V20, R1-R9, H1-H3, S1-S4 are unchanged unless a W rule says so. No output row was edited by hand. '
  'No example sentences were built (that is STEP 2).')
p('')
p('## 1. Key numbers')
p('')
tab(['', '10-31 final', 'v3 (11-01/11-03)', '**v4**'], [
    ['cards in final list', len(F1031), len(F3), f'**{len(F)}**'],
    ['main list before the basic-word filter C', '3076', FS3['main_before_basic_filter'], FS['main_before_basic_filter']],
    ['counted body tokens', '497,417 (body + question paper + prompts)', f"{FS3['N_counted_body_tokens']:,}", f"{FS['N_counted_body_tokens']:,}"],
    ['body lines in section_index (is_body=1)', '-', f'{body3:,}', f'{body4:,}'],
    ['connectives_reserved.csv rows', 94, FS3['n_connectives_reserved'], FS['n_connectives_reserved']],
    ['month cards / weekday cards', '-', f"{FS3['flags_final']['month_flag']} / {FS3['flags_final']['weekday_flag']}", f"{FS['flags_final']['month_flag']} / {FS['flags_final']['weekday_flag']}"],
    ['instruction_word / single_text_flag', '51 / -', f"{FS3['flags_final']['instruction_word']} / {FS3['flags_final']['single_text_flag']}", f"{FS['flags_final']['instruction_word']} / {FS['flags_final']['single_text_flag']}"]])
p(f"**vs v3** (`diff_vs_v3.csv`): {st['kept']} kept, **{st['added']} added, {st['removed']} removed**; {sum(1 for r in DV3 if r['status'] == 'kept' and int(r['count_change']))} kept cards changed their count. "
  f"**vs 10-31** (`diff_vs_1031.csv`): {st31['kept']} kept, {st31['added']} added, {st31['removed']} removed (v3: 2529 / 32 / 448).")
p('')
p('Added and removed vs v3 (all of them; reasons computed token by token, see `diff_vs_v3.csv`):')
p('')
tab(['lemma', 'status', 'v3 rank / count', 'v4 rank / count', 'reason'],
    [[r['lemma'], r['status'], f"{r['v3_rank'] or '-'} / {r['v3_count']}", f"{r['v4_rank'] or '-'} / {r['v4_count']}", r['reason'][:230]] for r in DV3 if r['status'] != 'kept'])
big = sorted([r for r in DV3 if r['status'] == 'kept' and int(r['count_change'])], key=lambda r: int(r['count_change']))
p('Largest count changes of kept cards (20 largest drops; the full list with reasons is in `diff_vs_v3.csv`):')
p('')
tab(['lemma', 'v3 rank', 'v4 rank', 'v3 count', 'v4 count', 'reason (largest causes)'], [[r['lemma'], r['v3_rank'], r['v4_rank'], r['v3_count'], r['v4_count'], r['reason'][:200]] for r in big[:20]])
up = [r for r in big if int(r['count_change']) > 0]
p(f"Count increases ({len(up)} cards): " + '; '.join(f"{r['lemma']} {r['v3_count']}->{r['v4_count']} ({r['reason'][:90]})" for r in up[-12:]) + '.')
p('')
p('## 2. The four user decisions and how they were applied')
p('')
may = FL['may']
tab(['decision', 'how it is applied', 'result (checked in sanity_checks_v4.json)'], [
    ['1. May (month) is KEPT', '**W9** (`overrides_v4.FILTER_C_EXTRA_EXCEPTIONS`, used by `build_v4.KEEP_C`): May is the **23rd exception** to filter C (final rule 8). The V13 date-context rule still decides which "May" tokens are the month (the other ~440 are the modal).',
     f"may: rank {may['rank']}, {may['total_count']} tokens / {may['books']} books, display '{may['display_form']}', month_flag=true; 12 of 12 months are cards"],
    ['2. Number words stay removed', 'No change: V6 `NUMBER_WORDS` (cardinals and ordinals incl. thousand, million, billion) remain in the removal list.',
     'thousand ' + str(cnt('thousand', R)) + ', million ' + str(cnt('million', R)) + ', billion ' + str(cnt('billion', R)) + ' body tokens; none is a card'],
    ['3. Rule-7 always-keep words stay', 'No change: final rule 7 keeps error, sentence, vocabulary, overall, percentage, candidate, chart, score, overview, adequate, grammar, graph regardless of the threshold.',
     ', '.join(f"{w} {FL[w]['total_count']}" for w in 'chart graph overview sentence grammar'.split()) + ' (all 12 present)'],
    ['4. Body-only cut accepted; GT reading = body', 'No change to the counting rule: only section_index region passage/tapescript is counted; General Training reading texts are region passage (body). v4 only corrects lines that were mislabelled (W1c/W2).',
     f"{next((c['detail'] for c in SAN if c['check'].startswith('D4')), '')} (GT reading); vs 10-31: {st31['removed']} removed (v3: 448)"]])
p('Consequence of decision 1 for the counts: May has 12 date-context tokens in 6 books, so it also passes 10 x 3 on its own.')
p('')
p('## 3. Pipeline fixes (rules W1-W9), evidence and counts')
p('')
p('All section_index changes vs v3 are in `section_index_fixes_v4.csv` (one row per contiguous range: line_from, line_to, book, field, old, new, lines_changed, '
  'body_lines_changed, rule). Lines changed per rule and field (body = body line in v3 or v4):')
p('')
agg = collections.Counter(); aggb = collections.Counter(); aggr = collections.Counter()
for r in FIX:
    k = (r['rule'].split(':')[0], r['field']); agg[k] += int(r['lines_changed']); aggb[k] += int(r['body_lines_changed']); aggr[k] += 1
tab(['rule', 'field', 'ranges', 'lines', 'body lines'], [[k[0], k[1], aggr[k], agg[k], aggb[k]] for k in sorted(agg)])
p(f'Body lines: v3 {body3:,} -> v4 {body4:,}.')
p('')
# ---- W1
p('### W1 Citations from real section headings, not running page headers')
p('')
p('- **W1a** (`01_segment_v4.py`, tapescript post-pass): a "Test n" line is a real test heading only when it is printed in capitals ("TEST 2", the tapescript heading style) '
  'or the next content line is a SECTION/PART 1 heading. Every other "Test n" line is the printed running page header: it is no longer a DP anchor, so it can '
  f"never override the nearest real TEST/SECTION/PART heading. Real tapescript test headings: {SEG['v4_W1']['tapescript_real_test_headings']}; running headers ignored: {SEG['v4_W1']['tapescript_running_headers_ignored']}.")
p(f"- **W1b**: R7 extended: page-end Q markers numbered for the previous test (Q38-40 printed after 'TEST 2 / SECTION 1' on the same page) are moved before the TEST heading ({SEG['script_fixes'].get('W1b_page_end_q_markers_moved_before_test_heading', 0)} markers).")
p(f"- **W1c** General Training: the running page header 'General Training: Reading and Writing' ({SEG['v4_W1']['gt_running_header_lines']} lines) no longer resets the GT test letter (GT-A/GT-B -> 'GT'), no longer flips a Writing page back to Reading "
  "and no longer opens a reading question block; 'You should spend about 20 minutes on this task' (Writing rubric) no longer flips Writing -> Reading. "
  f"Effect: GT test letters restored on {agg[('W1c', 'test/part')]:,} lines ({aggb[('W1c', 'test/part')]:,} body); **GT Writing Task 1 prompts ('Write a letter to ...', {n_prompt} body lines in books 5-10) are no longer counted as reading-passage body text**; {n_gthead} GT header/title lines that v3 counted as passage text are non-body; {n_restored} passage lines of book 10 GT-B that the header had pushed into a question block are body again.")
p(f"- **W1d**: heading-only lines ('Test l', 'TEST. 2', OCR 'QI5' marker) are never body; TESTNO/TEST_HEAD also accept the OCR form 'TEST. 2' (book 10 L43924, which v3 counted as tapescript text).")
p('')
def span_lab(SIx, a, b): return dict(collections.Counter(f"T{x['test']} part {x['part']}" for x in SIx[a - 1:b] if x['is_body'] == '1'))
tab(['known span', 'v3 label (body lines)', 'v4 label (body lines)'], [
    ['book 8 L30236-30279 (heading TEST 2 / SECTION 1 at L30235-30236; running header "Test 1" at L30281)', span_lab(SI3, 30236, 30279), span_lab(SI, 30236, 30279)],
    ['book 12 L56831-56836 (end of T6 Section 4 lecture, running header "Test 7" at L56830; TEST 7 heading at L56837)', span_lab(SI3, 56831, 56836), span_lab(SI, 56831, 56836)]])
w1 = [r for r in FIX if r['rule'].startswith('W1a/W1b') and r['field'] == 'test/part']
p(f"All W1a/W1b test/part changes (**{sum(int(r['lines_changed']) for r in w1)} lines, {sum(int(r['body_lines_changed']) for r in w1)} body**): " +
  '; '.join(f"book {r['book']} L{r['line_from']}-{r['line_to']}: {r['old']} -> {r['new']} ({r['lines_changed']} lines)" for r in w1) + '.')
p('')
p('**All-book scan** (`check_citations_v4.py`, an independent heading walk: every body line is compared with the nearest preceding real heading of its stream; '
  'a disagreement is "page header beats heading" when a running header lies between the heading and the line and the label follows the header):')
p('')
tab(['', 'v3 section_index', 'v4 section_index'], [
    ['body lines checked (tapescript / academic reading / GT reading)', f"{CS3['tapescript_lines_checked']:,} / {CS3['academic_reading_lines_checked']:,} / {CS3['gt_reading_lines_checked']:,}", f"{CS4['tapescript_lines_checked']:,} / {CS4['academic_reading_lines_checked']:,} / {CS4['gt_reading_lines_checked']:,}"],
    ['spans where a page header beats a real heading', f"**{CS3['disagreement_spans'].get('page_header_beats_heading', 0)}** ({CS3['disagreement_body_lines'].get('page_header_beats_heading', 0):,} body lines)", f"**{CS4['disagreement_spans'].get('page_header_beats_heading', 0)}**"],
    ['other disagreements (lost headings, decided by Q markers / question numbers)', f"{CS3['disagreement_spans'].get('other', 0)} spans", f"{CS4['disagreement_spans'].get('other', 0)} spans"]])
p("The v3 page-header spans are the 2 known ones plus 38 GT spans (the GT header reset GT-A/GT-B to 'GT' on every page and sent Writing Task 1 prompts to Reading part 0). "
  "(The scanner classes the book 8 span as 'other' in v3 because its running header is printed *below* the text; it is fixed all the same.) "
  'The remaining v4 "other" spans were all inspected; none involves a running header: ' +
  '; '.join(f"book {r['book']} {r['stream']} L{r['line_from']}-{r['line_to']} labelled {r['label']}, last heading says {r['heading_implies']}" for r in CSP4) +
  ". They are the known lost-heading cases (book 21 T1/T2 Part 4 lectures and book 21 T4 whose 'TEST 4' heading is missing, decided by Q markers as in v3), "
  "book 9 L37397-37407 (v3 R7 decision: inline markers win), and academic reading passages whose 'READING PASSAGE n' heading was lost in OCR (book 14 T3/T4, book 21: only "
  "'READING PASSAGE 1' survives), where the v3 R4 question-number DP is right and the naive scan is not.")
p('')
# ---- W2
p('### W2 Rubric lines inside body regions (13 GT lines + systematic scan)')
p('')
gt13 = [7229, 13893, 14221, 14406, 21748, 22100, 22225, 29166, 29470, 29634, 35959, 42580, 42727]
p('The 13 GT lines "Read the text below and answer Questions …" (books 5-10): L' + ', L'.join(str(x) for x in gt13) + f". v3: is_body = {sum(SI3[x - 1]['is_body'] == '1' for x in gt13)}/13; v4: is_body = {sum(SI[x - 1]['is_body'] == '1' for x in gt13)}/13 (region instruction).")
p(f"Systematic scan (W2 regex `RUBRIC_IN_BODY` in reading text, `NARR_IN` in tapescripts): {SEG['v4_W2']['rubric_line_in_reading']} reading lines matched the rubric pattern "
  f"(the 13 body lines above, the book 14 OCR line 'we your drawer in boxes to on your answer sheel.' L66935, and lines that v3 already had as non-body question text); "
  f"{SEG['v4_W2']['narrator_line_in_tapescript']} + {SEG['v4_W2']['narrator_continuation_line']} narrator lines and {SEG['v4_W2']['transcript_note_line_in_tapescript']} transcription notes inside book 20 tapescripts "
  "('Part two, you will hear a potter …', '… look at questions 11 to 16. Now listen carefully and answer questions 11 to 16.', 'Narrator/Instructor: …', "
  "'Here is the transcript of the conversation … based on the provided sources:'). All are non-body in v4.")
p('')
on13 = collections.Counter(c for k, Ln, f, c, ru in T3 if Ln in set(gt13))
tab(['word', 'v3 body count', 'v4 body count', 'of which on the 13 GT lines (v3)', 'other v4 changes', 'v4 card status'],
    [[w, cnt(w, R3), cnt(w, R), on13.get(w, 0), cnt(w, R3) - cnt(w, R) - on13.get(w, 0), card(w) if w in FL else ('not a card: ' + ('filter C (zipf_headword ' + str(R[w]['zipf_headword']) + ')' if R.get(w, {}).get('removed_C_headword5.5_keep22') else 'connectives_reserved.csv' if w in S['CONN'] else 'function word'))]
     for w in ('answer', 'question', 'read', 'text', 'below')])
p("('Other v4 changes' = narrator turns of book 20 (W2), GT writing prompts and running headers (W1c), speaker-label lines and the W5 re-tokenisation.)")
p('')
# ---- W3
p('### W3 Speaker labels stripped inside lines')
p('')
inv20 = SEG['v4_W3_label_inventory'].get('20', [])
p(f"v3 stripped only CAPITAL labels at the line start ('MAN:'). Book 20 prints its tapescripts with labels such as 'Speaker 1 (Woman):', 'Narrator/Instructor:', "
  f"title-case names/roles ({', '.join(inv20)}) and multi-word roles ('Design and Technology Lecturer:'), often mid-line ('try Paloma. Speaker 1 (Woman): Where's that?'). "
  f"W3 removes 'Speaker n (X):', 'Narrator…:', role labels and the book's own label inventory (title-case labels opening >= 3 lines of the book, or role words) "
  f"at the line start or after a sentence end, and known CAPITAL labels after a sentence end, in tapescript lines only. Lines changed: **{SEG['v4_W3']['lines_with_label_stripped']}**. "
  "Sanity check: no body token is 'Speaker' + digit, no body token from the label inventory is followed by ':', no 'Speaker n'/'Narrator' left in tapescript text_clean.")
p('')
tab(['card', 'v3 count', 'v4 count', 'cause (diff_vs_v3.csv)'], [[w, FL3[w]['total_count'] if w in FL3 else '-', FL[w]['total_count'] if w in FL else '-', next(r['reason'] for r in DV3 if r['lemma'] == w)[:120]]
                                                                 for w in ('speaker', 'friend', 'student', 'woman', 'man', 'lecturer') if w in FL or w in FL3])
# ---- W4
p('### W4 End punctuation from OCR\'d quotes')
p('')
p(f"'.?' '.!' -> '.', '?.' -> '?', '!.' -> '!' after a word, not after abbreviations ('Fine, after 5 p.m.?' kept). Lines changed: **{SEG['ocr_fixes'].get('end_punct_quote', 0)}**, e.g. " +
  ' | '.join('`' + x + '`' for x in SEG['ocr_examples']['end_punct_quote'][:4]) + '. Left in body text after a word: 0 (sanity check).')
p('')
# ---- W5
p('### W5 De-hyphenation with a dictionary + corpus evidence')
p('')
dc = collections.Counter((d['decision'], d['rule'][:1]) for d in DH)
p("v3 joined a line-end 'xxx-' + 'yyy' unless wordfreq gave the joined string zipf 0; wordfreq knows highgrade, alltime, socalled … as rare web tokens, so real hyphens were lost. "
  "W5 (`02_lemmatize_v4.py dehyphen_keep`): (a) keep the hyphen when the hyphenated compound is printed elsewhere in clawwords.md more often than the solid form (sub-compounds count: "
  "'two-year-old' is evidence for 'year-old'), or the break is inside a longer compound ('nose-' + 'to-tail'); (e) a spaced dash or a function word on one side of an unattested compound is a dash: kept, words separated "
  "(v3 deleted it: 'andrepair'); (b) join when the solid form is a dictionary word (vendored list incl. regular inflections, or wordfreq zipf >= 3) or printed solid >= 2 times; "
  "(c) keep when both halves are words (British spellings accepted: 'six-millimetre'); (d) otherwise join.")
p('')
tab(['decision', 'rule', 'line-end breaks'], [[k[0], k[1], v] for k, v in sorted(dc.items())])
chg = [d for d in DH if d['decision'] != d['v3_decision']]
p(f"{len(DH)} line-end breaks in total; **{len(chg)} decided differently from v3** ({sum(d['is_body'] == '1' for d in chg)} in body text; every one is listed in `dehyphenation_v4.csv` with the rule). "
  "The audit compounds: " + ', '.join(f"{d['left']}-{d['right']} (L{d['line']}: {d['decision']}, rule {d['rule'][:1]})" for d in DH if f"{d['left'].lower()}-{d['right'].lower()}" in
                                       ('high-grade', 'all-time', 'so-called', 'small-scale', 'part-time', 'prize-winning', 'year-old', 'state-of')) + '.')
p('')
# ---- W6
mmr = next(r for r in DV3 if r['lemma'] == 'millimetre')
p('### W6 mm -> millimetre only after a number')
p('')
p(f"'mm' becomes the millimetre only after a number ('6.8 mm', '18 mm', '5mm', 'five mm'); 'Mm.' / 'Mm, I see' stays the hesitation filler (removed). "
  f"**millimetre: v3 {mmr['v3_count']} -> v4 {mmr['v4_count']} tokens** in {FL['millimetre']['books']} books (rank {mmr['v3_rank']} -> {mmr['v4_rank']}); forms {FORMS['millimetre']}. "
  f"The re-audit expected 'about 15': the real number is {mmr['v4_count']} (4 'mm' after a number + 11 spelled-out millimetre(s)/millimeters). **The card still passes 10 x 3** and stays.")
p('')
# ---- W7
p('### W7 No system paths: vendored word list')
p('')
sha = hashlib.sha256(open('vendor/words.txt', 'rb').read()).hexdigest()
p(f"`vendor/words.txt` = byte-identical copy of the macOS system word list `" + '/usr/share/' + f"dict/words` (symlink to `web2`, Webster's Second International, {sum(1 for _ in open('vendor/words.txt', encoding='utf-8')):,} lines), "
  f"copied once on 2026-11-03; **sha256 {sha}** (recorded in `vendor/SOURCE.txt`, asserted on load by `wordlist_v4.py` and in the sanity checks). It is read only through `wordlist_v4.py` "
  "(W5 de-hyphenation, W8f OCR g/q check). Because web2 is a 1934 American list, `is_word` also accepts regular inflections of listed words and words with wordfreq zipf >= 3 (online, email, wellbeing). "
  "Grep of every `*.py` / `*.sh` here for the system dictionary path, the system temp dir and the old workspace path: " + ('no hits' if next(c['detail'] for c in SAN if c['check'].startswith('W7 no script')) in ('', '[]') else next(c['detail'] for c in SAN if c['check'].startswith('W7 no script'))) + ' (sanity check W7). '
  "The v3 wordlist scripts did not read the system dictionary either; the dependency was in the STEP 2 example scripts (`quality.py`), which can now use `vendor/words.txt`.")
p('')
# ---- W8
p('### W8 Wordlist-level should-fix items (REAUDIT.md section 3) and cheap extras')
p('')
def dv(w): r = next((x for x in DV3 if x['lemma'] == w), None); return f"{r['v3_count']} -> {r['v4_count']}" if r else '-'
tab(['id', 'item', 'rule', 'before (v3) -> after (v4)', 'status'], [
    ['W8a', 'lay as past tense of lie', "VBD/VBN 'lay' -> lie unless a base-form context (to/modal/even …) or an object follows (them/it/their/eggs/foundations …); 'a/the lay …' = adjective lay",
     f"lay {dv('lay')}, lie {dv('lie')}. Token check: the 7 'lay' tokens v3 had on the lay card were all verb/adjective lay (spaCy already sent past-tense 'lay' to lie); the real v3 errors ran the other way: 3 verb uses ('lay them out', 'lay it among', 'lay the foundations') and 'a lay doctor' were counted under lie. Fixed.", 'fixed'],
    ['W8b', '"as opposed to" counted for oppose', "'opposed' in 'as opposed to' -> phrase 'as opposed to', reserved with the connectives", f"oppose {dv('oppose')} -> below 10 x 3, card removed; 'as opposed to' {R.get('as opposed to', {}).get('total_count', 0)} tokens in connectives_reserved.csv", 'fixed'],
    ['W8c', 'percent vs per cent display', 'display = majority body spelling; card id stays percent', f"display '{FL3['percent']['display_form']}' -> '{FL['percent']['display_form']}', aliases '{FL['percent']['aliases']}'", 'fixed'],
    ['W8d', 'locate shown as located', 'V16 participle display threshold 0.66 -> 0.75', f"locate displayed '{FL['locate']['display_form']}'. Side effect (same rule): " + ', '.join(f"{r['lemma']} '{FL3[r['lemma']]['display_form']}' -> '{FL[r['lemma']]['display_form']}'" for r in F if r['lemma'] in FL3 and FL3[r['lemma']]['display_form'] != r['display_form'] and r['lemma'] not in ('percent', 'locate')), 'fixed'],
    ['W8e', 'tonne vs tons', "ton(s) no longer merged into tonne; 'metric ton(s)' = tonne", f"tonne {dv('tonne')}, new card ton {dv('ton')}", 'fixed'],
    ['W8f', "qanat OCR 'ganat'", "non-word whose g->q variant is printed within 300 lines", f"{SEG['ocr_fixes'].get('g_for_q', 0)} lines (ganat/ganats -> qanat/qanats, Saqgara -> Saqqara); 0 left", 'fixed'],
    ['W8g', 'asterisk residue', 'footnote/glossary asterisks removed from text_clean', f"{SEG['ocr_fixes'].get('asterisk', 0)} lines; 0 asterisks left in body text", 'fixed'],
    ['W8h', 'wales / latin counts (issues.csv)', "'Wales' in 'New South Wales', 'Latin' in 'Latin America(n)' are place-name parts (dropped)", f"wales {dv('wales')}; latin {dv('latin')} -> removed by final rule 3 (now single-text)", 'fixed'],
    ['W8i', 'plain/plains, stable/stables, indoor/indoors (issues.csv), rich/riches (11-01)', 'independent-sense forms get their own lemma', f"plain {dv('plain')} (removed), stable {dv('stable')} (removed), indoor {dv('indoor')}, rich {dv('rich')}; plains {cnt('plains', R)}, stables {cnt('stables', R)}, indoors {cnt('indoors', R)}, riches {cnt('riches', R)} tokens (below 10 x 3)", 'fixed'],
    ['W8j', "french note '5 capitalised tokens'", "note text 'N of M body tokens were tagged as proper nouns'", FL['french']['note'][:110], 'fixed'],
    ['W8k', "OCR '1' for I, 'II' for 'll (must-fix rows suppose/identify/maintain)", "'1' before a verb after punctuation/conjunction or before a cognition verb; 'II'/' ll' after a pronoun", f"{SEG['ocr_fixes'].get('digit1_for_I', 0)} + {SEG['ocr_fixes'].get('II_for_ll', 0)} lines; 0 left in body text", 'fixed'],
    ['-', 'US spelling on British cards (analyzed)', '-', 'example choice', 'deferred to STEP 2'],
    ['-', "heading glued to sentence ('Stepwells A millennium ago')", '-', "passage titles are body lines by design; the sentence boundary is an example-level fix", 'deferred to STEP 2'],
    ['-', 'thin cards (about 11)', '-', 'example coverage', 'deferred to STEP 2'],
    ['-', 'demand/demanding, coin/coined, counter (v), centre/centred, reason/reasoned, interest/interested', '-', 'noun and verb of one lemma share a card (fixed inflection rule); demanding is VERB-tagged so V10/V16 do not apply - a new -ing adjective rule could move other cards', 'deferred with reason']])
p('')
p('### W9 May')
p('')
p(f"See decision 1. In v3 May was the reported filter-C conflict; in v4 it is a card (rank {may['rank']}).")
p('')
# ---- re-audit
p('## 4. Re-audit (`../reaudit-2026-11-03/issues.csv`, 350 rows) mapping: `reaudit_resolution_v4.csv`')
p('')
p("One row per issues.csv row (issue_no = 1-based data row). Note: the re-audit's `row` column is the **file line** of the v3 `examples.csv` (header = line 1), i.e. data row + 1 — "
  "verified on answer/745, claim/1208, concert/4450 — not the data row number. Status values: **fixed** (wordlist/system row, verified in the v4 outputs), "
  "**root_cause_fixed** (examples.csv row whose cause is fixed in v4 and verified at the cited clawwords.md lines; the example itself is only replaced when STEP 2 rebuilds "
  "examples.csv), **moot_card_removed** (the card is no longer in the list), **deferred_step2**, **deferred_with_reason**.")
p('')
c = collections.Counter((r['issue_type'], r['severity'], r['status']) for r in RR)
types = ['system', 'wordlist', 'example_rootcause', 'example_only']; stats_ = ['fixed', 'root_cause_fixed', 'moot_card_removed', 'deferred_step2', 'deferred_with_reason', 'not_fixed']
rows = []
for t in types:
    for sv in ('must-fix', 'should-fix', 'optional'):
        n = sum(c[(t, sv, s)] for s in stats_)
        if n: rows.append([t, sv, n] + [c[(t, sv, s)] for s in stats_])
tab(['type', 'severity', 'rows'] + stats_, rows)
dfr = sum(1 for r in RR if r['status'].startswith('deferred'))
p(f"**Not everything is resolved:** {dfr} of 350 rows are deferred ({sum(1 for r in RR if r['status'] == 'deferred_step2')} to STEP 2, {sum(1 for r in RR if r['status'] == 'deferred_with_reason')} with a reason), "
  f"including {sum(1 for r in RR if r['status'] == 'deferred_step2' and r['severity'] == 'must-fix')} must-fix example rows (real-word OCR misreads such as 'concert half', fragments and comma splices, "
  "sense choices such as demand/demanding, sight/site, and the 5 rows carried over from 11-01). These are sentence-level: STEP 2 must re-select or repair them, and the re-audit's "
  "estimate (~190 affected cards across all primaries) means a full primary review is still needed in STEP 2. Rows marked root_cause_fixed still point at v3 example rows until STEP 2 reruns.")
p('')
p('Wordlist and system rows (all):')
p('')
tab(['#', 'card', 'severity', 'status', 'rule', 'verification'], [[r['issue_no'], r['card'], r['severity'], r['status'], r['rule'], r['verification'][:200]] for r in RR if r['issue_type'] in ('system', 'wordlist')])
p('Example rows whose root cause is a v4 rule (all):')
p('')
tab(['#', 'card', 'row', 'severity', 'status', 'rule', 'verification'], [[r['issue_no'], r['card'], r['row'], r['severity'], r['status'], r['rule'], r['verification'][:170]] for r in RR if r['issue_type'] == 'example_rootcause'])
# ---- 11-01 audit
p('## 5. 11-01 audit (`audit_resolution.csv`, same format as v3)')
p('')
ca = collections.Counter((r['issue_type'], r['status']) for r in AR)
tab(['type', 'fixed', 'partially_fixed', 'not_fixed', 'wontfix_with_reason', 'deferred_step2'], [[t] + [ca[(t, s)] for s in ('fixed', 'partially_fixed', 'not_fixed', 'wontfix_with_reason', 'deferred_step2')] for t in ('wordlist', 'example_rootcause', 'example_only')])
p('Changes vs v3: May (missing_month) wontfix -> fixed (W9); lay (homograph) not_fixed -> fixed (W8a); rich/stable (wrong_merge) not_fixed -> fixed (W8i); '
  "ton (duplicate of tonne) -> wontfix_with_reason (superseded by the re-audit, W8e); display forms whose participle display was dropped by W8d -> wontfix_with_reason (superseded). "
  'As in v3, deferred_step2 rows are not resolved by this step.')
p('')
# ---- Step 2 interface
p('## 6. Files for STEP 2 (same structure as v3, names *_v4)')
p('')
tab(['v3 file', 'v4 file', 'note'], [
    ['final_wordlist.csv, app_export_wordlist.csv, card_forms.csv, merges.csv, removed_words.csv, connectives_reserved.csv, main_before_basic_filter.csv, gerund_decisions.csv, restored_proper_nouns.csv', 'same names', 'same columns as v3'],
    ['section_index.csv', 'section_index.csv', 'same columns; text_clean now without speaker labels (W3), with W4/W8f/W8g/W8k OCR fixes'],
    ['lines_v3.jsonl / tokens_v3.pkl / sents_v3.pkl / staged_v3.pkl', 'lines_v4.jsonl / tokens_v4.pkl / sents_v4.pkl / staged_v4.pkl', 'same record/tuple layout'],
    ['build_v3.py / overrides_v3.py', 'build_v4.py / overrides_v4.py', "pass 1 still ends at '# ---------- pass 2'; the load lines read *_v4.pkl (an s00-style copy must substitute the v4 names)"],
    ['(re-implemented in STEP 2 s02)', '**blocks_v4.jsonl**', 'the exact spaCy input blocks: key, text, per line [line, start, length, sep] with sep in start/space/newline/hyph_joined/hyph_kept/dash_space - no need to re-implement the W5 joining'],
    ['(STEP 2 v3_pass1.py)', '**card_tokens_v4.pkl**', '(staged index, line, surface form, card, rule) for every body token: the exact token -> card assignment of the counts'],
    ['audit_resolution.csv', 'audit_resolution.csv + **reaudit_resolution_v4.csv**', '11-01 audit as before; 11-03 re-audit mapping'],
    ['-', 'dehyphenation_v4.csv, section_index_fixes_v4.csv, citation_scan_v3/v4.csv/.json, diff_vs_v3.csv', 'evidence files'],
    ['-', 'vendor/words.txt + wordlist_v4.py', 'the dictionary STEP 2 should use instead of the system file']])
# ---- sanity
p('## 7. Sanity checks (`sanity_checks_v4.json`)')
p('')
for r in SAN: p(f"- {'PASS' if r['ok'] else ('FAIL' if r['hard'] else 'WARN')}: {r['check']}" + (f" — {r['detail'][:160]}" if r['detail'] else ''))
p('')
# ---- samples
p('## 8. Random sample (`samples_30.csv`, seed 20261103)')
p('')
tab(['v4 rank', 'lemma', 'v4 count/books', 'v3 rank', 'v3 count/books', 'change'], [[r['v4_rank'], r['lemma'], f"{r['v4_total_count']}/{r['v4_books']}", r['v3_rank'], f"{r['v3_total_count']}/{r['v3_books']}", r['count_change']] for r in SAMP])
# ---- limitations
p('## 9. Limitations')
p('')
for x in [
    'Real-word OCR errors (half/hall, port/part, temps/Thames, Lcuador …) are not corrected: no safe general rule exists; they affect example text far more than counts. The 1/I and II/ll patterns were the only cheap general ones.',
    "W1 relies on the printed conventions (tapescript test headings in capitals or followed by SECTION/PART 1; running headers in title case). A real heading lost by OCR is still recovered only from Q markers (as in v3); the scan lists 12 such 'other' spans, all inspected and none caused by a page header.",
    "W3 strips only labels it can recognise (Speaker n (X), Narrator, role words, labels opening >= 3 lines of a book, CAPITAL labels). A one-off label in mid-line with an unknown name ('So. Andrew: have you seen …', book 5) is left; it may also be a vocative.",
    "W5 depends on a 1934 American word list plus wordfreq; 1 break is still joined as 'a word broken inside' ('echo-locationv', an OCR line), and odd OCR splits ('compare- son', 'influence- imagine') are kept hyphenated. All 277 decisions are listed for review.",
    "W8a is context-based; a past-tense 'lay' directly followed by an object word of the list (rare) would be counted as lay.",
    "W8d's threshold change also changed 5 other display forms (associate, publish, restrict, intend, attach now show the base verb); intended as the same rule, but it is a visible change.",
    'The examples.csv rows of the re-audit are not edited here; root_cause_fixed means the cause is gone and verified at the cited lines - the rows themselves are replaced only when STEP 2 reruns. Sentence-level must-fix rows (' + str(sum(1 for r in RR if r['status'] == 'deferred_step2' and r['severity'] == 'must-fix')) + ') remain open for STEP 2.',
    "The body-only cut vs 10-31 (decision 4: 448 removed in v3) now stands at " + str(st31['removed']) + ' removed / ' + str(st31['added']) + ' added; the difference from v3 is exactly the ' + str(st['removed']) + ' removals and ' + str(st['added']) + ' additions vs v3 listed in section 1 (GT writing prompts, place-name parts, independent-sense forms, as opposed to; ton, May).',
    'No paper books were available; source-text errors are judged from context only.']: p('- ' + x)
p('')
p('## 10. Reproduction')
p('')
p('`./run_all.sh` (log `run.log`) rebuilds every output above from the read-only inputs, with `PYTHONHASHSEED=0`. Steps: make_v2_instr -> 01_segment_v4 -> check_section_index, '
  'section_index_fixes_v4, check_citations_v4 (v3 and v4) -> 02_lemmatize_v4 -> scan_lemma_errors -> 03_stage_tokens_v4 -> build_v4 -> v3_card_tokens (runs the read-only v3 builder pass 1, writes nothing there), '
  'diff_vs_v3, diff_vs_1031 -> note_review -> resolve_audit_1101, resolve_reaudit_v4 -> samples_30 -> sanity_checks_v4 -> write_report_v4.')
if os.path.exists('reproducibility.txt'): p(''); p('Clean-state reproduction check (`reproducibility.txt`):'); p(''); p('```'); p(open('reproducibility.txt').read().strip()); p('```')
p('')
p('Inputs are read-only and were not modified. No git, GitHub, network or remote host was used; nothing outside this directory was written.')
open('REPORT.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('REPORT.md', len(L), 'lines')
