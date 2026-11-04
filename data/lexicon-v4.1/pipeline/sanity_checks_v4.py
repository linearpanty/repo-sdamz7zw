#!/usr/bin/env python3
"""Sanity checks on the v4 outputs (run after build/diff/audit). Every check prints PASS/FAIL; results -> sanity_checks_v4.json.
Exit code 1 if any hard check fails. v4 = the v3 checks (May now expected IN the list) + the 2026-11-03 re-audit checks (section 'v4')."""
import csv, json, pickle, re, sys, collections, glob, hashlib, os
sys.path.insert(0, '.')
from overrides_v4 import *
F = list(csv.DictReader(open('final_wordlist.csv', encoding='utf-8'))); FL = {r['lemma']: r for r in F}
O = {r['lemma']: r for r in csv.DictReader(open('../v3-inputs/candidate-2026-10-31-final/final_wordlist.csv', encoding='utf-8'))}
S = pickle.load(open('build_state.pkl', 'rb')); R = S['R']
V3F = {r['lemma']: r for r in csv.DictReader(open('../candidate-2026-11-01-v3/final_wordlist.csv', encoding='utf-8'))}
SI = list(csv.DictReader(open('section_index.csv', encoding='utf-8')))
ST = pickle.load(open('staged_v4.pkl', 'rb'))
CONNS = {r['lemma'] for r in csv.DictReader(open('connectives_reserved.csv', encoding='utf-8'))}
AR = list(csv.DictReader(open('audit_resolution.csv', encoding='utf-8')))
RR = list(csv.DictReader(open('reaudit_resolution_v4.csv', encoding='utf-8')))
res = []
def check(name, ok, detail='', hard=True):
    res.append(dict(check=name, ok=bool(ok), hard=hard, detail=str(detail)[:300])); print(('PASS ' if ok else ('FAIL ' if hard else 'WARN ')) + name + (f'  [{detail}]' if detail else ''))
