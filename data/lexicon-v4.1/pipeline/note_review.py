#!/usr/bin/env python3
"""note_review.csv: every 10-31 final card with a non-empty `note` (98 cards) reviewed by category and resolved (keep / merge / remove / flag)
from the v4 build state. The note text itself is internal provenance: it stays in final_wordlist.csv (schema unchanged) and is NOT exported
to the app (app_export_wordlist.csv has no note column; asserted in build_v3.py and sanity_checks_v3.py)."""
import csv, pickle, collections
B = '../v3-inputs/candidate-2026-10-31-final/'
O = [r for r in csv.DictReader(open(B + 'final_wordlist.csv', encoding='utf-8')) if r['note']]
N = {r['lemma']: r for r in csv.DictReader(open('final_wordlist.csv', encoding='utf-8'))}
D = {r['lemma']: r for r in csv.DictReader(open('diff_vs_1031.csv', encoding='utf-8'))}
S = pickle.load(open('build_state.pkl', 'rb'))
OTHER = {'programme': ('UK/US variant', 'keep: program merged as alias'), 'according to': ('phrase card', 'keep: phrase card (all tokens "according to")'),
         'based': ('final rule 4 own card', 'keep (final rule 4; filter C exception)'), 'advanced': ('final rule 4 own card', 'keep (final rule 4)'),
         'concerned': ('final rule 4 own card', 'keep (final rule 4)'), 'fishing': ('final rule 4 own card', 'keep (final rule 4)'),
         'hope': ('spaCy lemma fix', 'keep: lemma fix now applied in staging (V1, LEMMA_FIX)'), 'sense': ('spaCy lemma fix', 'keep: lemma fix now in staging (V1)'),
         'cope': ('spaCy lemma fix', 'keep: lemma fix now in staging (V1)'), 'practice': ('BrE noun/verb pair', 'keep: practice (n) and practise (v) are different BrE words'),
         'practise': ('BrE noun/verb pair', 'keep: practice (n) and practise (v) are different BrE words'), 'findings': ('lexical plural', 'keep: singular finding merged'),
         'due to': ('phrase card', 'keep (final rule 2)'), 'means': ('lexical plural', 'keep: noun uses only'), 'remains': ('lexical plural', 'keep: noun uses only'),
         'meter': ('duplicate of metre', 'merge: unit uses -> metre (V8); device sense alone is below threshold'),
         'oppose': ('display form', 'remove: as opposed to moved to the connectives (W8b); below 10x3'), 'self': ('hyphen fragment', 'keep + flag: standalone noun only (compounds are single tokens, H1); single_text_flag'),
         'storey': ('BrE spelling', 'keep: US story not aliased (different word)'), 'rights': ('split card', 'keep: split from right'),
         'arts': ('split card', 'keep: split from art'), 'licence': ('UK/US variant', 'keep: license merged as alias')}
rows = []
for o in O:
    l = o['lemma']; n = N.get(l); d = D.get(l, {})
    if 'restored from proper-noun' in o['note'] and l not in OTHER:
        typ = o['note'].split('(')[1].split(',')[0] if '(' in o['note'] else 'restored'
        cat = f'restored proper noun ({typ})'
        if n: dec = 'keep + flag' if (n['month_flag'] == 'true' or n['weekday_flag'] == 'true') else 'keep'
        else: dec = 'merge' if 'surface form now counted' in d.get('reason', '') or l in ('romans', 'europeans') else 'remove'
        why = {'keep + flag': 'calendar word: closed set (V13), month_flag/weekday_flag set', 'keep': 'restored common place/people word, passes 10x3 on body-only counts'}.get(dec, d.get('reason', ''))
        if l in ('romans', 'europeans'): why = 'pure plural merged into the singular card (V12)'
    else:
        cat, dec = OTHER.get(l, ('other', 'keep'))
        why = dec.split(': ', 1)[1] if ': ' in dec else dec
        dec = dec.split(':')[0].split(' (')[0]
        if not n and dec.startswith('keep'): dec, why = 'remove', d.get('reason', '')
    rows.append(dict(rank_1031=o['rank'], lemma=l, note_1031=o['note'], category=cat, v4_rank=n['rank'] if n else '', v4_total_count=n['total_count'] if n else d.get('total_count_v4', ''),
                     decision=dec, reason=why, v4_note=n['note'] if n else ''))
with open('note_review.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print(len(rows), dict(collections.Counter((r['category'].split(' (')[0], r['decision']) for r in rows)))
