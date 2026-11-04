#!/usr/bin/env python3
"""v3 Stage 3: v2 token filters (stage_tokens_v2.py) applied to tokens_v3.pkl.
Changes vs v2: (1) every token carries line / region / is_body from section_index; (2) the case statistics used by the
proper-noun test are computed over all exam text the candidate reads (body + questions + prompts), not model answers;
(3) 'arms' removed from LEX_PLURAL (audit: arms -> arm is a pure inflection).

2026-11-03 revision (changes vs orig_v3_scripts/03_stage_tokens_v3.py):
  S1. Reads the 26-field token tuple of the revised 02 (adds tag, n_parts).
  S2. spaCy lemma misassignments are corrected from overrides_v3.LEMMA_FIX (reviewed output of scan_lemma_errors.py:
      hoping->hope not hop, taxes->tax not taxis, specimen not speciman ...). The bee/being mix-up of the 10-31 examples was NOT a lemma
      error (spaCy lemmatises 'being' as be/being, never bee); see REPORT.md.
  S3. Hyphen compounds (one token since 02/H1): lemma = compound with the last part lemmatised only when the compound is a noun
      ('hunter-gatherers' -> 'hunter-gatherer'); adjectival/verbal compounds keep their surface form ('well-known', not 'well-know').
      A compound whose solid spelling is a common word (zipf >= 3.0) is mapped to it ('co-operation' -> 'cooperation', 'e-mail' -> 'email',
      'on-line' -> 'online'); a compound listed in overrides_v3.HYPHEN_TO_PHRASE is mapped to the open phrase ('air-conditioning').
  S4. Each staged token keeps its fine-grained tag and the index of the next token (for 'of course' / 'May' context rules in the build).

2026-11-03 v4 (candidate-2026-11-03-v4): reads tokens_v4.pkl, writes staged_v4.pkl, overrides from overrides_v4.py. No rule change in this
stage; the v4 token stream differs only through the corpus-layer fixes of 01 (W1-W4, W8f/g) and the de-hyphenation of 02 (W5)."""
import pickle, re, collections, sys
from wordfreq import zipf_frequency
sys.path.insert(0, '.')
from overrides_v4 import LEMMA_FIX, HYPHEN_TO_PHRASE
toks = pickle.load(open('tokens_v4.pkl', 'rb'))
CASE_SUBS = {'passage', 'tapescript', 'question', 'prompt'}
PROPER_ENTS = {'PERSON','GPE','LOC','ORG'}
LEX_PLURAL = set('''sales savings findings surroundings goods means belongings earnings outskirts premises remains customs
manners clothes glasses scissors trousers jeans headquarters series species news mathematics physics economics politics ethics
electronics athletics genetics linguistics logistics graphics statistics acoustics aerobics thanks congratulations odds proceeds'''.split())
BE_GET = {'be','get','become','seem','feel','grow'}
CONTR = {"n't":'not',"'re":'be',"'m":'be',"'ll":'will',"'ve":'have',"'d":'would',"ca":'can',"wo":'will',"'s":None}
low_cnt = collections.Counter(); cap_cnt = collections.Counter()
for t in toks:
    book, sec, sub, text, lower, lemma, pos, ent, ss = t[:9]
    if sub not in CASE_SUBS or not text[:1].isalpha() or ss: continue
    if text[:1].isupper(): cap_cnt[lower] += 1
    else: low_cnt[lower] += 1
def lower_ratio(w):
    n = low_cnt[w] + cap_cnt[w]; return low_cnt[w]/n if n else 0.0
zc = {}
def z(w):
    if w not in zc: zc[w] = zipf_frequency(w, 'en')
    return zc[w]
FIXLOG = collections.Counter()
def norm_lemma(text, lower, lemma, pos, nxt, p1, p2):
    lem = lemma.lower() if lemma != 'I' else 'i'
    if lower in CONTR: return CONTR[lower]
    if (lower, lem) in LEMMA_FIX: FIXLOG[(lower, lem, LEMMA_FIX[(lower, lem)])] += 1; lem = LEMMA_FIX[(lower, lem)]   # S2
    if '-' in lower:                                                                                       # S3
        lem = lem if pos in ('NOUN', 'PROPN') else lower
        if lem in HYPHEN_TO_PHRASE: return HYPHEN_TO_PHRASE[lem]
        solid = lem.replace('-', '')
        if z(solid) >= 3.0: return solid
        return lem
    if lower == 'used' and nxt == 'to' and p1 not in BE_GET and p2 not in BE_GET and pos in ('VERB','AUX','ADJ'): return 'used to'
    if lower in LEX_PLURAL and pos in ('NOUN','PROPN','VERB','ADJ'): return lower
    if lower == 'media': return 'media'
    if lem == 'datum': return 'data'
    if pos == 'ADJ' and (lower.endswith('ed') or lower.endswith('ing')) and len(lower) > 4: return lower
    if pos == 'NOUN' and lower.endswith('ing') and len(lower) > 5: return lower
    if pos == 'NOUN' and lower.endswith('ings') and len(lower) > 6: return lower[:-1]
    return lem
out = []
for i, t in enumerate(toks):
    (book, sec, sub, text, lower, lemma, pos, ent, ss, nxt, p1, p2, unit, page, prev_t, prev_ws, next_t, ws, next2, sid, line, region, is_body,
     prev2_t, tag, nparts) = t
    if any(c.isdigit() for c in text) or pos == 'NUM' and not re.fullmatch(r"[A-Za-z\-]+", text): continue
    lem = norm_lemma(text, lower, lemma, pos, nxt, p1, p2)
    if lem is None: continue
    if not re.fullmatch(r"[a-z][a-z'\-]*( [a-z]+)?", lem): continue
    if len(lem) == 1 and lem not in ('a','i'): continue
    propn = bool((pos == 'PROPN' or ent in PROPER_ENTS) and text[:1].isupper() and lower_ratio(lower) < 0.5)
    if z(lower) == 0 and z(lem) == 0 and lem != 'used to': continue
    out.append(dict(i=i, book=book, sec=sec, sub=sub, unit=unit, page=page, text=text, lower=lower, lem=lem, pos=pos, ent=ent, ss=ss,
                    prev_t=prev_t, prev_ws=prev_ws, next_t=next_t, ws=ws, next2=next2, prev2_t=prev2_t, sid=sid, propn=propn,
                    line=line, region=region, is_body=is_body, lowcnt=low_cnt[lower], tag=tag, nparts=nparts,
                    lower_ratio=round(lower_ratio(lower), 3)))
pickle.dump(out, open('staged_v4.pkl', 'wb'))
c = collections.Counter((o['sub'], o['propn']) for o in out); print(len(out), c)
print('lemma fixes applied (all regions):', sum(FIXLOG.values()), sorted(FIXLOG.items(), key=lambda x: -x[1])[:40])
print('hyphen compound tokens staged:', sum(1 for o in out if o['nparts'] > 1), ' body:', sum(1 for o in out if o['nparts'] > 1 and o['is_body']))
