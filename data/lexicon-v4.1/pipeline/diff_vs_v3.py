#!/usr/bin/env python3
"""diff_vs_v3.csv: v4 final list vs the v3 final list (../candidate-2026-11-01-v3/final_wordlist.csv, read-only).
Columns: lemma, status (kept/added/removed), v3_rank, v4_rank, rank_change (+ = moved up), v3_count, v4_count, count_change, reason.
The reason is computed token by token: the v3 body tokens of a card (v3_card_tokens.pkl, from the v3 builder's own pass 1) and the v4
body tokens (card_tokens_v4.pkl) are compared as (clawwords.md line, surface form) multisets; every lost/gained token is attributed to
  - the section_index rule that made its line non-body / body (W1a/W1c/W1d/W2/W3; from section_index_fixes_v4.rule),
  - the v4 token rule that moved it to / from another card (W6, W8a-W8i, ...),
  - a text change of its line (W3 label stripped, W4, W8f, W8g) or the line-end de-hyphenation (W5).
Nothing is typed per word. Usage: diff_vs_v3.py V3_DIR"""
import csv, sys, pickle, collections
from section_index_fixes_v4 import rule as si_rule
V3 = sys.argv[1] if len(sys.argv) > 1 else '../candidate-2026-11-01-v3'
A = {r['lemma']: r for r in csv.DictReader(open(f'{V3}/final_wordlist.csv', encoding='utf-8'))}
B = {r['lemma']: r for r in csv.DictReader(open('final_wordlist.csv', encoding='utf-8'))}
S = pickle.load(open('build_state.pkl', 'rb')); R = S['R']; REMOVE = S['REMOVE']; CONN = S['CONN']; FUNC = set(S['func'])
SI3 = list(csv.DictReader(open(f'{V3}/section_index.csv', encoding='utf-8'))); SI4 = list(csv.DictReader(open('section_index.csv', encoding='utf-8')))
T3 = pickle.load(open('v3_card_tokens.pkl', 'rb')); T4 = pickle.load(open('card_tokens_v4.pkl', 'rb'))
DH = {}
for r in csv.DictReader(open('dehyphenation_v4.csv', encoding='utf-8')):
    if r['decision'] != r['v3_decision'] or r['decision'].startswith('dash'):
        for L in (int(r['line']) - 1, int(r['line'])): DH[L] = 'W5 line-end de-hyphenation (' + r['left'] + '-' + r['right'] + ': ' + r['decision'] + ')'

def line_rule(L):
    o, n = SI3[L - 1], SI4[L - 1]
    if o['is_body'] != n['is_body']: return si_rule(o, n, 'is_body').split(':')[0] + ': ' + si_rule(o, n, 'is_body').split(': ', 1)[-1][:70]
    if L in DH: return DH[L]
    if o['text_clean'] != n['text_clean']: return si_rule(o, n, 'text_clean')
    return None

def by_card(T):
    d = collections.defaultdict(collections.Counter); where = collections.defaultdict(collections.Counter); rules = {}
    for k, line, form, card, ru in T:
        if card is None: card = '(dropped)'
        d[card][(line, form)] += 1; where[(line, form)][card] += 1; rules[(line, form, card)] = ru
    return d, where, rules
C3, W3, RU3 = by_card(T3); C4, W4, RU4 = by_card(T4)

def explain(l):
    lost = C3.get(l, collections.Counter()) - C4.get(l, collections.Counter())
    gain = C4.get(l, collections.Counter()) - C3.get(l, collections.Counter())
    why = collections.Counter()
    for (L, f), c in lost.items():
        lr = line_rule(L)
        other = [x for x in W4.get((L, f), {}) if x != l]
        if lr and not lr.startswith('W5') and SI4[L - 1]['is_body'] == '0': why['-' + lr] += c
        elif other:
            ru = RU4.get((L, f, other[0]), '')
            why[f'-moved to {other[0]}' + (f' ({ru})' if ru else '')] += c
        elif lr: why['-' + lr] += c
        else: why['-token no longer produced (tokenisation of a changed neighbour line)'] += c
    for (L, f), c in gain.items():
        lr = line_rule(L)
        other = [x for x in W3.get((L, f), {}) if x != l]
        ru = RU4.get((L, f, l), '')
        if lr and SI3[L - 1]['is_body'] == '0': why['+' + lr] += c
        elif other:
            if other[0] == '(dropped)' and not ru: ru = 'v3 dropped it: ' + (RU3.get((L, f, '(dropped)'), '') or 'filtered token')
            why[f'+moved from {other[0]}' + (f' ({ru})' if ru else '')] += c
        elif lr: why['+' + lr] += c
        else: why['+new token (tokenisation of a changed neighbour line)'] += c
    return '; '.join(f'{k[0]}{v} {k[1:]}' for k, v in why.most_common(4)) + (' ...' if len(why) > 4 else '')

def status_v4(l):
    r = R.get(l)
    if r is None or r['total_count'] == 0: return 'no body tokens in v4'
    if l in REMOVE: return 'removed: ' + REMOVE[l][:110]
    if l in CONN: return 'reserved with the connectives (connectives_reserved.csv)'
    if l in FUNC: return 'function word'
    if r.get('removed_C_headword5.5_keep22'): return f"filter C (zipf_headword {r['zipf_headword']})"
    if not (r['total_count'] >= 10 and r['books'] >= 3): return f"below 10x3: {r['total_count']} body tokens / {r['books']} books"
    return 'not in final list'

rows = []
for l in sorted(set(A) | set(B), key=lambda x: int(A[x]['rank']) if x in A else 10**6 + int(B[x]['rank'])):
    a, b = A.get(l), B.get(l)
    v3c = int(a['total_count']) if a else (C3.get(l) and sum(C3[l].values())) or 0
    v4c = int(b['total_count']) if b else (R.get(l, {}).get('total_count', 0))
    if a and b:
        st = 'kept'; reason = explain(l) if v3c != v4c else 'count unchanged (rank shift from other cards)'
    elif b:
        st = 'added'; top = collections.Counter({k: v for k, v in S['rules'].get(l, {}).items() if k}).most_common(1)
        reason = (top[0][0] + '; ' if top else '') + explain(l)
    else:
        st = 'removed'; reason = status_v4(l) + '; ' + explain(l)
    if l == 'may' and b: reason = 'W9 user decision 1: May kept as the 23rd filter-C exception; ' + reason
    rows.append(dict(lemma=l, status=st, v3_rank=a['rank'] if a else '', v4_rank=b['rank'] if b else '', rank_change=(int(a['rank']) - int(b['rank'])) if a and b else '',
                     v3_count=v3c, v4_count=v4c, count_change=v4c - v3c, reason=reason))
with open('diff_vs_v3.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
c = collections.Counter(r['status'] for r in rows); print(dict(c), 'count changed (kept):', sum(1 for r in rows if r['status'] == 'kept' and r['count_change']))
for r in rows:
    if r['status'] != 'kept' or abs(r['count_change']) >= 10: print(' ', r['lemma'], r['status'], r['v3_count'], '->', r['v4_count'], '|', r['reason'][:200])
