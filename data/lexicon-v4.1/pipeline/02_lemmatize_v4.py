#!/usr/bin/env python3
"""v3 Stage 2: same spaCy model/version as v2 (spacy 3.8.18, en_core_web_md 3.8.0) and the same block-joining rules,
but blocks are now keyed by region too (body text is never joined with question text) and every token keeps the
clawwords.md source line number it came from (char offset -> line map).

2026-11-03 revision (changes vs orig_v3_scripts/02_lemmatize_v3.py):
  H1. Hyphen rule. A hyphenated compound written without spaces (letters on both sides: hunter-gatherer, bell-miner, glow-worm,
      self-esteem, well-known, long-term) is ONE token; its parts are never counted as separate words. lemma = first parts + spaCy lemma
      of the last part ('hunter-gatherers' -> 'hunter-gatherer'); POS/entity = those of the last part. Exception: when a non-final part
      is a number (digits or a number word: '19th-century', 'five-storey', 'two-year-old') the compound is NOT merged - the number part is
      dropped later and the content part counts as usual. (Stage 3 maps compounds whose solid spelling is a common word to that word:
      'co-operate' -> 'cooperate', 'e-mail' -> 'email'.)
  H2. Line-end hyphenation: 'xxx-' + 'yyy' on the next line is still joined without the hyphen, unless the joined string is not a word
      while both halves are ('English-' + 'speaking', 'compare-' + 'son'); then the hyphen is kept, so H1 treats it as a compound.
  H3. Two extra fields at the end of each token tuple: fine-grained tag (tag_) and the number of parts merged by H1.

2026-11-03 v4 revision (candidate-2026-11-03-v4; reads lines_v4.jsonl, writes tokens_v4.pkl / sents_v4.pkl / blocks_v4.jsonl / dehyphenation_v4.csv):
  W5  Line-end hyphenation decided with a dictionary + corpus evidence instead of 'wordfreq zipf == 0' (which let highgrade, alltime,
      socalled, smallscale, parttime, prizewinning, yearold, stateof through, because wordfreq knows them as rare web tokens).
      For 'xxx-' at a line end + 'yyy...' on the next line (same block):
        (a) the hyphenated compound 'xxx-yyy' is printed elsewhere in clawwords.md (not at a line break) more often than the solid
            'xxxyyy'  -> keep the hyphen (so-called, part-time, state-of-the-art, year-old);
        (b) else the joined 'xxxyyy' is a dictionary word (vendored vendor/words.txt incl. regular inflections, or wordfreq zipf >= 3.0)
            or is printed solid >= 2 times elsewhere -> join (infor- mation, compari- son);
        (c) else both halves are words (wordlist_v4.is_part_word: also British spellings / zipf >= 2.0) -> keep the hyphen (high-grade,
            all-time, small-scale, prize-winning, six-millimetre);
        (d) else join (a word broken inside: 'photosyn- thetic');
        (a2) the break is inside a longer hyphen compound ('nose-' + 'to-tail', 'follow-the-' + 'leader') -> keep the hyphen;
        (e) checked before (b): a spaced dash at the line end ('something -' + 'the') or a function word on one side of an unattested
            compound ('and-' + 'repair') is a dash, not a hyphen: the dash is kept and the words are separated by a space (v3 deleted
            the dash and glued the words: 'andrepair').
      Every decision is listed in dehyphenation_v4.csv. The dictionary is wordlist_v4.py (vendored copy; no system path).
  blocks_v4.jsonl: the exact spaCy input blocks (key, text, per line [line, start, length, sep]) so STEP 2 can map sentences back to
      clawwords.md lines without re-implementing the joining rules.
Token tuple (index): 0 book 1 sec 2 sub 3 text 4 lower 5 lemma 6 pos 7 ent 8 sent_start 9 next_lower 10 prev_lemma 11 prev2_lemma 12 unit
  13 page 14 prev_text 15 prev_ws 16 next_text 17 ws 18 next2_text 19 sent_id 20 line 21 region 22 is_body 23 prev2_text 24 tag 25 n_parts
"""
import json, re, pickle, time, bisect, collections, spacy, csv, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wordfreq import zipf_frequency
from wordlist_v4 import is_word, is_part_word
nlp = spacy.load('en_core_web_md'); nlp.max_length = 3_000_000
recs = [json.loads(l) for l in open('lines_v4.jsonl')]
MD = sys.argv[1] if len(sys.argv) > 1 else '../v3-inputs/v2src/clawwords.md'
RAWTXT = open(MD, encoding='utf-8').read()
# W5 corpus evidence: hyphenated compounds and solid words as printed inside lines (a line-end hyphen is not evidence)
HYPH_SEEN = collections.Counter()
for m in re.finditer(r"(?<![A-Za-z])[A-Za-z]+(?:-[A-Za-z]+)+(?![A-Za-z]|-\s*$)", RAWTXT, re.M):
    ps = m.group(0).lower().split('-')
    for i in range(len(ps)):
        for j in range(i + 2, len(ps) + 1): HYPH_SEEN['-'.join(ps[i:j])] += 1          # 'two-year-old' is evidence for 'year-old' too