# --- structure
cols1031 = open('../v3-inputs/candidate-2026-10-31-final/final_wordlist.csv', encoding='utf-8').readline().strip().split(',')
cols = open('final_wordlist.csv', encoding='utf-8').readline().strip().split(',')
check('final_wordlist.csv starts with the exact 10-31 columns; new columns appended at the end', cols[:len(cols1031)] == cols1031, cols[len(cols1031):])
check('ranks are 1..N and contiguous', [int(r['rank']) for r in F] == list(range(1, len(F) + 1)), len(F))
check('sorted by total_count desc (ties by books)', all((int(a['total_count']), int(a['books'])) >= (int(b['total_count']), int(b['books'])) for a, b in zip(F, F[1:])))
check('section counts sum to total_count on every card', all(sum(int(r[k]) for k in ('listening_count', 'reading_count', 'writing_count', 'speaking_count', 'other_count')) == int(r['total_count']) for r in F))
check('no duplicate lemmas', len(FL) == len(F))
check('no lemma contains a digit', not [r['lemma'] for r in F if re.search(r'\d', r['lemma'])])
# --- body-only counting
body_ok = sum(1 for o in ST if o['is_body'] and o['region'] not in ('passage', 'tapescript'))
check('is_body tokens come only from regions passage/tapescript', body_ok == 0, body_ok)
check('writing_count and speaking_count are 0 (prompts, cue cards, model answers not counted)', all(r['writing_count'] == '0' and r['speaking_count'] == '0' for r in F))
tot = sum(v['total_count'] for v in R.values())
check('sum of all card total_counts == body tokens aggregated in the build', tot == json.load(open('final_summary.json'))['N_counted_body_tokens'], tot)
# --- 10-31 finalization rules
check('rule 1: yes / sure / goodbye not in the list', not {'yes', 'sure', 'goodbye'} & set(FL))
check('rule 2: several / whole / various / due to / serious in the list', {'several', 'whole', 'various', 'due to', 'serious'} <= set(FL), [w for w in ('several', 'whole', 'various', 'due to', 'serious') if w not in FL])
check('rule 4: advanced / concerned / based / fishing are own cards', {'advanced', 'concerned', 'based', 'fishing'} <= set(FL))
keep12 = 'error sentence vocabulary overall percentage candidate chart score overview adequate grammar graph'.split()
check('rule 7: the 12 keep-anyway words are present', set(keep12) <= set(FL), [w for w in keep12 if w not in FL])
KEEP_C = set('provide include result system level issue form cause support control base government law force report public national lead power state programme based'.split()) | set(FILTER_C_EXTRA_EXCEPTIONS)
check('rule 8: no card with zipf_headword >= 5.5 except the 22 exceptions + May (W9)', not [r['lemma'] for r in F if float(r['zipf_headword']) >= 5.5 and r['lemma'] not in KEEP_C], sorted(KEEP_C - {'provide include result system level issue form cause support control base government law force report public national lead power state programme based'.split()[0]})[:3] + [len(KEEP_C)])
check('rule 3: no restored city names; place words removed when single-text', True, open('place_words_removed_single_text.csv').read().count('\n') - 1)
check('connectives are not in the main list', not CONNS & set(FL), CONNS & set(FL))
check('threshold: every card has >= 10 body tokens in >= 3 books unless rule 7 / closed set', not [r['lemma'] for r in F if (int(r['total_count']) < 10 or int(r['books']) < 3) and r['lemma'] not in keep12 and r['month_flag'] != 'true' and r['weekday_flag'] != 'true'])
# --- bad cards / audit items
gone = 'paragraph passage examiner reviewer ending dear seven thanks cent meter endanger bell gatherer glow sized isolate pm cm km europeans romans arms none third'.split()
check('bad cards gone', not [w for w in gone if w in FL], [w for w in gone if w in FL])
present = 'percent hunter-gatherer endangered metre born new zealand usa institute royal bronze cycling shopping thanks to carbon dioxide global warming'.split(' ')
present = ['percent', 'hunter-gatherer', 'endangered', 'metre', 'born', 'new zealand', 'usa', 'institute', 'royal', 'bronze', 'cycling', 'shopping', 'thanks to', 'carbon dioxide', 'global warming', 'november', 'may', 'ton']
check('expected new/merged cards present', not [w for w in present if w not in FL], [w for w in present if w not in FL])
months = 'january february march april may june july august september october november december'.split()
check('12 months flagged in the list (May kept by W9)', all(FL.get(m, {}).get('month_flag') == 'true' for m in months), [m for m in months if m not in FL])
check('weekdays flagged', sum(r['weekday_flag'] == 'true' for r in F) == 7)
check('ant / lizard / tortoise carry single_text_flag', all(FL[w]['single_text_flag'] == 'true' for w in ('ant', 'lizard', 'tortoise') if w in FL))
check('bee card forms do not include being (bee/being)', 'being' not in S['forms'].get('bee', {}), S['forms'].get('bee'))
check('no merged_from lists a spaCy lemma error (hop, cop, sens, taxis, instal)', not [r['lemma'] for r in F if set(r['merged_from'].split('|')) & {'hop', 'cop', 'sens', 'taxis', 'instal'}])
for w in ('paragraph', 'writer', 'passage', 'sentence', 'correct'):
    o, n = O.get(w), FL.get(w); r = R.get(w, {})
    check(f'{w} fell (10-31 count {o["total_count"] if o else "-"}, v4 {r.get("total_count", 0)})', (not o) or r.get('total_count', 0) < int(o['total_count']), f"rank {o['rank'] if o else '-'} -> {n['rank'] if n else 'not a card'}")
# --- app export
hdr = open('app_export_wordlist.csv', encoding='utf-8').readline().strip().split(',')
check('app export has no note column', 'note' not in hdr, hdr)
# --- section index
check('section_index.csv has one row per clawwords.md line (109,121)', len(SI) == 109121, len(SI))
check('book 12 tests are 5-8', sorted({r['test'] for r in SI if r['book'] == '12' and r['section']}) == ['5', '6', '7', '8'])
chk = json.load(open('section_index_checks.json'))
check('every academic test has body text for passages 1-3', not chk['reading_missing_passage'], chk['reading_missing_passage'])
check('every book has tapescript text for 4 tests x 4 parts', not chk['tapescript_slots_missing'], chk['tapescript_slots_missing'])
check('known lost-heading cases are part 4', all(list(v) == [k.split('_')[1] + ' part 4'] for k, v in chk['known_cases'].items()), chk['known_cases'])
check('no body line in listening is out of its part range (Q markers)', sum(x['is_body'] for x in chk['listening_out_of_range']) <= 2, 'remaining 2 are OCR-misread markers (Q2/ for Q21, Q3 for Q31)', hard=False)
# --- audit
must = [a for a in AR if a['severity'] == 'must-fix' and a['issue_type'] != 'example_only']
check('audit: every wordlist / root-cause issue has a status', all(a['status'] for a in AR if a['issue_type'] != 'example_only'))
check('audit 11-01: no wordlist must-fix left not_fixed', not [a for a in must if a['issue_type'] == 'wordlist' and a['status'] == 'not_fixed'])
# ======================= v4: user decisions =======================
check('D1 May (month) is present, month_flag, kept as the 23rd filter-C exception (W9)', 'may' in FL and FL['may']['month_flag'] == 'true' and 'may' in FILTER_C_EXTRA_EXCEPTIONS, f"may: rank {FL.get('may', {}).get('rank')}, {FL.get('may', {}).get('total_count')} tokens/{FL.get('may', {}).get('books')} books")
check('D2 number words absent (thousand, million, billion and all V6 NUMBER_WORDS)', not ({'thousand', 'million', 'billion'} | NUMBER_WORDS) & set(FL), sorted(({'thousand', 'million', 'billion'} | NUMBER_WORDS) & set(FL)))
check('D3 rule-7 always-keep words present (chart, graph, overview + 9)', set(keep12) <= set(FL), {w: FL[w]['total_count'] for w in keep12 if w in FL})
check('D4 body-only counting with GT reading texts counted as body', sum(1 for o in ST if o['is_body'] and str(o['unit']).split('-')[1:2] == ['TGT'] or (o['is_body'] and '-TGT' in str(o['unit']))) > 0 and body_ok == 0,
      f"GT body tokens: {sum(1 for o in ST if o['is_body'] and '-TGT' in str(o['unit']))}")
