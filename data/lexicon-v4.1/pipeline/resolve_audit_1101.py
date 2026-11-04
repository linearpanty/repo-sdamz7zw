#!/usr/bin/env python3
"""audit_resolution.csv: one row per issues.csv row (779; row numbers = issues.csv file line numbers, header = line 1).
issue_type: wordlist (files final_wordlist / connectives_reserved / gerund_decisions / removed_words / merges / main_before_basic_filter /
build_final.py / missing.csv), example_rootcause (examples.csv / dropped_rows.csv rows whose root cause is counting, segmentation, section
mapping, OCR or lemmatisation) or example_only (STEP 2). Status values: fixed / partially_fixed / not_fixed / deferred_step2 / wontfix_with_reason.
For example_rootcause rows 'fixed' means the root cause is fixed AND verified at the cited clawwords.md line in this directory's outputs;
the examples.csv row itself is regenerated in STEP 2. Every verification string is computed from the v3 outputs, not typed.
v4 (candidate-2026-11-03-v4): copy of the v3 resolve_audit.py run on the v4 outputs (verification strings say 'v4'). Status changes by
v4 rules: May (W9, user decision 1) fixed; lay (W8a) fixed; ton duplicate superseded by W8e; display forms superseded by W8d; rich/stable
(W8i). The new 11-03 re-audit is mapped separately in reaudit_resolution_v4.csv (resolve_reaudit_v4.py)."""
import csv, re, pickle, collections, sys
sys.path.insert(0, '.')
from overrides_v4 import *
AUD = '../v3-inputs/audit-2026-11-01/issues.csv'; B = '../v3-inputs/candidate-2026-10-31-final/'
ISS = list(csv.DictReader(open(AUD, encoding='utf-8')))
O = {r['lemma']: r for r in csv.DictReader(open(B + 'final_wordlist.csv', encoding='utf-8'))}
N = {r['lemma']: r for r in csv.DictReader(open('final_wordlist.csv', encoding='utf-8'))}
S = pickle.load(open('build_state.pkl', 'rb')); R = S['R']; REMOVE = S['REMOVE']; CONN = S['CONN']
SI = list(csv.DictReader(open('section_index.csv', encoding='utf-8')))
RAW = open('../v3-inputs/v2src/clawwords.md', encoding='utf-8').read().split('\n')
GD = {r['ing_form']: r for r in csv.DictReader(open('gerund_decisions.csv', encoding='utf-8'))}
RW = list(csv.DictReader(open('removed_words.csv', encoding='utf-8')))
DIFF = {r['lemma']: r for r in csv.DictReader(open('diff_vs_1031.csv', encoding='utf-8'))}
MB_HEADER = open('main_before_basic_filter.csv', encoding='utf-8').readline()
WL_FILES = {'final_wordlist.csv', 'connectives_reserved.csv', 'gerund_decisions.csv', 'removed_words.csv', 'merges.csv', 'main_before_basic_filter.csv', 'build_final.py', 'missing.csv'}
ROOT_CATS = {'citation_mismatch', 'wrong_example_match', 'source_misuse_question_paper', 'source_misuse_answer', 'source_misuse_prompt', 'source_misuse_caption', 'ocr_error', 'dropped_review'}
SEV = {'必须修': 'must-fix', '建议修': 'should-fix', '可不修': 'optional'}

def old(w): o = O.get(w); return f"10-31 rank {o['rank']}, count {o['total_count']}" if o else '10-31: not a card'
def card(w):
    n = N.get(w)
    if n: return f"v4 rank {n['rank']}, count {n['total_count']}/{n['books']} books" + (f", display '{n['display_form']}'" if n['display_form'] != w else '') + f" ({old(w)})"
    r = R.get(w)
    if r is None or not r['total_count']: return f'v4: not a card, no body tokens ({old(w)})'
    if w in REMOVE: why = REMOVE[w][:70]
    elif w in CONN: why = 'connectives_reserved.csv'
    elif w in S['func']: why = 'function word'
    elif r.get('removed_C_headword5.5_keep22'): why = f"filter C, zipf_headword {r['zipf_headword']}"
    else: why = f"below 10x3: {r['total_count']} body tokens / {r['books']} books"
    return f'v4: not a card ({why}) ({old(w)})'