SOLID_SEEN = collections.Counter(w.lower() for w in re.findall(r"(?<![A-Za-z-])[A-Za-z]+(?![A-Za-z-])", RAWTXT))
DEHYPH = []
NUMWORD = set('''one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen
twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion first second third fourth fifth sixth seventh eighth
ninth tenth eleventh twelfth twentieth half single double triple multi'''.split())
LOG = collections.Counter(); EX = collections.defaultdict(list)
blocks = []   # [key, text, [(char_start, line), ...], [[line, start, length, sep], ...]]
def v3_decision(w1, w2):
    if not (w1 and w2): return 'join'
    keep = zipf_frequency((w1.group(1) + w2.group(0)).lower(), 'en') == 0 and zipf_frequency(w1.group(1).lower(), 'en') > 0 and zipf_frequency(w2.group(0), 'en') > 0
    return 'keep hyphen' if keep else 'join'
def dehyphen_keep(a, b, prev, t):
    """W5 decision for 'a-' + 'b'. Returns (keep_hyphen, rule)."""
    if not a: return 'dash', 'e: spaced dash at the line end'
    if not b: return 'join', 'd: not a word-word break'
    m1 = re.search(r'([A-Za-z]+(?:-[A-Za-z]+)*)-$', prev); m2 = re.match(r'[a-z]+(?:-[A-Za-z]+)*', t)
    full = (m1.group(1) + '-' + m2.group(0)).lower() if m1 and m2 else (a + '-' + b).lower()
    hyph = max(HYPH_SEEN[full], HYPH_SEEN[(a + '-' + b).lower()]); solid = SOLID_SEEN[(a + b).lower()]
    if '-' in full.replace(a.lower() + '-' + b.lower(), '', 1) and not is_word(a + b): return 'keep', 'a: part of a multi-part hyphen compound (nose-to-tail, follow-the-leader)'
    if hyph > solid: return 'keep', f'a: hyphenated form printed elsewhere ({hyph}x vs solid {solid}x)'
    if (a.lower() in FUNC or b.lower() in FUNC) and not (is_word(a + b) or solid >= 2): return 'dash', 'e: function word on one side of an unattested compound (a dash)'
    if is_word(a + b) or solid >= 2: return 'join', f'b: joined form is a word (dictionary, or printed solid {solid}x)'
    if is_part_word(a) and is_part_word(b): return 'keep', 'c: joined form not a word, both halves are words'
    return 'join', 'd: joined form not a word, halves not both words (word broken inside)'
FUNC = set('''a an the and or but nor so yet to of in on at by for with from as than that this these those it its is are was were be been
he she we you they i his her their our your my me him them us who which what when where why how if then not no just very also only'''.split())
for r in recs:
    t = r['text']
    aw = re.findall(r'[A-Za-z]{2,}', t)
    if len(aw) >= 2 and all(w.isupper() for w in aw): t = t.lower()
    key = (r['book'], r['page'], r['sec'], r['sub'], r['unit'], r['region'], r['is_body'])
    if blocks and blocks[-1][0] == key:
        prev = blocks[-1][1]
        if prev.endswith('-') and t[:1].islower():
            w1 = re.search(r'([A-Za-z]+)-$', prev); w2 = re.match(r'[a-z]+', t)
            mode, why = dehyphen_keep(w1.group(1) if w1 else '', w2.group(0) if w2 else '', prev, t)
            keep = mode == 'keep'
            if mode == 'dash':
                LOG['line_end_dash_kept'] += 1; LOG['W5_dash:' + why[:2]] += 1; sep = ' '; septype = 'dash_space'
            elif keep:                                                  # H2/W5: real compound broken at the line end
                LOG['line_end_hyphen_kept'] += 1; LOG['W5_kept:' + why[:2]] += 1
                if len(EX['line_end_hyphen_kept']) < 30: EX['line_end_hyphen_kept'].append(f"L{r['line']}: {w1.group(1) if w1 else ''}-{w2.group(0) if w2 else ''} ({why})")
                sep = ''; septype = 'hyph_kept'
            else:
                LOG['line_end_hyphen_joined'] += 1; LOG['W5_joined:' + why[:2]] += 1; blocks[-1][1] = prev[:-1]; sep = ''; septype = 'hyph_joined'
                blocks[-1][3][-1][2] -= 1
            DEHYPH.append(dict(line=r['line'], book=r['book'], region=r['region'], is_body=r['is_body'], left=w1.group(1) if w1 else '', right=w2.group(0) if w2 else '',
                               decision={'keep': 'keep hyphen', 'join': 'join', 'dash': 'dash + space'}[mode], rule=why, v3_decision=v3_decision(w1, w2)))
        else:
            sep = '\n' if re.search(r'[.!?:;"\')]$', prev) else ' '; septype = 'newline' if sep == '\n' else 'space'
        blocks[-1][2].append((len(blocks[-1][1]) + len(sep), r['line'])); blocks[-1][3].append([r['line'], len(blocks[-1][1]) + len(sep), len(t), septype]); blocks[-1][1] += sep + t
    else: blocks.append([key, t, [(0, r['line'])], [[r['line'], 0, len(t), 'start']]])