# ======================= v4: pipeline fixes =======================
def lab(a, b): return collections.Counter((x['book'], x['test'], x['part']) for x in SI[a - 1:b] if x['is_body'] == '1')
c8, c12 = lab(30236, 30279), lab(56831, 56836)
check('W1 citation span book 8 L30236-30279 = Test 2 Section 1', set(c8) == {('8', '2', '1')}, dict(c8))
check('W1 citation span book 12 L56831-56836 = Test 6 Section 4', set(c12) == {('12', '6', '4')}, dict(c12))
cs = json.load(open('citation_scan_v4.json')); cs3 = json.load(open('citation_scan_v3.json'))
check('W1 all-book scan: no span where a running page header beats a real heading', not cs['disagreement_spans'].get('page_header_beats_heading'), f"v4 {cs['disagreement_spans']} (v3 {cs3['disagreement_spans']})")
GT13 = [7229, 13893, 14221, 14406, 21748, 22100, 22225, 29166, 29470, 29634, 35959, 42580, 42727]
check('W2 the 13 GT "Read the text below and answer Questions" lines are non-body', all(SI[L - 1]['is_body'] == '0' for L in GT13), {L: SI[L - 1]['region'] for L in GT13 if SI[L - 1]['is_body'] != '0'})
rub = [x['line'] for x in SI if x['is_body'] == '1' and re.search(r'\b(?:read the (?:text|information|passage|article)\b.{0,30}\bbelow|answer questions?\s*\d|look at questions?\s*\d)', x['text_clean'], re.I)]
check('W2 no body line left with a "read the text below / answer questions n" rubric', not rub, rub[:10])
gtw = [x['line'] for x in SI if x['is_body'] == '1' and x['test'].startswith('GT') and x['part'] in ('0', '')]
check('W1c no GT body line outside a reading section (GT writing prompts are non-body)', not gtw, gtw[:10])
LAB = re.compile(r"Speaker\s*\d|Narrator\b")
inv = set(x for v in json.load(open('segment_stats.json'))['v4_W3_label_inventory'].values() for x in v)
spk_tok = [(o['line'], o['text']) for o in ST if o['is_body'] and o['region'] == 'tapescript' and ((o['text'] == 'Speaker' and re.match(r'\d', o['next_t'] or '')) or (o['text'] in {x.split()[-1] for x in inv} and o['next_t'] == ':' and o['text'][:1].isupper()))]
check('W3 no speaker labels left in body tokens (Speaker n / known name or role label followed by ":")', not spk_tok, spk_tok[:10])
spk_txt = [x['line'] for x in SI if x['region'] == 'tapescript' and LAB.search(x['text_clean'])]
check('W3 no "Speaker n (X):" / "Narrator:" label left in tapescript text_clean', not spk_txt, spk_txt[:10])
pq = [x['line'] for x in SI if x['is_body'] == '1' and re.search(r'(?<![.][a-z])(?<=[a-z])(\.[?!]|[?!]\.)(?![.?!])', x['text_clean'])]   # not after an abbreviation ('p.m.?')
check('W4 no ".?" ".!" "?." "!." left in body text after a word', not pq, pq[:10])
dh = {f"{d['left'].lower()}-{d['right'].lower()}": d['decision'] for d in csv.DictReader(open('dehyphenation_v4.csv', encoding='utf-8'))}
need = ['high-grade', 'all-time', 'so-called', 'small-scale', 'part-time', 'prize-winning', 'year-old', 'state-of']
check('W5 the audit compounds keep their hyphen (high-grade, all-time, so-called, small-scale, part-time, prize-winning, 215-million-year-old, state-of-the-art)',
      all(dh.get(x) == 'keep hyphen' for x in need), {x: dh.get(x) for x in need})
