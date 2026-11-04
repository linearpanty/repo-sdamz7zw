#!/usr/bin/env python3
"""diff_vs_1031.csv: v4 final list vs the 10-31 final list (BASELINE, read-only). (v4: copy of the v3 script; columns *_v3 renamed *_v4.)
Columns: lemma, status (added/removed/kept), rank_1031, rank_v4, rank_change (+ = moved up), total_count_1031, total_count_v4, reason.
Reasons are derived from the v4 build state (build_state.pkl) and the override tables - never typed per word."""
import csv, pickle, collections, sys
sys.path.insert(0, '.')
from overrides_v4 import *
B = '../v3-inputs/candidate-2026-10-31-final/'
O = {r['lemma']: r for r in csv.DictReader(open(B + 'final_wordlist.csv', encoding='utf-8'))}
S = pickle.load(open('build_state.pkl', 'rb')); R = S['R']; REMOVE = S['REMOVE']; CONN = S['CONN']; FUNC = set(S['func'])
N = {r['lemma']: r for r in csv.DictReader(open('final_wordlist.csv', encoding='utf-8'))}
form2card = collections.defaultdict(collections.Counter)
for card, fs in S['forms'].items():
    for f, c in fs.items(): form2card[f][card] += c
compound_parts = collections.Counter()
for card, fs in S['forms'].items():
    if '-' in card:
        for p in card.split('-'): compound_parts[p] += sum(fs.values())
def top_rule(l):
    rs = collections.Counter({k: v for k, v in S['rules'].get(l, {}).items() if k})
    return rs.most_common(1)[0][0] if rs else ''
def why_removed(l):
    o = O[l]; r = R.get(l)
    if l in REMOVE: return REMOVE[l]
    if l in CONN: return f'moved to connectives_reserved.csv ({CONN[l]})'
    if l in FUNC: return 'function word (' + (FUNC_EXTRA.get(l) or (r or {}).get('_fw_reason', '') or 'stoplist/closed class') + ')'
    other = {c: n for c, n in form2card[l].items() if c != l}
    if r is None or r['total_count'] == 0:
        if other: return 'no own body tokens left: surface form now counted in card(s) ' + ', '.join(f'{c} ({n})' for c, n in sorted(other.items(), key=lambda x: -x[1])[:3])
        return 'no body tokens (all its tokens were question/prompt/rubric text)'
    if r.get('removed_C_headword5.5_keep22'): return f"filter C (zipf_headword {r['zipf_headword']})"
    bits = [f"below threshold on body-only counts: {r['total_count']} body tokens in {r['books']} books (10-31: {o['total_count']} in {o['books']})"]
    if r['nonbody_exam_count']: bits.append(f"{r['nonbody_exam_count']} question/instruction/prompt tokens no longer counted")
    if compound_parts[l]: bits.append(f'{compound_parts[l]} tokens are inside hyphen compounds (H1)')
    if other: bits.append('forms now in ' + ', '.join(f'{c} ({n})' for c, n in sorted(other.items(), key=lambda x: -x[1])[:2]))
    return '; '.join(bits)
def why_added(l):
    r = R[l]; tr = top_rule(l)
    if '-' in l: return 'H1 hyphen compound card (parts no longer counted separately)'
    if l in PHRASE_REASON.values() or l in PHRASES.values(): return PHRASE_REASON.get(l, 'V3 phrase card')
    if l in FILTER_C_EXTRA_EXCEPTIONS: return FILTER_C_EXTRA_EXCEPTIONS[l] + '; ' + (tr or '')
    for k in ('V9', 'V10', 'V11', 'V12', 'V13', 'W8'):
        if tr.startswith(k): return tr
    if l in ('january february march april may june july august september october november december'.split()): return 'V13 month: closed set kept regardless of threshold'
    if r.get('month_flag') or r.get('weekday_flag'): return 'V13 closed set (calendar word)'
    return f"passes 10x3 on the v4 recount ({r['total_count']} body tokens, {r['books']} books)" + (f'; main rule: {tr}' if tr else '')
rows = []
for l, o in O.items():
    if l in N:
        n = N[l]; r = R[l]; d = int(o['rank']) - int(n['rank'])
        bits = []
        nb = r['nonbody_exam_count']
        if int(o['total_count']) != int(n['total_count']):
            bits.append(f"count {o['total_count']}->{n['total_count']}")
            if nb: bits.append(f'{nb} question/instruction/prompt tokens no longer counted')
        tr = top_rule(l)
        if tr: bits.append('rule: ' + tr)
        if compound_parts[l]: bits.append(f'{compound_parts[l]} tokens inside hyphen compounds (H1)')
        if not bits: bits.append('rank shift from other cards leaving/entering the list')
        rows.append(dict(lemma=l, status='kept', rank_1031=o['rank'], rank_v4=n['rank'], rank_change=d, total_count_1031=o['total_count'], total_count_v4=n['total_count'], reason='; '.join(bits)))
    else:
        r = R.get(l)
        rows.append(dict(lemma=l, status='removed', rank_1031=o['rank'], rank_v4='', rank_change='', total_count_1031=o['total_count'],
                         total_count_v4=r['total_count'] if r else 0, reason=why_removed(l)))
for l, n in N.items():
    if l not in O: rows.append(dict(lemma=l, status='added', rank_1031='', rank_v4=n['rank'], rank_change='', total_count_1031='', total_count_v4=n['total_count'], reason=why_added(l)))
order = {'removed': 0, 'added': 1, 'kept': 2}
rows.sort(key=lambda r: (order[r['status']], int(r['rank_1031'] or r['rank_v4'])))
with open('diff_vs_1031.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
c = collections.Counter(r['status'] for r in rows); print(dict(c))
