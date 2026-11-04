#!/usr/bin/env python3
"""Scan for spaCy lemma misassignments of the hop/hoping kind (surface form assigned to the wrong base word).
For every (surface form, spaCy lemma, POS) in body text with lemma != form, build the regular de-inflection candidates of the form
(-s/-es/-ies, -ed/-d/-ied, -ing with/without e, doubled consonant, -er/-est) and flag the pair when
  (a) the spaCy lemma is not a regular candidate and not a known irregular form (e.g. 'taxes' -> 'taxis', 'senses' -> 'sens'), or
  (b) another candidate is a much more frequent word (zipf >= lemma zipf + 1.0), e.g. 'hoping' -> 'hop' while 'hope' exists.
Writes lemma_scan.csv (all flags, with body token counts and a context) - decisions are taken in overrides_v3.LEMMA_FIX, not here.
Usage: scan_lemma_errors.py [tokens.pkl] [sents.pkl]"""
import pickle, sys, csv, collections, re
from wordfreq import zipf_frequency
T = pickle.load(open(sys.argv[1] if len(sys.argv) > 1 else 'tokens_v3.pkl', 'rb'))
S = pickle.load(open(sys.argv[2] if len(sys.argv) > 2 else 'sents_v3.pkl', 'rb'))
IRREG = set('''be have do go see take make come give know get find think tell become leave feel bring begin keep hold write stand hear let
mean set meet run pay sit speak lie lead read grow lose fall send build understand draw break spend cut rise drive buy wear choose seek throw
catch deal win forget fly sell fight teach eat sing bear shake hide ride arise bite blow dig feed freeze hang lay light shoot shut sink slide
spin spread steal stick strike swear sweep swim swing tear wake weave weep wind child man woman person foot tooth mouse goose ox datum
criterion phenomenon medium analysis basis crisis thesis hypothesis axis nucleus stimulus fungus cactus alumnus bacterium curriculum
good well bad far old little much many'''.split())
def cands(w):
    c = set()
    if w.endswith('ies') and len(w) > 4: c.add(w[:-3] + 'y')
    if w.endswith('es') and len(w) > 3: c.add(w[:-2])
    if w.endswith('s') and len(w) > 2: c.add(w[:-1])
    if w.endswith('ied') and len(w) > 4: c.add(w[:-3] + 'y')
    if w.endswith('ed') and len(w) > 3:
        c |= {w[:-2], w[:-1]}
        if len(w) > 4 and w[-3] == w[-4]: c.add(w[:-3])
    if w.endswith('ing') and len(w) > 4:
        c |= {w[:-3], w[:-3] + 'e'}
        if len(w) > 5 and w[-4] == w[-5]: c.add(w[:-4])
        if w.endswith('ying'): c.add(w[:-4] + 'ie')
    for suf in ('er', 'est'):
        if w.endswith(suf) and len(w) > len(suf) + 2:
            b = w[:-len(suf)]; c |= {b, b + 'e'}
            if b.endswith('i'): c.add(b[:-1] + 'y')
            if len(b) > 2 and b[-1] == b[-2]: c.add(b[:-1])
    return {x for x in c if len(x) >= 2}
cnt = collections.Counter(); ex = {}
for i, t in enumerate(T):
    if not t[22]: continue
    lower, lemma, pos = t[4], t[5].lower(), t[6]
    if lemma == lower or not lower.isalpha() or pos in ('PROPN', 'NUM', 'PUNCT', 'X', 'SYM'): continue
    cnt[(lower, lemma, pos)] += 1; ex.setdefault((lower, lemma, pos), t[19])
rows = []
for (lower, lemma, pos), n in cnt.items():
    c = cands(lower); zl = zipf_frequency(lemma, 'en')
    why = ''
    if lemma not in c and lemma not in IRREG and not (lower in ('am', 'is', 'are', 'was', 'were', 'been', 'being', "'s") and lemma == 'be'):
        why = 'lemma is not a regular de-inflection of the form'
    alt = max((x for x in c if x != lemma), key=lambda x: zipf_frequency(x, 'en'), default='')
    za = zipf_frequency(alt, 'en') if alt else 0
    if not why and alt and za >= zl + 1.0 and za >= 3.0: why = f'more frequent candidate base "{alt}" (zipf {za:.2f} vs {zl:.2f})'
    if why: rows.append(dict(form=lower, spacy_lemma=lemma, pos=pos, body_tokens=n, lemma_zipf=round(zl, 2), best_alt=alt, alt_zipf=round(za, 2),
                             reason=why, context=S[ex[(lower, lemma, pos)]].replace('\n', ' ')[:140]))
rows.sort(key=lambda r: -r['body_tokens'])
with open('lemma_scan.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print('flagged pairs', len(rows), 'tokens', sum(r['body_tokens'] for r in rows))
for r in rows[:80]: print(r['form'], r['spacy_lemma'], r['pos'], r['body_tokens'], r['best_alt'], '|', r['reason'][:60])