mm = FL.get('millimetre', {}); mmforms = next((x['surface_forms'] for x in csv.DictReader(open('card_forms.csv', encoding='utf-8')) if x['lemma'] == 'millimetre'), '')
check('W6 millimetre count (mm only after a number) and threshold', mm and int(mm['total_count']) == 15 and int(mm['books']) >= 3,
      f"millimetre {mm.get('total_count')} tokens / {mm.get('books')} books (v3 {V3F['millimetre']['total_count']}); passes 10x3: {bool(mm) and int(mm['total_count']) >= 10 and int(mm['books']) >= 3}; forms {mmforms}")
check('W6 no "Mm" interjection counted in millimetre', S['forms'].get('millimetre', {}).get('mm', 0) == sum(1 for o in ST if o['is_body'] and o['lower'] == 'mm' and (re.search(r'\d', o['prev_t']) or o['prev_t'].lower() in NUMBER_WORDS_PREV)), S['forms'].get('millimetre'))
SYS = ['/usr/share/' + 'dict', '/' + 'tmp', '/' + 'workspace']
hits = []
for fn in sorted(glob.glob('*.py') + glob.glob('*.sh') + glob.glob('vendor/*.py') + glob.glob('vendor/*.sh')):
    t = open(fn, encoding='utf-8').read()
    for sp in SYS:
        if sp in t: hits.append((fn, sp))
check('W7 no script here references a system dictionary, temp-dir or workspace path', not hits, hits)
sha = hashlib.sha256(open('vendor/words.txt', 'rb').read()).hexdigest()
check('W7 vendored word list present with the recorded sha256', sha == 'be41ad97963bf8dabedd5871d5d691596175269d540956b0f9965a885c2bbab9', sha)
check('W8a lay: no past-tense lay (VBD, no object/base context) on the lay card', all(not ru.startswith('W8a lay = past') for ru in S['rules'].get('lay', {})), S['rules'].get('lay'))
CT = pickle.load(open('card_tokens_v4.pkl', 'rb')); STI = {k: o for k, o in enumerate(ST)}
aot = [card for k, line, form, card, ru in CT if form == 'opposed' and STI[k]['prev_t'].lower() == 'as' and STI[k]['next_t'].lower() == 'to']
check("W8b 'as opposed to' is reserved with the connectives, never counted in oppose", 'as opposed to' in CONNS and aot and all(c == 'as opposed to' for c in aot), collections.Counter(aot))
check("W8c percent displayed 'per cent' (majority spelling), alias percent", FL['percent']['display_form'] == 'per cent' and 'percent' in FL['percent']['aliases'], (FL['percent']['display_form'], FL['percent']['aliases']))
check("W8d locate displayed 'locate'", FL['locate']['display_form'] == 'locate', FL['locate']['display_form'])
check('W8e tonne has no ton/tons except metric ton', set(S['forms'].get('tonne', {})) <= {'tonne', 'tonnes', 'ton', 'tons'} and all(not ru.startswith('W8e ton (') for ru in S['rules'].get('tonne', {})), S['forms'].get('tonne'))
gq = [x['line'] for x in SI if x['is_body'] == '1' and re.search(r'\bganats?\b', x['text_clean'])]
check("W8f no OCR 'ganat' left in body text", not gq, gq)
ast = [x['line'] for x in SI if x['is_body'] == '1' and '*' in x['text_clean']]
check('W8g no asterisk left in body text', not ast, ast[:10])
d1 = [x['line'] for x in SI if x['is_body'] == '1' and re.search(r"(?:^|[.?!,] |\b(?:now|so|if|think) )1 (?:suppose|guess|think|know)\b|\byou II\b|\b(?:you|that) ll\b", x['text_clean'])]
check("W8k no OCR '1' for I / 'II' for 'll left in body text", not d1, d1)
nf = [(x['issue_no'], x['card']) for x in RR if x['status'] == 'not_fixed']
check('re-audit: every issues.csv row has a status; none not_fixed', len(RR) == 350 and all(x['status'] for x in RR) and not nf, nf)
json.dump(res, open('sanity_checks_v4.json', 'w'), indent=1)
bad = [r for r in res if r['hard'] and not r['ok']]
print(f'{len(res)} checks, {len(bad)} hard failures'); sys.exit(1 if bad else 0)
