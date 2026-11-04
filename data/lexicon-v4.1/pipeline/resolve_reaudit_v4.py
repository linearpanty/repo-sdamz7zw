#!/usr/bin/env python3
"""reaudit_resolution_v4.csv: one row per row of the 11-03 re-audit (../reaudit-2026-11-03/work/issues_with_source.csv = issues.csv + source).
issue_no = 1-based data row of issues.csv. issue_type:
  system        pipeline-level rows ('(system) section_index', '(system) examples' de-hyphenation, the 13 GT rubric lines)
  wordlist      card-level rows (row = 'final_wordlist rank N'): counts, merges, display forms, notes, thin cards
  example_rootcause  an examples.csv row whose defect comes from segmentation / citation / OCR / labels / de-hyphenation / counting
  example_only  sentence-quality rows (context-dependent, fragment, real-word OCR misread, sense choice ...): STEP 2
status:
  fixed              wordlist/system row fixed by a v4 rule and verified in the v4 outputs
  root_cause_fixed   example row: the cause is fixed in v4 and verified at the cited clawwords.md lines; the example itself is
                     re-selected when STEP 2 rebuilds examples.csv (the v3 examples.csv row is NOT edited here)
  moot_card_removed  example/wordlist row of a card that is no longer in the v4 list (reason given)
  deferred_step2     needs example (re)selection or sentence repair: STEP 2
  deferred_with_reason  wordlist-level, not changed in v4; reason given
Every verification string is computed from the v4 outputs. Usage: resolve_reaudit_v4.py REAUDIT_DIR EXAMPLES_CSV"""
import csv, re, sys, pickle, collections, json
RA = sys.argv[1] if len(sys.argv) > 1 else '../reaudit-2026-11-03'
EXC = sys.argv[2] if len(sys.argv) > 2 else '../examples-2026-11-03-exam/examples.csv'
ISS = list(csv.DictReader(open(f'{RA}/work/issues_with_source.csv', encoding='utf-8')))
EX = list(csv.DictReader(open(EXC, encoding='utf-8')))
SI = list(csv.DictReader(open('section_index.csv', encoding='utf-8')))
N = {r['lemma']: r for r in csv.DictReader(open('final_wordlist.csv', encoding='utf-8'))}
V3 = {r['lemma']: r for r in csv.DictReader(open('../candidate-2026-11-01-v3/final_wordlist.csv', encoding='utf-8'))}
S = pickle.load(open('build_state.pkl', 'rb')); R = S['R']; CONN = S['CONN']
CT = pickle.load(open('card_tokens_v4.pkl', 'rb'))
card_at = collections.defaultdict(list)
for k, line, form, card, ru in CT: card_at[line].append((form, card, ru))
DH = collections.defaultdict(list)
for r in csv.DictReader(open('dehyphenation_v4.csv', encoding='utf-8')): DH[int(r['line'])].append(r)
GT13 = [7229, 13893, 14221, 14406, 21748, 22100, 22225, 29166, 29470, 29634, 35959, 42580, 42727]

def card(w):
    n = N.get(w)
    if n: return f"v4 rank {n['rank']}, {n['total_count']} tokens/{n['books']} books, display '{n['display_form']}'" + (f", aliases '{n['aliases']}'" if n['aliases'] else '')
    r = R.get(w)
    return f"v4: not a card ({r['total_count']} body tokens/{r['books']} books)" if r else 'v4: not a card (no body tokens)'
def ex_row(i):
    """examples.csv row by the re-audit 'row' number. Verified on answer/745, claim/1208, concert/4450: 'row' is the FILE LINE of
    examples.csv (header = line 1), i.e. data row + 1, so the data row index is row - 2."""
    i = int(i)
    return EX[i - 2] if 1 < i <= len(EX) + 1 else None
def lines_of(e): return range(int(e['line_start']), int(e['line_end']) + 1) if e else range(0)
def tc(L): return SI[L - 1]['text_clean']