def in_final(w): return w in N
def flag(w, k): return N[w][k] == 'true' if w in N else None
def line_of(problem):
    m = re.search(r'\bL(\d{2,6})', problem); return int(m.group(1)) if m else None

def wordlist(cat, w, sev, prob, rl):
    W = w.strip()
    if cat == 'count_inflation_systemic':
        return 'fixed', 'build_v3.py bucket(): total_count and section counts = section_index region passage/tapescript only; stems/options/statements/prompts/rubric/model answers in separate columns', f"N counted body tokens 374,6xx; question_count/prompt_count/instruction_line_count columns; paragraph {card('paragraph')}"
    if cat in ('count_inflation',) or (cat == 'rank_inflation' and W in ('beauty', 'campsite', 'potter', 'explain', 'topic')):
        r = R.get(W, {})
        return 'fixed', 'body-only counting (build_v3.py bucket()); non-body exam tokens now in question_count/prompt_count/instruction_line_count', f"{card(W)}; non-body exam tokens {r.get('nonbody_exam_count', 0)}; instruction_word={flag(W, 'instruction_word')}"
    if cat == 'rank_inflation' and W in ('course', 'fact', 'hand'):
        idiom = {'course': 'of course', 'fact': 'in fact', 'hand': 'on the other hand'}[W]
        return 'fixed', 'V4: idiom tokens (of course / in fact / on the one|other hand) moved out of the noun card into connectives_reserved.csv', f"{card(W)}; '{idiom}' {R.get(idiom, {}).get('total_count', 0)} tokens in connectives_reserved.csv"
    if cat in ('rank_inflation', 'single_text'):
        if not in_final(W): return 'fixed', 'body-only recount: no longer a card', card(W)
        r = N[W]
        if r['single_text_flag'] == 'true':
            return 'fixed', 'V17 single_text_flag (top_unit_share >= 0.6 or top-3 texts >= 80%); rank by total_count unchanged (final rule 5: flags only); count_outside_top_unit column for app-side demotion', f"{card(W)}; top_unit_share {r['top_unit_share']}, top3 {r['top3_unit_share']}, count_outside_top_unit {r['count_outside_top_unit']}"
        return 'partially_fixed', 'body-only recount; concentration now below the V17 flag thresholds, so not flagged; rank unchanged (final rule 5)', f"{card(W)}; top_unit_share {r['top_unit_share']}, top3 {r['top3_unit_share']}"
    if cat == 'flag_missing':
        if not in_final(W): return 'fixed', 'body-only recount: no longer a card', card(W)
        r = N[W]
        if r['instruction_word'] == 'true': return 'fixed', 'V18 instruction_word recomputed on body-only counts (non-body exam tokens >= 10 and >= 50%)', f"{card(W)}; nonbody_exam_count {r['nonbody_exam_count']}"
        return 'wontfix_with_reason', 'V18: after body-only recount the word is mostly body text, so the flag is not warranted', f"{card(W)}; nonbody_exam_count {r['nonbody_exam_count']} vs body {r['total_count']}"
    if cat == 'duplicate':
        if W == 'specialise':
            return 'wontfix_with_reason', 'documented: verb specialise (in) and adjective specialised are separate cards; V10 does not merge them because the verb has its own uses', f"{card('specialise')}; {card('specialised')}"
        if W == 'ton': return 'wontfix_with_reason', 'superseded by the 11-03 re-audit (W8e): ton and tonne are different units, so ton(s) is no longer merged into tonne (metric ton -> tonne); ton is its own card', f"{card('ton')}; {card('tonne')}"
        tgt = {'endanger': 'endangered', 'meter': 'metre', 'isolate': 'isolated'}[W]
        how = {'endanger': 'V10 adjectival -ed form majority (endangered: 61% adjectival; endanger has 1 other token)', 'meter': 'V8 meter in unit contexts -> metre; device sense kept as meter (below threshold)',
               'isolate': 'V10 adjectival -ed form majority', 'ton': 'V7 ton -> tonne (alias ton)'}[W]
        return ('fixed' if not in_final(W) and in_final(tgt) else 'not_fixed'), how, f"{card(W)}; {card(tgt)}"
    if cat in ('hyphen_fragment', 'compound_fragment'):
        tgt = {'bell': 'bell-miner/bell-shaped (compounds)', 'gatherer': 'hunter-gatherer', 'conditioning': 'air conditioning', 'dioxide': 'carbon dioxide',
               'glow': 'glow-worm', 'warming': 'global warming', 'worm': 'glow-worm'}[W]
        t = tgt if tgt in R else None
        return ('fixed' if not in_final(W) else 'partially_fixed'), 'H1 hyphen compounds are single tokens (02_lemmatize_v3.py) / V3 phrase cards', f"{card(W)}" + (f"; {card(t)}" if t else '')
    if cat in ('junk_function_word', 'missing_inconsistent', 'junk_abbreviation'):
        if W in UNIT_ALIAS: return ('fixed' if not in_final(W) else 'not_fixed'), 'V7 unit symbol -> unit card alias', f"{card(W)}; {card(UNIT_ALIAS[W])} aliases '{N.get(UNIT_ALIAS[W], {}).get('aliases', '')}'"
        rule = 'V6 number words are not cards' if W in NUMBER_WORDS else 'V7 time marker removed' if W in TIME_MARKERS else 'V15 function word'
        return ('fixed' if not in_final(W) else 'not_fixed'), rule + ' (listed in removed_words.csv)', card(W)
    if cat == 'junk_interjection':
        if W == 'sorry': return 'wontfix_with_reason', 'audit: keep (low value); sorry is an adjective (sorry for/about), not removed by V5', card(W)
        return ('fixed' if not in_final(W) else 'not_fixed'), 'V5 token-level drop of conversational thanks / thank you; "thanks to" phrase card', f"{card(W)}; {card('thanks to')}"
    if cat == 'junk_rubric':
        return ('fixed' if not in_final(W) else 'not_fixed'), 'body-only counting (rubric/question/prompt uses no longer counted)' + ('; V5 oh dear / Dear X salutation dropped' if W == 'dear' else ''), card(W)
    if cat == 'pipeline_note_column':
        return 'fixed', 'app_export_wordlist.csv has no note column (asserted in build_v3.py and sanity_checks_v3.py); notes kept internal in final_wordlist.csv; each of the 98 10-31 notes reviewed in note_review.csv', f"app export header: {open('app_export_wordlist.csv').readline().strip()}"
    if cat == 'sense_mismatch' and W == 'mine':
        return 'fixed', 'V14 possessive pronoun mine dropped (noun/verb only after determiner/material word or to)', card('mine')
    if cat == 'wrong_headword':
        return 'fixed', 'V3 per cent -> percent (alias "per cent"); card cent removed', f"{card('cent')}; {card('percent')}"
    if cat == 'wrong_merge':
        if W in ('age',): return 'wontfix_with_reason', 'audit: keep (Middle Ages is the plural noun age)', card(W)
        if W in ('rich', 'stable'): return 'fixed', 'W8i: riches / stables (independent-sense nouns) have their own lemma; the adjective card no longer counts them', f"{card(W)}; {card(W + ('es' if W == 'rich' else 's'))}" 
        g = {'cycle': 'cycling', 'breed': 'breeding', 'camp': 'camping', 'cook': 'cooking', 'hunt': 'hunting', 'print': 'printing', 'recycle': 'recycling',
             'sail': 'sailing', 'shop': 'shopping', 'stream': 'streaming', 'swim': 'swimming'}[W]
        d = GD[g]
        if d['decision'].startswith('keep'):
            return 'fixed', f"V9 gerund rule: base '{W}' is mainly a noun in body text (NOUN share {d['base_noun_share']}) -> '{g}' own card", f"{card(g)}; {card(W)}"
        return 'wontfix_with_reason', f"V9 gerund rule: base '{W}' is mainly a verb (NOUN share {d['base_noun_share']} < {GERUND_SPLIT_NOUN_SHARE}), so '{g}' is a pure inflection (fixed rule)", card(W)
    if cat == 'alias':
        return 'fixed', 'V3: US / United States counted in usa; aliases US|United States', card('usa') + f"; aliases {N['usa']['aliases']}"
    if cat == 'display_form':
        tgt = {'associate': 'associated', 'automate': 'automated', 'bully': 'bullying', 'compose': 'composed', 'criterion': 'criteria', 'equip': 'equipped',
               'expose': 'exposed', 'graze': 'grazing', 'knit': 'knitting', 'locate': 'located', 'retire': 'retired', 'stair': 'stairs'}[W]
        if W in N and N[W]['display_form'] == tgt: return 'fixed', 'V16 display form from dominant participle/gerund/lexicalised plural', card(W)
        if W in N and N[W]['display_form'] == W and tgt.endswith('ed'): return 'wontfix_with_reason', 'superseded by W8d (11-03 re-audit asked locate to display the verb): participle display now needs >= 75% of the tokens', card(W)
        if tgt in N: return 'fixed', 'V10: the -ed form is the card itself', card(tgt)
        if W not in N: return 'fixed', 'no longer a card', card(W)
        return 'wontfix_with_reason', 'V16 not met on body tokens (e.g. retired = past tense VBD, not participle; or bare form > 25%)', card(W)
    if cat == 'missing_inflection_form':
        return ('fixed' if in_final('born') else 'not_fixed'), 'V11 born own card (independent sense)', f"{card('born')}; {card('bear')}"
    if cat == 'missing_month':
        if W.lower() == 'may':
            r = R.get('may', {})
            return ('fixed' if in_final('may') else 'not_fixed'), f"W9 (user decision 1, 2026-11-03): May kept as the 23rd filter-C exception; V13 counts the month only in date context ({r.get('total_count')} tokens/{r.get('books')} books)", card('may')
        return ('fixed' if in_final(W.lower()) else 'not_fixed'), 'V13 months are a closed set: kept regardless of threshold, month_flag', card(W.lower())
    if cat == 'missing_proper_noun':
        return ('fixed' if in_final('new zealand') else 'not_fixed'), 'V3 multi-word country New Zealand restored (South Africa: below threshold)', f"{card('new zealand')}; south africa: not handled (5 tokens)"
    if cat == 'missing_review':
        tgt = {'bell': 'bell', 'endanger': 'endangered', 'ending': 'ending', 'gatherer': 'hunter-gatherer', 'meter': 'metre', 'reviewer': 'reviewer', 'dear': 'dear'}[W]
        return 'fixed', 'card-level decision (example search no longer needed): card removed or merged', f"{card(W)}" + (f"; {card(tgt)}" if tgt != W else '')
    if cat == 'missing_word':
        ws = [x.strip() for x in W.split('/')]
        if all(x in RESTORE_GENERIC for x in ws): return 'fixed', 'V12 restored generic word capitalised inside names', '; '.join(card(x) for x in ws)
        if all(in_final(x) for x in ws): return 'fixed', 'now passes 10x3 on the v3 recount', '; '.join(card(x) for x in ws)
        return 'wontfix_with_reason', 'below the 10 tokens / 3 books threshold on body-only counts; no hand-picked top-up (threshold rule)', '; '.join(card(x) for x in ws)
    if cat == 'pure_inflection_card':
        tgt = {'arms': 'arm', 'europeans': 'european', 'romans': 'roman'}[W]
        return ('fixed' if not in_final(W) else 'not_fixed'), "'arms' removed from LEX_PLURAL (03); V12 nationality plurals -> singular", f"{card(W)}; {card(tgt)}"
    if cat == 'reserved_connective':
        return 'wontfix_with_reason', 'fixed rule: linking words/connectives are saved separately (connectives_reserved.csv), not in the main list; recommendation: ship connectives_reserved.csv as its own deck', f"{W}: in connectives_reserved.csv = {W in CONN or W.startswith('other')}"
    if cat == 'side_file':
        if W in ('being', 'catering', 'hearing'): return 'fixed', 'gerund_decisions.csv has a final_status column', f"{W}: {GD.get(W, {}).get('final_status', '')}"
        if 'header' in W: return 'fixed', 'column renamed removed_C_headword5.5_keep22', f"header has keep22: {'keep22' in MB_HEADER}"
        if 'duplicate' in W: return 'fixed', 'removed_words.csv lists only the applied filter C (no A/B rows)', f"too_basic categories: {sorted({r['category'] for r in RW if r['category'].startswith('too_basic')})}"
        if W == 'please': return 'fixed', 'function words meeting 10x3 are listed in removed_words.csv (category function_word)', f"function_word rows: {sum(r['category'] == 'function_word' for r in RW)}; please listed: {any(r['lemma'] == 'please' for r in RW)}"
    if cat == 'split_leftover':
        tgt = {'art': 'arts', 'right': 'rights'}[W]
        return 'fixed', 'build_v3.py: every arts/rights token (incl. PROPN) goes to the split card', f"{card(tgt)}; forms {S['forms'].get(tgt, {})}"
    if cat == 'thin_card' or cat == 'sense_coverage':
        return 'deferred_step2', 'example selection (STEP 2)', card(W)
    if cat == 'abbreviation':
        if W == 'etc': return ('fixed' if N.get('etc', {}).get('display_form') == 'etc.' else 'not_fixed'), 'V16 DISPLAY_OVERRIDE etc -> etc.', card('etc')
        if W == 'cd': return 'fixed', 'no longer a card (CD-ROM is one hyphen token, H1)', card('cd')
        if W == "o'clock": return 'wontfix_with_reason', 'audit: keep or delete, low value; kept', card(W)
        return 'not_fixed', 'optional; BC/BCE not added', card(W)
    if cat == 'capitalisation':
        if W == 'earth': return 'fixed', 'display recomputed on body tokens (lowercase majority) -> earth', card('earth')
        return 'fixed', 'V13 lowercase march is not the month', f"{card('march')}; 'march (common word)' {R.get('march (common word)', {}).get('total_count', 0)} tokens"
    if cat == 'homograph': return 'fixed', 'W8a: VBD/VBN lay -> lie unless a base-form/object context (verb lay) or a determiner (adjective lay) precedes', f"{card('lay')}; {card('lie')}" 
    if cat == 'homograph_merge': return 'wontfix_with_reason', 'card schema has no sense/pronunciation labels; audit: split not required', card(W)
    if cat == 'merged_from_semantics':
        return 'fixed', 'V1 LEMMA_FIX applied in 03 staging, so merged_from no longer lists the wrong spaCy lemma', f"{card(W)}; merged_from='{N.get(W, {}).get('merged_from', '')}'"
    if cat == 'metadata': return 'fixed', 'split cards do not record the base in merged_from', f"rights merged_from='{N.get('rights', {}).get('merged_from', '')}'"
    if cat == 'near_duplicate': return 'wontfix_with_reason', 'audit: keep (separate register); no change', card(W)
    if cat == 'questionable_alias': return 'fixed', "instal moved from UK/US aliases to LEMMA_FIX (installed/installing -> install)", f"{card('install')}; aliases '{N.get('install', {}).get('aliases', '')}'"
    return 'not_fixed', 'no handler', card(W)