print('blocks', len(blocks), flush=True); t0 = time.time()

def is_num(tk): return tk.like_num or any(c.isdigit() for c in tk.text) or tk.lower_ in NUMWORD
def units_of(doc):
    """H1: merge word-hyphen-word chains written without spaces into one unit. Returns a list of dicts."""
    out = []; i = 0; n = len(doc)
    while i < n:
        tk = doc[i]; j = i
        while (j + 2 < n and doc[j].whitespace_ == '' and doc[j+1].text == '-' and doc[j+1].whitespace_ == ''
               and re.match(r'[A-Za-z]', doc[j].text) and re.match(r'[A-Za-z]', doc[j+2].text)):
            j += 2
        if j > i:
            parts = [doc[k] for k in range(i, j + 1, 2)]
            if any(is_num(p) for p in parts[:-1]):              # numeric modifier: keep parts separate
                LOG['hyphen_numeric_not_merged'] += 1
                for k in range(i, j + 1): out.append(dict(tk=doc[k], text=doc[k].text, lower=doc[k].lower_, lemma=doc[k].lemma_, pos=doc[k].pos_,
                                                          ent=doc[k].ent_type_, ss=doc[k].is_sent_start, idx=doc[k].idx, ws=doc[k].whitespace_, tag=doc[k].tag_, np=1))
                i = j + 1; continue
            last = parts[-1]; text = doc[i:j+1].text
            lem = '-'.join([p.lower_ for p in parts[:-1]] + [last.lemma_.lower()])
            LOG['hyphen_compounds_merged'] += 1
            out.append(dict(tk=tk, text=text, lower=text.lower(), lemma=lem, pos=last.pos_, ent=last.ent_type_ or tk.ent_type_, ss=tk.is_sent_start,
                            idx=tk.idx, ws=doc[j].whitespace_, tag=last.tag_, np=len(parts)))
            i = j + 1; continue
        out.append(dict(tk=tk, text=tk.text, lower=tk.lower_, lemma=tk.lemma_, pos=tk.pos_, ent=tk.ent_type_, ss=tk.is_sent_start, idx=tk.idx,
                        ws=tk.whitespace_, tag=tk.tag_, np=1))
        i += 1
    return out

toks = []; sents = []
for (key, _, lmap, _l), doc in zip(blocks, nlp.pipe((b[1] for b in blocks), batch_size=64, n_process=1)):   # n_process=1: macOS spawn + no __main__ guard deadlocks with n_process=6; output identical
    book, page, sec, sub, unit, region, is_body = key
    starts = [a for a, _ in lmap]
    sid0 = len(sents); sid_of = {}
    for k, s in enumerate(doc.sents): sents.append(s.text); sid_of[s.start] = sid0 + k
    U = units_of(doc)
    cur = sid0
    for i, u in enumerate(U):
        tk = u['tk']
        if u['ss'] and tk.i in sid_of: cur = sid_of[tk.i]
        if tk.is_space or (tk.is_punct and u['np'] == 1 and u['text'] != '-'): continue
        if u['text'] == '-': continue
        line = lmap[bisect.bisect_right(starts, u['idx']) - 1][1]
        g = lambda k, f: U[k][f] if 0 <= k < len(U) else ''
        nxt = g(i + 1, 'lower')
        p1 = g(i - 1, 'lemma').lower(); p2 = g(i - 2, 'lemma').lower()
        prev_t = g(i - 1, 'text'); prev_ws = U[i-1]['ws'] if i >= 1 else ' '
        toks.append((book, sec, sub, u['text'], u['lower'], u['lemma'], u['pos'], u['ent'], bool(u['ss']), nxt, p1, p2,
                     unit, page, prev_t, prev_ws, g(i + 1, 'text'), u['ws'], g(i + 2, 'text'), cur, line, region, is_body, g(i - 2, 'text'),
                     u['tag'], u['np']))
print('tokens', len(toks), 'secs', round(time.time() - t0), dict(LOG), flush=True)
pickle.dump(toks, open('tokens_v4.pkl', 'wb')); pickle.dump(sents, open('sents_v4.pkl', 'wb'))
with open('blocks_v4.jsonl', 'w', encoding='utf-8') as f:
    for b in blocks: f.write(json.dumps(dict(key=list(b[0]), text=b[1], lines=b[3]), ensure_ascii=False) + '\n')
with open('dehyphenation_v4.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(DEHYPH[0].keys())); w.writeheader(); w.writerows(DEHYPH)
json.dump({'counts': dict(LOG), 'examples': EX}, open('lemmatize_stats.json', 'w'), indent=1)
