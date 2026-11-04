#!/usr/bin/env python3
"""samples_30.csv: 30 random cards of the v4 final list (random.Random(20261103).sample over the list in rank order), with their v4 counts,
the v3 numbers for the same lemma, and the card's observed surface forms. For a manual spot check."""
import csv, random
V3 = {r['lemma']: r for r in csv.DictReader(open('../candidate-2026-11-01-v3/final_wordlist.csv', encoding='utf-8'))}
F = list(csv.DictReader(open('final_wordlist.csv', encoding='utf-8')))
D = {r['lemma']: r for r in csv.DictReader(open('diff_vs_v3.csv', encoding='utf-8'))}
FORMS = {r['lemma']: r['surface_forms'] for r in csv.DictReader(open('card_forms.csv', encoding='utf-8'))}
pick = sorted(random.Random(20261103).sample(F, 30), key=lambda r: int(r['rank']))
rows = []
for r in pick:
    o = V3.get(r['lemma'], {})
    rows.append(dict(v4_rank=r['rank'], lemma=r['lemma'], display_form=r['display_form'], v4_total_count=r['total_count'], v4_books=r['books'],
                     v4_listening=r['listening_count'], v4_reading=r['reading_count'], v3_rank=o.get('rank', ''), v3_total_count=o.get('total_count', ''),
                     v3_books=o.get('books', ''), count_change=int(r['total_count']) - int(o['total_count']) if o else '', single_text_flag=r['single_text_flag'],
                     instruction_word=r['instruction_word'], surface_forms=FORMS.get(r['lemma'], ''), diff_reason=D.get(r['lemma'], {}).get('reason', '')))
with open('samples_30.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print('samples_30.csv:', ', '.join(f"{x['lemma']} ({x['v4_total_count']} vs v3 {x['v3_total_count']})" for x in rows))