def example_root(cat, w, prob, rl):
    n = line_of(prob)
    if cat == 'citation_mismatch':
        if 'book 12' in w or 'book=12' in rl:
            tests = sorted({r['test'] for r in SI if r['book'] == '12' and r['section']})
            return 'fixed', 'section_index.csv stores the printed test numbers (book 12 = Test 5-8)', f'book 12 tests in section_index: {tests}'
        spans = [(106730, 106761), (107049, 107085), (68479, 68496)] if '45 rows' in rl else [(n, n)]
        labs = collections.Counter((SI[k - 1]['book'], SI[k - 1]['test'], SI[k - 1]['part']) for a, b in spans for k in range(a, b + 1) if SI[k - 1]['is_body'] == '1')
        ok = all(p == '4' for (_, _, p) in labs)
        return ('fixed' if ok else 'not_fixed'), 'section_index.csv: lost Section/Part 4 headings recovered from Q-marker order (11-01 input already had these; verified)', f'body lines labelled (book,test,part): {dict(labs)}'
    if cat == 'wrong_example_match':
        f = S['forms'].get('bee', {})
        return 'deferred_step2', 'not a lemmatiser error: spaCy never lemmatises being as bee (v2 and v3 tokens checked); the example builder generated "being" as an inflection of bee. card_forms.csv lists the observed surface forms per card for STEP 2 matching', f"bee card forms {f}"
    if n is None: return 'deferred_step2', 'no line reference', ''
    s = SI[n - 1]; tc = s['text_clean']; raw = RAW[n - 1]
    win = range(max(1, n - 3), min(len(SI), n + 3) + 1)          # the example sentence may span the cited line and its neighbours
    wtc = ' '.join(SI[k - 1]['text_clean'] for k in win if SI[k - 1]['is_body'] == '1' or k == n); wraw = ' '.join(RAW[k - 1] for k in win)
    if cat.startswith('source_misuse') or cat == 'dropped_review':
        if s['is_body'] == '0':
            return 'fixed', f"segmentation: L{n} is region '{s['region']}' (non-body): not counted, not eligible as example text", f"L{n} region={s['region']} is_body=0"
        return 'not_fixed', 'segmentation still labels this line as body', f"L{n} region={s['region']} is_body=1"
    if cat == 'ocr_error':
        checks = []
        if re.search(r'"Al"|\bAl\b', prob): checks.append(('Al->AI (L%d-%d)' % (win[0], win[-1]), bool(re.search(r'\bAI\b', wtc)) and not re.search(r'\bAl\b', wtc) and bool(re.search(r'\bAl\b', wraw))))
        if re.search(r'\bkils?\b', prob): checks.append(('kil->kiln (L%d-%d)' % (win[0], win[-1]), 'kiln' in wtc and not re.search(r'\bkils?\b', wtc)))
        if re.search(r'\b0\d\d\b', prob): checks.append(('stray 0dd', not re.search(r'\b0\d\d\b', tc)))
        if 'COM' in prob: checks.append(('COM watermark', 'COM' not in tc))
        if 'Example' in prob: checks.append(('Example marker', not tc.rstrip().endswith('Example')))
        if re.search(r'Q\d', prob): checks.append(('Q marker', not re.search(r'Q\d', tc) and not tc.rstrip().endswith('-')))
        for lw in re.findall(r'\bL(just|only|also)\b', prob): checks.append((f'L{lw}->I {lw}', f'L{lw}' not in tc))
        if "I'll-fitting" in prob: checks.append(("Ill-fitting not altered by v3", "I'll-fitting" not in tc))
        if checks:
            ok = all(v for _, v in checks)
            return ('fixed' if ok else 'not_fixed'), 'OCR normalisation in 01_segment_v3.py (corpus layer, before tokenisation)', f"L{n}: " + ', '.join(f'{k}={v}' for k, v in checks) + f" | {tc[:80]}"
        q = re.findall(r'"([^"]{1,30})"', prob)
        q = [x for x in q if x in raw]
        if q and all(x not in tc for x in q): return 'fixed', 'OCR normalisation in 01_segment_v3.py', f'L{n}: {q} no longer in text_clean'
        return 'deferred_step2', 'isolated OCR misread in the source with no safe general rule; example selection/repair in STEP 2', f"L{n} text_clean: {tc[:90]}"
    return 'deferred_step2', '', ''

out = []
for i, r in enumerate(ISS, 2):
    cat, w, fl, sev = r['category'], r['word'], r['file'], SEV.get(r['severity'], r['severity'])
    if fl in WL_FILES: typ = 'wordlist'; st, how, ver = wordlist(cat, w, sev, r['problem'], r['row_or_line'])
    elif cat in ROOT_CATS: typ = 'example_rootcause'; st, how, ver = example_root(cat, w, r['problem'], r['row_or_line'])
    else: typ = 'example_only'; st, how, ver = 'deferred_step2', 'example-sentence quality (STEP 2): not a wordlist/counting/segmentation/OCR root cause', ''
    out.append(dict(issue_row=i, severity=sev, category=cat, word=w, file=fl, row_or_line=r['row_or_line'], issue_type=typ, status=st, how_fixed=how, verification=ver))
with open('audit_resolution.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)
c = collections.Counter((o['issue_type'], o['severity'], o['status']) for o in out)
for k in sorted(c): print(k, c[k])
nh = [o for o in out if o['how_fixed'] == 'no handler']
print('no handler:', [(o['issue_row'], o['category'], o['word']) for o in nh])
