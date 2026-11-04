#!/usr/bin/env python3
"""diff_vs_v4.csv: v4.1 final list vs the read-only v4 list (../candidate-2026-11-03-v4/final_wordlist.csv + card_forms.csv).
One row per lemma whose final_wordlist row or card_forms entry differs. change_class: removed / added / content (any column other than
rank / rank_before_basic_filter, or card_forms) / rank_only (the row moved only because cards above it were added, removed or recounted).
Also writes diff_vs_v4.json (counts) for the report."""
import csv, json, sys
V4 = sys.argv[1] if len(sys.argv) > 1 else '../candidate-2026-11-03-v4'
def load(d, f): return {r['lemma']: r for r in csv.DictReader(open(f'{d}/{f}', encoding='utf-8'))}
O, N = load(V4, 'final_wordlist.csv'), load('.', 'final_wordlist.csv')
OF, NF = load(V4, 'card_forms.csv'), load('.', 'card_forms.csv')
RANK_COLS = {'rank', 'rank_before_basic_filter'}
cols = list(next(iter(N.values())).keys())
out = []
for l in sorted(set(O) | set(N), key=lambda l: int((N.get(l) or O[l])['rank'])):
    o, n = O.get(l), N.get(l)
    if o is None: cls, ch = 'added', ['(new card)']
    elif n is None: cls, ch = 'removed', ['(card dropped)']
    else:
        ch = [f'{c}: {o[c]} -> {n[c]}' for c in cols if o[c] != n[c]]
        of_, nf_ = OF.get(l, {}).get('surface_forms', ''), NF.get(l, {}).get('surface_forms', '')
        if of_ != nf_: ch.append(f'card_forms: {of_} -> {nf_}')
        if not ch: continue
        cls = 'content' if any(not x.split(':')[0] in RANK_COLS for x in ch) else 'rank_only'
    out.append(dict(lemma=l, change_class=cls, rank_v4=o['rank'] if o else '', rank_v41=n['rank'] if n else '',
                    total_count_v4=o['total_count'] if o else '', total_count_v41=n['total_count'] if n else '',
                    books_v4=o['books'] if o else '', books_v41=n['books'] if n else '', changes=' ; '.join(ch)))
with open('diff_vs_v4.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys()) if out else ['lemma']); w.writeheader(); w.writerows(out)
cnt = {k: sum(r['change_class'] == k for r in out) for k in ('removed', 'added', 'content', 'rank_only')}
json.dump({'v4_cards': len(O), 'v41_cards': len(N), 'changed_rows': len(out), **cnt,
           'non_rank_rows': [r for r in out if r['change_class'] != 'rank_only']}, open('diff_vs_v4.json', 'w'), indent=1, ensure_ascii=False)
print('diff_vs_v4.csv', len(out), 'rows', cnt)