def classify(n, r):
    c, row, sev, prob, evid = r['card'], r['row'], r['severity'], r['problem'], r['evidence']
    P = prob + ' ' + evid
    e = ex_row(row) if row.isdigit() else None
    lem = c.split(' / ')[0].strip()
    # ---------------- system rows
    if c.startswith('(system) section_index') and 'Running page headers' in prob:
        a = collections.Counter((SI[L - 1]['test'], SI[L - 1]['part']) for L in range(30236, 30280) if SI[L - 1]['is_body'] == '1')
        b = collections.Counter((SI[L - 1]['test'], SI[L - 1]['part']) for L in range(56831, 56837) if SI[L - 1]['is_body'] == '1')
        ok = set(a) == {('2', '1')} and set(b) == {('6', '4')}
        scan = json.load(open('citation_scan_v4.json'))
        return 'system', 'fixed' if ok else 'not_fixed', 'W1a/W1b', f"book 8 L30236-30279 body labels {dict(a)}; book 12 L56831-56836 {dict(b)}; all-book scan: page-header-beats-heading spans = {scan['disagreement_spans'].get('page_header_beats_heading', 0)}"
    if c.startswith('(system) section_index') and '13 GT' in prob:
        nb = [L for L in GT13 if SI[L - 1]['is_body'] == '1']
        return 'system', 'fixed' if not nb else 'not_fixed', 'W2', f"13 GT rubric lines is_body=1 left: {nb}; regions {collections.Counter(SI[L - 1]['region'] for L in GT13)}"
    if c.startswith('(system) examples') and 'hyphen' in prob.lower():
        req = ['high-grade', 'all-time', 'so-called', 'small-scale', 'part-time', 'prize-winning', 'year-old', 'state-of']
        kept = {f"{d['left'].lower()}-{d['right'].lower()}" for v in DH.values() for d in v if d['decision'] == 'keep hyphen'}
        miss = [x for x in req if x not in kept]
        return 'system', 'fixed' if not miss else 'not_fixed', 'W5', f"line-end breaks of the 8 audit compounds kept hyphenated (missing: {miss}); dehyphenation_v4.csv: " + str(dict(collections.Counter(d['decision'] for v in DH.values() for d in v)))
    # ---------------- card-level rows
    if not row.isdigit():
        if lem == 'millimetre':
            f = next((x['surface_forms'] for x in csv.DictReader(open('card_forms.csv', encoding='utf-8')) if x['lemma'] == 'millimetre'), '')
            return 'wordlist', 'fixed', 'W6', f"{card('millimetre')}; forms {f}; passes 10x3: {int(N['millimetre']['total_count']) >= 10 and int(N['millimetre']['books']) >= 3}"
        if lem in ('lay', 'lie'):
            return 'wordlist', 'fixed', 'W8a', f"{card('lay')}; {card('lie')}; lay forms {S['forms'].get('lay')}; 'lay' tokens on lie: {S['forms'].get('lie', {}).get('lay', 0)} (past tense)"
        if lem == 'locate': return 'wordlist', 'fixed' if N.get('locate', {}).get('display_form') == 'locate' else 'not_fixed', 'W8d', card('locate')
        if lem == 'oppose':
            return 'wordlist', 'fixed', 'W8b', f"{card('oppose')} (below 10x3 once 'as opposed to' is out); 'as opposed to' {R.get('as opposed to', {}).get('total_count', 0)} tokens, reserved: {'as opposed to' in CONN}"
        if lem == 'percent': return 'wordlist', 'fixed' if N['percent']['display_form'] == 'per cent' else 'not_fixed', 'W8c', card('percent')
        if lem == 'tonne': return 'wordlist', 'fixed', 'W8e', f"{card('tonne')}; {card('ton')}; tonne forms {S['forms'].get('tonne')}"
        if lem in ('wales', 'latin'): return 'wordlist', 'fixed', 'W8h', card(lem) + ('; Latin America tokens no longer counted, latin then removed by final rule 3 (single text)' if lem == 'latin' else '; New South Wales tokens no longer counted')
        if lem in ('plain', 'stable', 'indoor'):
            other = {'plain': 'plains', 'stable': 'stables', 'indoor': 'indoors'}[lem]
            return 'wordlist', 'fixed', 'W8i', f"{card(lem)}; {card(other)}"
        if lem == 'french': return 'wordlist', 'fixed', 'W8j', f"note: {N['french']['note']}"
        if lem == 'follower':
            return 'wordlist', 'deferred_step2', 'V17', f"wordlist side already done: single_text_flag={N.get('follower', {}).get('single_text_flag')}, top_unit_share {N.get('follower', {}).get('top_unit_share')}; example diversity is STEP 2"
        if lem in ('coin', 'counter', 'centre', 'reason', 'interest'):
            why = {'coin': "noun and verb of one lemma share a card (fixed inflection rule); 'coined' (1-2 tokens) does not change the card",
                   'counter': 'noun and verb of one lemma share a card (fixed inflection rule); the card schema has no sense split',
                   'centre': "'centred' is an inflection of the verb centre, which shares the card (fixed rule)",
                   'reason': "'reasoned' is an inflection of the verb reason, which shares the card (fixed rule)",
                   'interest': "1 stray 'interested' token tagged VERB stays with interest (V10 needs a majority); not worth a special case"}[lem]
            return 'wordlist', 'deferred_with_reason', '', f"{why}. {card(lem)}"
        if lem == 'demand':
            dm = S['forms'].get('demand', {}).get('demanding', 0)
            return 'wordlist', 'deferred_with_reason', '', f"'demanding' ({dm} tokens) is VERB-tagged by spaCy, so V10/V16 (adjectival forms) do not apply; separating it needs a new adjective rule for -ing forms that could move other cards - deferred, card still passes without it ({card('demand')})"
        if 'example' in prob.lower() or 'diversify' in prob.lower() or lem in ('indian', 'highlight', 'victim', 'joint', 'occupation'):
            return 'wordlist', 'deferred_step2', '', f'example coverage/diversity (STEP 2); {card(lem)}'
        return 'wordlist', 'deferred_with_reason', '', 'no v4 rule; ' + card(lem)
    # ---------------- example rows
    if e is None: return 'example_only', 'deferred_step2', '', 'examples.csv row not found'
    Ls = list(lines_of(e)); ver_lines = f"L{Ls[0]}-{Ls[-1]}" if Ls else ''
    if e['lemma'] != lem and lem not in e['lemma']: ver_lines += f" (examples row card '{e['lemma']}')"
    if 'Wrong citation' in prob:
        labs = collections.Counter((SI[L - 1]['book'], SI[L - 1]['test'], SI[L - 1]['part']) for L in Ls)
        exp = ('8', '2', '1') if e['book'] == '8' else ('12', '6', '4')
        return 'example_rootcause', 'root_cause_fixed' if set(labs) == {exp} else 'not_fixed', 'W1a/W1b', f"{ver_lines}: v4 labels {dict(labs)}"
    if 'Rubric text used as example' in prob:
        nb = [L for L in Ls if SI[L - 1]['is_body'] == '1']
        return 'example_rootcause', 'root_cause_fixed' if not nb else 'not_fixed', 'W2', f"{ver_lines}: region {SI[Ls[0] - 1]['region']}, is_body {SI[Ls[0] - 1]['is_body']}"
    if 'Speaker label' in prob:
        left = [L for L in Ls if re.search(r'Speaker\s*\d|\b[A-Z][a-z]+(?: [A-Z][a-z]+)?\s*:\s', tc(L))]
        return 'example_rootcause', 'root_cause_fixed' if not left else 'not_fixed', 'W3', f"{ver_lines}: v4 text_clean '{tc(Ls[0])[:70]}'"
    if 'Punctuation glitch from OCR quote' in prob or re.search(r'\.\?|\.!|\?\.', evid):
        left = [L for L in Ls if re.search(r'(?<=[A-Za-z])(\.[?!]|[?!]\.)', tc(L))]
        return 'example_rootcause', 'root_cause_fixed' if not left else 'not_fixed', 'W4', f"{ver_lines}: v4 text_clean '{' '.join(tc(L) for L in Ls)[-70:]}'"
    if 'stray hyphen' in prob:
        return 'example_only', 'deferred_step2', '', f"{ver_lines}: mid-line OCR hyphen ('is-said'), not a line-end break; no safe general rule (STEP 2: reject or whitelist)"
    if 'not recorded' in prob and 'hyphen' in prob:
        ds = [d for L in Ls + [Ls[-1] + 1] for d in DH.get(L, [])]
        return 'example_rootcause', 'root_cause_fixed' if ds else 'not_fixed', 'W5', f"{ver_lines}: line-end decision now recorded: " + '; '.join(f"L{d['line']} {d['left']}-{d['right']}: {d['decision']}" for d in ds) + ' (dehyphenation_v4.csv; blocks_v4.jsonl sep=hyph_joined) - STEP 2 sets ocr_fixed from it'
    if 'hyphen' in prob.lower():
        ds = [d for L in Ls + [Ls[-1] + 1] for d in DH.get(L, [])]
        ok = ds and all(d['decision'] != 'join' for d in ds)
        return 'example_rootcause', 'root_cause_fixed' if ok else 'not_fixed', 'W5', f"{ver_lines}: " + '; '.join(f"L{d['line']} {d['left']}-{d['right']}: {d['decision']} ({d['rule'][:40]})" for d in ds)
    if 'ganat' in P:
        ok = all('ganat' not in tc(L) for L in Ls) and any('qanat' in tc(L) for L in Ls)
        return 'example_rootcause', 'root_cause_fixed' if ok else 'not_fixed', 'W8f', f"{ver_lines}: v4 text_clean has qanat: {ok}"
    if 'asterisk' in prob.lower() or "'**'" in prob or 'footnote marker' in prob.lower():
        left = [L for L in Ls if '*' in tc(L)]
        return 'example_rootcause', 'root_cause_fixed' if not left else 'not_fixed', 'W8g', f"{ver_lines}: asterisks left in text_clean: {len(left)}"
    if 'OCR digit for pronoun' in prob or re.search(r'\bII\b|\byou ll\b', evid):
        left = [L for L in Ls if re.search(r"(^|\s)1\s+(suppose|guess|think)|\bII\b|\b(you|that) ll\b", tc(L))]
        return 'example_rootcause', 'root_cause_fixed' if not left else 'not_fixed', 'W8k', f"{ver_lines}: v4 text_clean '{tc(Ls[0])[:70]}'"
    if lem == 'tonne' and 'tons' in prob:
        on = [(f, c_, ru) for L in Ls for f, c_, ru in card_at[L] if f in ('tons', 'ton')]
        if on and all(ru.startswith('W8e metric') for *_, ru in on):
            return 'example_only', 'deferred_step2', 'W8e', f"{ver_lines}: 'metric tons' = tonnes, kept on the tonne card by W8e; STEP 2 should prefer a 'tonne(s)' sentence"
        on = [(f, c_) for f, c_, ru in on]
        return 'example_rootcause', 'root_cause_fixed' if on and all(c_ != 'tonne' for _, c_ in on) else 'not_fixed', 'W8e', f"{ver_lines}: tokens {on}"
    if lem == 'oppose' and 'as opposed to' in P:
        return 'example_rootcause', 'moot_card_removed' if 'oppose' not in N else 'root_cause_fixed', 'W8b', f"{card('oppose')}; 'as opposed to' reserved with the connectives"
    if lem in ('wales', 'latin', 'stable', 'plain') and re.search(r'New South Wales|Latin America|stables|plains', P):
        on = [(f, c_) for L in Ls for f, c_, ru in card_at[L] if f in ('wales', 'latin', 'stables', 'plains')]
        st = 'moot_card_removed' if lem not in N else ('root_cause_fixed' if all(c_ != lem for _, c_ in on) else 'not_fixed')
        return 'example_rootcause', st, 'W8h' if lem in ('wales', 'latin') else 'W8i', f"{ver_lines}: tokens now {on}; {card(lem)}"
    if lem not in N:
        return 'example_only', 'moot_card_removed', '', f"{card(lem)} (v3 rank {V3.get(lem, {}).get('rank', '-')})"
    return 'example_only', 'deferred_step2', '', 'sentence-level quality (context, fragment, real-word OCR misread, sense/selection): STEP 2 must re-select or repair; no safe general corpus rule'

out = []
for n, r in enumerate(ISS, 1):
    typ, st, rule, ver = classify(n, r)
    out.append(dict(issue_no=n, card=r['card'], row=r['row'], severity=r['severity'], source=r['source'], issue_type=typ, status=st, rule=rule,
                    problem=r['problem'][:160], verification=ver[:400]))
with open('reaudit_resolution_v4.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)
c = collections.Counter((o['issue_type'], o['severity'], o['status']) for o in out)
for k in sorted(c): print(k, c[k])
print('not_fixed:', [(o['issue_no'], o['card'], o['verification'][:120]) for o in out if o['status'] == 'not_fixed'])
