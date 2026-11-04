#!/usr/bin/env python3
"""ClawWords v3 list (2026-11-03). Derived from build_final.py of candidate-2026-10-31-final (the 8 finalization rules are kept as-is, plan C:
headword Zipf >= 5.5 basic-word filter with the 22 exceptions incl. 'based'), applied to the v3 token stream (01 -> 02 -> 03 of this dir).
All v3 word-level decisions come from overrides_v3.py (rule ids V1..V20). Inputs: staged_v3.pkl, tokens_v3.pkl, sents_v3.pkl (this dir),
reference lists in ../v3-inputs/ielts-freq-2026-10-30/, baseline ../v3-inputs/candidate-2026-10-31-final/.

What is counted (total_count and the per-section counts): BODY TEXT ONLY = section_index region in {passage, tapescript} (is_body=1):
reading passages (academic + General Training reading texts) and listening tapescripts (speaker turns, without narrator rubric lines).
Not counted (kept in separate columns): instruction/heading/narrator lines (instruction_line_count), question stems, options, statements,
completion texts, heading lists (question_count), writing/speaking task prompts and cue cards (prompt_count), writing rubric sentences
(prompt_rubric_count), model/sample answers and examiner comments (excluded_source_count, as in 10-31), answer keys, front/back matter.
The 8 finalization rules of 10-31 (unchanged): 1 yes/sure/goodbye removed; 2 several/whole/various/due to/serious in main list;
3 restored place words concentrated in one text removed (cities never restored); 4 advanced/concerned/based/fishing own cards;
5 instruction_word / single_text_concentration are flags only; 6 writing rubric not counted (now subsumed by body-only);
7 the 12 keep-anyway words; 8 filter C (zipf_headword >= 5.5 removed, 22 exceptions).

2026-11-03 v4 (candidate-2026-11-03-v4): copy of build_v3.py reading staged_v4.pkl / tokens_v4.pkl / sents_v4.pkl and overrides_v4.py.
Word-level changes (ids in overrides_v4.py): W6 'mm' -> millimetre only after a number; W8a VBD 'lay' -> lie; W8b 'as opposed to' is a
reserved phrase (not oppose); W8c percent displayed by its majority spelling ('per cent'); W8d participle display threshold 0.75;
W8e ton(s) no longer merged into tonne (except 'metric ton'); W9 May kept as the 23rd filter-C exception (user decision 1).
The output files and columns are those of v3 (final_wordlist.csv etc.)."""
import pickle, csv, json, re, math, collections, sys, os
from wordfreq import zipf_frequency, word_frequency
from spacy.lang.en.stop_words import STOP_WORDS
import pycountry
sys.path.insert(0, '.')
from overrides_v4 import *
LSRC = '../v3-inputs/ielts-freq-2026-10-30/'
B1031 = '../v3-inputs/candidate-2026-10-31-final/'
ST = pickle.load(open('staged_v4.pkl', 'rb')); RAW = pickle.load(open('tokens_v4.pkl', 'rb')); SENTS = pickle.load(open('sents_v4.pkl', 'rb'))
EXCL_REGIONS = {'writing_model_answer', 'speaking_model_answer'}
INSTR_REGIONS = {'instruction', 'heading', 'narrator'}
QUESTION_REGIONS = {'reading_question', 'listening_question'}
PROMPT_REGIONS = {'writing_prompt', 'speaking_prompt'}
RUBRIC_REGIONS = {'writing_rubric'}
def bucket(o):
    if o['is_body']: return 'body'
    r = o['region']
    if r in EXCL_REGIONS: return 'excl'
    if r in INSTR_REGIONS: return 'instr'
    if r in QUESTION_REGIONS: return 'question'
    if r in PROMPT_REGIONS: return 'prompt'
    if r in RUBRIC_REGIONS: return 'rubric'
    return 'other_nonbody'
CLOSED_POS = {'DET', 'PRON', 'ADP', 'CCONJ', 'SCONJ', 'AUX', 'PART'}
LEX_PLURAL = set('''sales savings findings surroundings goods means belongings earnings outskirts premises remains customs
manners clothes glasses scissors trousers jeans headquarters series species news mathematics physics economics politics ethics
electronics athletics genetics linguistics logistics graphics statistics acoustics aerobics thanks congratulations odds proceeds'''.split())   # 'arms' removed (audit 467)
def ctx(o, n=150): return SENTS[o['sid']].replace('\n', ' ')[:n]
def raw_at(k): return RAW[k] if 0 <= k < len(RAW) else None

# ---------- proper-noun restore (10-31 item 4) ----------
MONTHS = set('january february march april may june july august september october november december'.split())
WEEKDAYS = set('monday tuesday wednesday thursday friday saturday sunday'.split())
REGIONS = set('''africa asia europe america americas antarctica antarctic arctic oceania australasia mediterranean pacific atlantic caribbean
sahara amazon scandinavia siberia himalayas alps andes polynesia melanesia micronesia patagonia outback earth'''.split())
COUNTRIES = {getattr(c, a).lower() for c in pycountry.countries for a in ('name', 'common_name') if getattr(c, a, None) and ' ' not in getattr(c, a) and ',' not in getattr(c, a)}
COUNTRIES |= set('britain england scotland wales uk usa holland persia'.split()) | {'new zealand'}          # V3: New Zealand
NATIONALITY = set('''english british american australian dutch french german chinese japanese indian italian spanish greek roman latin
european african asian canadian irish scottish welsh egyptian mexican brazilian arabic arab russian korean polynesian maori aboriginal
portuguese swedish norwegian danish finnish turkish persian inca aztec mayan inuit victorian'''.split())       # V12: romans/europeans -> singular
RESTORE = {**{w: 'month' for w in MONTHS}, **{w: 'weekday' for w in WEEKDAYS}, **{w: 'continent/region/planet' for w in REGIONS},
           **{w: 'country' for w in COUNTRIES}, **{w: 'nationality/language/people' for w in NATIONALITY},
           **{w: 'generic word in names (V12)' for w in RESTORE_GENERIC}}

# ---------- lemma rules (10-31, unchanged unless marked) ----------
IRREG_PL = {'children': 'child', 'lives': 'life', 'women': 'woman', 'men': 'man', 'people': 'person'}
def is_plural_of(p, s):
    if p.endswith('ics'): return False
    return IRREG_PL.get(p) == s or p in (s + 's', s + 'es') or (s.endswith('y') and p == s[:-1] + 'ies')
PARTICIPLE_MERGE = {'improved': 'improve', 'preferred': 'prefer', 'recycled': 'recycle', 'involved': 'involve', 'related': 'relate', 'closed': 'close', 'extended': 'extend'}
RENAME = {'situate': 'situated', 'entitle': 'entitled', 'domesticate': 'domesticated'}
GERUND_MERGE = {g: v for g, v in (x.split(':') for x in '''making:make starting:start buying:buy walking:walk running:run cleaning:clean
collecting:collect harvesting:harvest planting:plant testing:test sharing:share washing:wash dancing:dance driving:drive drinking:drink
flooding:flood grazing:graze feeding:feed swimming:swim cooking:cook camping:camp sailing:sail cycling:cycle hunting:hunt shopping:shop
knitting:knit breeding:breed recycling:recycle printing:print dining:dine breathing:breathe nesting:nest working:work bullying:bully
streaming:stream'''.split())}
GERUND_KEEP = {}
for cat, ws in (('object/result/place/event', 'building painting drawing carving recording setting opening meeting crossing clothing housing seating lighting heating packaging warning ending beginning'),
                ('field/industry/discipline', 'engineering marketing advertising manufacturing farming mining fishing shipping trading catering processing planning training teaching learning'),
                ('lexicalised abstract sense', 'meaning feeling understanding being thinking reasoning living timing conditioning funding spending booking parking warming hearing writing reading')):
    for w in ws.split(): GERUND_KEEP[w] = cat
OTHER_MERGE = {'finding': 'findings', 'okay': 'ok'}
UKUS = {us: uk for uk, us in (x.split(':') for x in '''centre:center programme:program organise:organize organisation:organization
behaviour:behavior colour:color theatre:theater realise:realize recognise:recognize kilometre:kilometer analyse:analyze favour:favor
favourite:favorite summarise:summarize civilisation:civilization neighbour:neighbor labour:labor emphasise:emphasize humour:humor
neighbourhood:neighborhood fertiliser:fertilizer minimise:minimize harbour:harbor fibre:fiber jewellery:jewelry centimetre:centimeter
specialised:specialized criticise:criticize specialise:specialize defence:defense flavour:flavor publicise:publicize licence:license
millimetre:millimeter maximise:maximize characterise:characterize utilise:utilize judgement:judgment ageing:aging enrol:enroll
fulfil:fulfill maths:math artefact:artifact aluminium:aluminum sceptical:skeptical medieval:mediaeval apologise:apologize
travelling:traveling traveller:traveler modelling:modeling'''.split())}      # v3: install:instal removed -> LEMMA_FIX (audit 692)
EXTRA_ALIAS = {'dialogue': 'dialog', 'traveller': 'traveler', 'mould': 'mold', 'grey': 'gray', 'industrialisation': 'industrialization'}   # W8e: tonne no longer aliased to ton
SURFACE_CARD = {'advanced', 'concerned', 'based', 'fishing'}   # final rule 4

# V9 gerund split, computed from body tokens: NOUN share of the base word (its non -ing tokens)
base_pos = collections.defaultdict(collections.Counter)
for o in ST:
    if o['is_body'] and not o['lower'].endswith('ing'): base_pos[o['lem']][o['pos']] += 1
def noun_share(v):
    c = base_pos[v]; n = sum(c.values()); return (c['NOUN'] / n) if n else 0.0
GERUND_SPLIT = {g: round(noun_share(v), 2) for g, v in GERUND_MERGE.items() if noun_share(v) >= GERUND_SPLIT_NOUN_SHARE}
noun_lem = collections.defaultdict(collections.Counter)
for o in ST:
    if o['is_body'] and o['pos'] == 'NOUN': noun_lem[o['lower']][o['lem']] += 1
MODAL_NEXT = {'be', 'have', 'not', 'also', 'well', 'still', 'need', 'take', 'find', 'want', 'i', 'we', 'you', 'he', 'she', 'it', 'they', 'help', 'ask', 'just'}
def has_digit(s): return any(c.isdigit() for c in s)

remap = collections.Counter(); drops = collections.Counter(); drop_ex = collections.defaultdict(list); ctxlog = collections.defaultdict(list)
def final_lemma(o):
    """returns (final_lemma or None if the token is dropped, original lemma, rule)"""
    lower, lem, pos, text = o['lower'], o['lem'], o['pos'], o['text']; orig = lem; rule = ''
    pl, nl = o['prev_t'].lower(), o['next_t'].lower()
    # W6: 'mm' is a millimetre only after a number; otherwise the hesitation sound 'Mm' (filler, removed)
    if lower in NUMERIC_UNIT_ONLY:
        if has_digit(o['prev_t']) or pl in NUMBER_WORDS_PREV or (o['prev_t'] == '-' and has_digit(o['prev2_t'])):
            return UNIT_ALIAS[lower], orig, 'W6 mm after a number -> millimetre'
        return lower, orig, 'W6 mm not after a number: hesitation sound (filler)'
    # W8e: ton(s) is not the tonne, except 'metric ton(s)'
    if lower in TON_FORMS:
        if pl in TON_METRIC_PREV: return 'tonne', orig, 'W8e metric ton -> tonne'
        return 'ton', orig, 'W8e ton (imperial/US ton, not merged into tonne)'
    # W8b: 'as opposed to' is a reserved contrast phrase, not oppose/opposed
    if lower == 'opposed' and pl == 'as' and nl == 'to': return AS_OPPOSED_TO, orig, 'W8b "as opposed to" -> reserved phrase (connectives)'
    # W8a: VBD/VBN 'lay' is the past tense of lie unless a base-form or object context makes it the verb lay
    if lower == 'lay' and pl in ('a', 'an', 'the'): return 'lay', orig, 'W8a lay (adjective: a lay doctor, the lay visitor)'
    if lower == 'lay' and o['tag'] in ('VBD', 'VBN'):
        n2 = o['next2'].lower()
        if pl in LAY_BASE_PREV or nl in LAY_OBJECT_NEXT or nl in LAY_OBJECT_NOUN or n2 in LAY_OBJECT_NOUN: return 'lay', orig, 'W8a lay (verb lay: base form / object follows)'
        return 'lie', orig, 'W8a lay = past tense of lie -> lie'
    if lower == 'lay': return 'lay', orig, ''
    # W8h: place-name parts
    for (w_, where, ctxw), why in PLACE_NAME_PARTS.items():
        if lower != w_: continue
        if where == 'prev2' and (o['prev2_t'].lower(), pl) == ctxw: return None, orig, why
        if where == 'next' and nl in ctxw: return None, orig, why
        if where == 'prev' and pl in ctxw: return None, orig, why                                  # W10b (v4.1)
    # W8i: independent-sense forms get their own lemma
    if lower in INDEPENDENT_FORMS and not o['propn'] and (INDEPENDENT_FORMS[lower] is None or pos in INDEPENDENT_FORMS[lower]): return lower, orig, 'W8i independent-sense form (own lemma)'
    # V3 phrase cards / absorbed partners (before the proper-noun test: 'New Zealand', 'United States')
    for (w1, w2), card in PHRASES.items():
        if w2 == 'to':
            if lower == w1 and nl == 'to': return card, orig, PHRASE_REASON[card]
            continue
        if lower == w2 and pl == w1 and o['prev_ws']: return card, orig, PHRASE_REASON[card]
        if lower == w1 and nl == w2 and o['ws']: return None, orig, f'absorbed into phrase card "{card}"'
    if text == 'US' and pos in ('PROPN', 'NOUN'): return 'usa', orig, 'V3 US -> USA'
    # V4 discourse idioms
    if lower == 'course' and pl == 'of':
        nx = raw_at(o['i'] + 1)
        if not (nx and nx[6] in ('NOUN', 'PROPN')): return 'of course', orig, 'V4 discourse idiom -> connectives'
    if lower == 'fact' and pl == 'in': return 'in fact', orig, 'V4 discourse idiom -> connectives'
    if lower == 'hand' and pl in ('other', 'one') and o['prev2_t'].lower() == 'the':
        p3 = raw_at(o['i'] - 3)
        if p3 and p3[4] == 'on': return f'on the {pl} hand', orig, 'V4 discourse idiom -> connectives'
    # V13 months: May only in a date context; lowercase march/may/august are other words
    if lower == 'may':
        if text == 'May' and (pl in MAY_PREV or has_digit(o['prev_t']) or has_digit(o['next_t'])) and nl not in MODAL_NEXT:
            return 'may', orig, 'V13 month May (date context)'
        return None, orig, 'modal may (function word)'
    if lower in ('march', 'august') and text[:1].islower(): return f'{lower} (common word)', orig, 'V13 lowercase month word is not the month'
    if o['propn']:
        if lower in NATIONALITY_PLURAL: return NATIONALITY_PLURAL[lower], orig, 'V12 nationality plural -> singular'
        if lower.endswith('s') and lower[:-1] in RESTORE_GENERIC: return lower[:-1], orig, 'V12 restored generic name word'
        if lower not in RESTORE: return None, orig, 'proper_noun'
        lem = lower; rule = 'proper-noun restore' if lower not in RESTORE_GENERIC else 'V12 restored generic name word'
    if lower in NATIONALITY_PLURAL: return NATIONALITY_PLURAL[lower], orig, 'V12 nationality plural -> singular'
    if lower == 'van' and o['next_t'][:1].isupper(): return None, orig, 'van: surname particle (van Gogh, Van Eck ...)'
    if lem == 'tense' and (lower == 'tenses' or 'past tense' in SENTS[o['sid']].lower() and pl == 'past'): return None, orig, 'tense: grammatical tense'
    # V5 interjections / formulae
    if lower == 'thanks': return None, orig, INTERJ_TOKEN['thanks']
    if lower == 'thank' and nl in THANK_FORMULA_NEXT: return None, orig, INTERJ_TOKEN['thank']
    if lower == 'dear' and (pl in ('oh', 'on') or (text == 'Dear' and o['next_t'][:1].isupper())): return None, orig, INTERJ_TOKEN['dear']
    # V14 possessive pronoun mine
    if lower == 'mine' and pl not in MINE_NOUN_PREV: return None, orig, 'V14 possessive pronoun mine'
    if lower == 'according' and nl == 'to': lem = 'according to'; rule = 'accord -> according to'
    if lower == 'due' and (nl == 'to' or (nl.endswith('ly') and o['next2'].lower() == 'to')): lem = 'due to'; rule = 'due -> due to (phrase card)'
    if lower in SURFACE_CARD: lem = lower; rule = 'separate card (surface form)'
    if lower in OWN_FORM: lem = lower; rule = 'V11 separate card (independent sense)'
    if lower in ('means', 'remains') and pos in ('VERB', 'AUX'): lem = lower[:-1]; rule = '3rd-person verb -> verb'
    if lower == 'rights' and pos != 'VERB': lem = 'rights'; rule = 'separate card (rights)'              # v3: also PROPN 'Rights' (audit 769)
    if lower == 'arts': lem = 'arts'; rule = 'separate card (arts)'                                      # v3: also PROPN 'Arts' (audit 559)
    # V8 meter: unit vs device
    if lower in ('meter', 'meters'):
        if has_digit(o['prev_t']) or (o['prev_t'] == '-' and has_digit(o['prev2_t'])) or pl in METER_UNIT_PREV or nl in METER_UNIT_NEXT: return 'metre', orig, 'V8 meter (unit, US spelling) -> metre'
        return 'meter', orig, 'V8 meter (device) kept'
    if lem in UNIT_ALIAS: lem = UNIT_ALIAS[lem]; rule = 'V7 unit symbol/spelling -> unit card'
    IRREG = {'children': 'child', 'women': 'woman', 'men': 'man', 'people': 'people', 'feet': 'foot', 'teeth': 'tooth', 'mice': 'mouse', 'geese': 'goose'}
    if pos == 'PROPN' and lower in IRREG: lem = IRREG[lower]; rule = rule or 'PROPN-tagged irregular plural -> base noun'
    if pos == 'PROPN' and lem == lower and lem.endswith('s') and lem not in LEX_PLURAL and noun_lem[lower]:
        alt = noun_lem[lower].most_common(1)[0][0]
        if alt != lem and len(alt) >= 3 and alt not in STOP_WORDS and is_plural_of(lem, alt): lem = alt; rule = rule or 'PROPN-tagged plural -> base noun'
    if lem in GERUND_SPLIT: return lem, orig, f'V9 activity gerund kept as own card (base noun share {GERUND_SPLIT[lem]})'
    for d, r in ((PARTICIPLE_MERGE, 'pure participle -> verb'), (GERUND_MERGE, 'activity gerund -> verb'), (OTHER_MERGE, 'variant merge'),
                 (RENAME, 'card shown as participle'), (UKUS, 'US/UK spelling -> British canonical')):
        if lem in d: lem = d[lem]; rule = r
    return lem, orig, rule

# ---------- pass 1: final lemma per token; V10 adjectival -ed form majority ----------
FL = []
form_cards = collections.defaultdict(collections.Counter); form_adjlike = collections.Counter()
for o in ST:
    fl, orig, rule = final_lemma(o); FL.append((fl, orig, rule))
    if fl and o['is_body'] and o['lower'].endswith('ed'):
        form_cards[o['lower']][fl] += 1
        nx = raw_at(o['i'] + 1)
        if fl == o['lower'] or (o['pos'] == 'VERB' and nx and nx[6] in ('NOUN', 'PROPN')): form_adjlike[o['lower']] += 1
card_forms_body = collections.defaultdict(collections.Counter)
for k, o in enumerate(ST):
    if FL[k][0] and o['is_body']: card_forms_body[FL[k][0]][o['lower']] += 1
ADJ_FORM = {}
for form, c in form_cards.items():
    tot = sum(c.values())
    if form in c and len(c) > 1 and form not in SURFACE_CARD and form not in PARTICIPLE_MERGE and form_adjlike[form] / tot > ADJ_FORM_MAJORITY:
        base = max((l for l in c if l != form), key=lambda l: c[l])
        base_other = sum(v for f_, v in card_forms_body[base].items() if f_ != form)
        if base_other <= ADJ_FORM_BASE_MAX * tot: ADJ_FORM[form] = (round(form_adjlike[form] / tot, 2), dict(c), base, base_other)
for k, o in enumerate(ST):
    fl, orig, rule = FL[k]
    if fl and o['lower'] in ADJ_FORM and fl != o['lower']: FL[k] = (o['lower'], orig, f'V10 adjectival -ed form majority (adjectival share {ADJ_FORM[o["lower"]][0]})')

# per-token card assignment of body tokens (for diff_vs_v3.py and STEP 2 example matching): (staged index, line, surface form, card, rule)
pickle.dump([(k, o['line'], o['lower'], FL[k][0], FL[k][2]) for k, o in enumerate(ST) if o['is_body']], open('card_tokens_v4.pkl', 'wb'))

# ---------- pass 2: aggregate ----------
E = collections.defaultdict(lambda: {'count': 0, 'books': set(), 'L': 0, 'R': 0, 'W': 0, 'S': 0, 'O': 0, 'rubric': 0, 'pos': collections.Counter(),
                                     'forms': collections.Counter(), 'orig': collections.Counter(), 'first': None, 'units': collections.Counter(),
                                     'cased': collections.Counter(), 'midsent': 0, 'excl': 0, 'excl_books': set(), 'instr': 0, 'question': 0, 'prompt': 0,
                                     'other_nonbody': 0, 'rules': collections.Counter(), 'tags': collections.Counter(), 'form_rules': collections.Counter()})
form_lemma = collections.defaultdict(collections.Counter); N = 0; NB = collections.Counter(); restored_tok = collections.Counter()
SPLIT_RULE_PREFIX = ('separate card', 'V9', 'V11', 'proper-noun restore', 'V12 restored', 'V13', 'V8 meter (device)')
for k, o in enumerate(ST):
    fl, orig, rule = FL[k]
    b = bucket(o)
    if fl is None:
        if b == 'body' and rule != 'proper_noun':
            drops[rule] += 1
            if len(drop_ex[rule]) < 12: drop_ex[rule].append(f"{o['text']} | {ctx(o, 110)}")
        continue
    e = E[fl]; NB[b] += 1
    if b == 'excl': e['excl'] += 1; e['excl_books'].add(o['book']); continue
    if b == 'instr': e['instr'] += 1; continue
    if b == 'question': e['question'] += 1; continue
    if b == 'prompt': e['prompt'] += 1; continue
    if b == 'rubric': e['rubric'] += 1; continue
    if b == 'other_nonbody': e['other_nonbody'] += 1; continue
    N += 1
    if rule and fl != orig: remap[(orig, o['lower'], fl, rule)] += 1
    if rule == 'proper-noun restore': restored_tok[fl] += 1
    e['form_rules'][(o['lower'], rule)] += 1
    e['count'] += 1; e['books'].add(o['book']); e['forms'][o['lower']] += 1; e['tags'][(o['lower'], o['tag'])] += 1; e['pos'][o['pos']] += 1; e['rules'][rule] += 1
    if not rule.startswith(SPLIT_RULE_PREFIX): e['orig'][orig] += 1
    if e['first'] is None: e['first'] = o['i']
    form_lemma[o['lower']][fl] += 1
    e['units'][o['unit']] += 1
    if o['sec'] in ('U', None): e['O'] += 1
    else: e[o['sec']] += 1
    if not o['ss']:
        e['midsent'] += 1
        if o['text'][:1].isupper(): e['cased'][o['text']] += 1

def zipf_forms(fl):
    f = 0.0
    for form, c in E[fl]['forms'].items():
        f += word_frequency(form if fl != 'used to' else 'used', 'en') * c / sum(form_lemma[form].values())
    return round(math.log10(f * 1e9), 2) if f > 0 else 0.0
def zipf_head(fl): return zipf_frequency(fl, 'en')

# ---------- removal lists (10-31 + V19) ----------
REMOVE = {}
for w in 'paragraphing collocation cohesive cohesion coherently grammatical punctuation modal verb clause referencing'.split():
    REMOVE[w] = 'jargon: examiner-commentary / grammar metalanguage (v1)'
for w in 'ii iv vi vii viii'.split(): REMOVE[w] = 'ocr_fragment: roman-numeral question/option label (v1)'
REMOVE['ili'] = 'ocr_fragment: OCR of roman numeral iii (v1)'; REMOVE['vili'] = 'ocr_fragment: OCR of roman numeral viii (v1)'
REMOVE['al'] = 'ocr_fragment: OCR of "AI" / "et al." (v1)'; REMOVE['goverment'] = 'ocr_fragment: misspelling (v1)'
for w in 're co non pre multi semi sub anti socio mid'.split(): REMOVE[w] = 'ocr_fragment: prefix split off a hyphenated word (v1)'
REMOVE['carly'] = 'person_name: "Carly" + OCR of "early" (v1)'; REMOVE['de'] = 'person_name: name particle (v1)'; REMOVE['da'] = 'person_name: name particle (v1)'
for w in 'um er erm mmm mm hmm'.split(): REMOVE[w] = 'filler: hesitation sound (v1)'
INTERJ = 'oh ok yeah hi ah bye hello uh wow hey ooh oops huh aha yep yup mhm ha'.split()
for w in INTERJ: REMOVE[w] = 'interjection (v2): conversational interjection/greeting in tapescripts'
for w in ('yes', 'sure', 'goodbye'): REMOVE[w] = 'interjection (final rule 1): yes/sure/goodbye deleted as interjections'
for w, why in REMOVE_V3.items(): REMOVE.setdefault(w, why)
KEEP_ANYWAY = 'error sentence vocabulary overall percentage candidate chart score overview adequate grammar graph'.split()   # final rule 7
KEEP_C = 'provide include result system level issue form cause support control base government law force report public national lead power state programme based'.split()   # final rule 8: 22 exceptions
KEEP_C += list(FILTER_C_EXTRA_EXCEPTIONS)   # W9 (user decision 1): May = 23rd exception
CLOSED_SET = {**{w: 'month' for w in MONTHS}, **{w: 'weekday' for w in WEEKDAYS}}   # V13

CONN = {}
for cat, ws in (('discourse/connective adverb', 'however therefore thus moreover furthermore nevertheless nonetheless meanwhile indeed otherwise thereby hence consequently besides likewise accordingly afterwards anyway instead'),
                ('contrast/concession/condition conjunction', 'although though whereas despite unless whether while whilst once except nor either neither whenever'),
                ('preposition (beyond core grammar)', 'throughout due above below beyond within among amongst towards toward alongside unlike via upon per beneath beside across against along behind inside outside without until till regarding concerning'),
                ('adjective/quantifier/adverb on spaCy stoplist', 'serious various whole several full former latter further least alone enough own same few next last twice mostly perhaps almost already rather quite often sometimes together elsewhere everywhere somewhere anywhere somehow ever never yet still again else always'),
                ('discourse idiom (V4: moved out of the noun card)', 'of_course in_fact on_the_other_hand on_the_one_hand'),
                ('contrast phrase (W8b: moved out of oppose)', 'as_opposed_to')):
    for w in ws.split(): CONN[w.replace('_', ' ')] = cat
FORCE_CONTENT = {'serious', 'various', 'whole', 'several', 'due to'}   # final rule 2
for w in FORCE_CONTENT: CONN.pop(w, None)

rows = []
for fl, e in E.items():
    if e['count'] == 0 and fl not in KEEP_ANYWAY and fl not in CLOSED_SET: continue
    maj = e['pos'].most_common(1)[0][0] if e['pos'] else ''
    isfunc = ((maj in CLOSED_POS or (fl in STOP_WORDS and maj not in ('NOUN', 'VERB')) or fl == 'not' or fl in FUNC_EXTRA) and fl not in FORCE_CONTENT
              and fl not in CLOSED_SET and fl not in CONN)
    fw_reason = (('majority POS ' + maj + ' (closed class)') if maj in CLOSED_POS else ('spaCy STOP_WORDS & majority POS ' + maj) if fl in STOP_WORDS and maj not in ('NOUN', 'VERB')
                 else FUNC_EXTRA.get(fl, ''))
    zf = zipf_forms(fl) if e['count'] else round(zipf_frequency(fl, 'en'), 2); zl = zipf_head(fl)
    pm = e['count'] / N * 1e6 if e['count'] else 0
    exam_zipf = round(math.log10(pm) + 3, 2) if pm else 0
    ic = (not isfunc and 0 < zf < 4.0 and exam_zipf - zf >= 1.0 and e['count'] >= 20 and len(e['books']) >= 6)
    origs = list(e['orig'])
    aliases = sorted({o for o in origs if UKUS.get(o) == fl or (OTHER_MERGE.get(o) == fl and o != 'finding')} | {a for a, t in UNIT_ALIAS.items() if t == fl and a in e['forms']})
    if fl in EXTRA_ALIAS: aliases.append(EXTRA_ALIAS[fl])
    if fl == 'usa': aliases += ['US', 'United States']
    if fl == 'percent':                                                                    # W8c: display = majority spelling
        n_two = sum(c for (f_, ru), c in e['form_rules'].items() if ru.startswith('V3 per cent'))
        if PERCENT_DISPLAY_BY_MAJORITY and n_two * 2 > e['count']: aliases.append('percent')
        else: aliases.append('per cent')
    disp = fl
    if e['midsent'] >= 3 and sum(e['cased'].values()) / e['midsent'] >= 0.6:
        top = e['cased'].most_common(1)[0][0]
        disp = top if top.lower() == fl else (fl.upper() if top.isupper() and len(top) > 1 else ' '.join(x[:1].upper() + x[1:] for x in fl.split(' ')))
    if fl in CLOSED_SET or fl == 'new zealand': disp = ' '.join(x[:1].upper() + x[1:] for x in fl.split(' '))
    if fl in RESTORE_GENERIC: disp = fl                     # V12: generic word, capitalised only inside names
    if fl == 'percent' and PERCENT_DISPLAY_BY_MAJORITY and 'percent' in aliases: disp = 'per cent'   # W8c
    # V16 display form from the dominant surface form (participle/adjectival use only; plurals only when the singular is absent)
    if e['count'] and disp == fl and fl not in DISPLAY_OVERRIDE and ' ' not in fl:
        bare = e['forms'][fl] / e['count']
        part = collections.Counter()
        for (f_, tg), c in e['tags'].items():
            if (f_.endswith('ed') and tg in ('VBN', 'JJ')) or (f_.endswith('ing') and tg in ('NN', 'VBG')): part[f_] += c
        if part and bare <= DISPLAY_BARE_MAX:
            form, fc = part.most_common(1)[0]
            if fc / e['count'] >= DISPLAY_SHARE_PARTICIPLE_V4: disp = form          # W8d (was DISPLAY_SHARE_PARTICIPLE = 0.66)
        if disp == fl:
            form, fc = e['forms'].most_common(1)[0]
            if PLURAL_DISPLAY.get(fl) == form and fc / e['count'] >= DISPLAY_SHARE_PLURAL: disp = form
    disp = DISPLAY_OVERRIDE.get(fl, disp)
    units = e['units'].most_common(); tu, tc = units[0] if units else ('', 0)
    top3 = sum(c for _, c in units[:3])
    nonbody_exam = e['instr'] + e['question'] + e['prompt'] + e['rubric']
    rows.append(dict(lemma=fl, display_form=disp, aliases='|'.join(aliases), total_count=e['count'], books=len(e['books']),
        listening_count=e['L'], reading_count=e['R'], writing_count=e['W'], speaking_count=e['S'], other_count=e['O'],
        zipf=zf, zipf_headword=zl, ielts_characteristic=ic, excluded_source_count=e['excl'], prompt_rubric_count=e['rubric'],
        instruction_line_count=e['instr'], top_unit=tu, top_unit_share=round(tc / e['count'], 3) if e['count'] else 0, distinct_units=len(e['units']),
        merged_from='|'.join(sorted(o for o in origs if o != fl)), main_pos=maj, _isfunc=isfunc, _fw_reason=fw_reason, _first=e['first'] or 10**9,
        _total_with_excl=e['count'] + e['excl'], _books_with_excl=len(e['books'] | e['excl_books']),
        question_count=e['question'], prompt_count=e['prompt'], nonbody_exam_count=nonbody_exam,
        top3_unit_share=round(top3 / e['count'], 3) if e['count'] else 0, count_outside_top_unit=e['count'] - tc,
        month_flag=CLOSED_SET.get(fl) == 'month', weekday_flag=CLOSED_SET.get(fl) == 'weekday'))
R = {r['lemma']: r for r in rows}
def meets(r): return r['total_count'] >= 10 and r['books'] >= 3

# ---------- flags ----------
for r in rows:
    nb = r['nonbody_exam_count']
    r['instruction_word'] = bool(nb >= INSTR_MIN and nb / (r['total_count'] + nb) >= INSTR_SHARE)                       # V18
    r['single_text_concentration'] = bool(r['total_count'] >= 1 and r['top_unit_share'] >= 0.6)                         # unchanged definition
    r['single_text_flag'] = bool(r['total_count'] >= 1 and (r['top_unit_share'] >= SINGLE_TEXT_TOP1 or r['top3_unit_share'] >= SINGLE_TEXT_TOP3))   # V17
NOTE = {'due to': 'phrase card: due + to (incl. due primarily to); other uses of due stay in connectives_reserved',
        'based': 'own card: all tokens of based (incl. based on)', 'advanced': 'own card: all tokens of advanced', 'concerned': 'own card: all tokens of concerned', 'fishing': 'own card: all tokens of fishing',
        'van': 'only vehicle uses counted; surname particles dropped', 'meter': 'device sense only; unit uses (US spelling) merged into metre (V8)',
        'metre': 'includes US meter/meters in unit contexts (V8)', 'programme': 'merged with program', 'licence': 'merged with license',
        'practise': 'kept separate from practice', 'practice': 'kept separate from practise', 'storey': 'US "story" not aliased',
        'according to': 'phrase card: all tokens are "according to"', 'hope': 'includes hoping/hoped/hopes mis-lemmatised as hop (V1)',
        'cope': 'includes coping/coped/copes mis-lemmatised as cop (V1)', 'sense': 'includes senses mis-lemmatised as sens (V1)', 'findings': 'includes singular finding',
        'means': 'noun uses only; 3rd-person verb "means" moved to mean', 'remains': 'noun uses only; 3rd-person verb "remains" moved to remain',
        'self': 'standalone noun only; self-X compounds are their own tokens (H1)', 'rights': 'own card (human/legal rights), split from right',
        'arts': 'own card (the arts), split from art', 'percent': 'includes per cent / per-cent (V3)', 'usa': 'includes US and United States (V3)',
        'thanks to': 'phrase card (V3); conversational thanks removed (V5)', 'born': 'own card (be born), split from bear (V11)', 'may': 'month May only (date context, V13); kept as the 23rd filter-C exception (W9, user decision 1)',
        'millimetre': 'includes mm only after a number (W6)', 'tonne': 'tonne/tonnes + metric ton(s); other ton(s) not merged (W8e)'}

PLACE_CATS = {'country', 'continent/region/planet', 'nationality/language/people'}
kept_all = []; removed = []; dropped_excl = []; func_rows = []
for r in rows:
    fl = r['lemma']
    if fl in CONN: func_rows.append(r); continue
    if r['_isfunc'] and fl not in KEEP_ANYWAY: func_rows.append(r); continue
    if not meets(r) and fl not in KEEP_ANYWAY and fl not in CLOSED_SET:
        if r['_total_with_excl'] >= 10 and r['_books_with_excl'] >= 3: dropped_excl.append(r)
        continue
    if fl in REMOVE: removed.append(r); continue
    if fl in RESTORE and restored_tok[fl] and RESTORE[fl] in PLACE_CATS and r['single_text_concentration']:
        REMOVE[fl] = f'place_single_text (final rule 3): restored {RESTORE[fl]} word propped up by one passage (top_unit_share {r["top_unit_share"]})'
        r['_place_single'] = True; removed.append(r); continue
    r['note'] = NOTE.get(fl, '')
    if fl in KEEP_ANYWAY and not meets(r): r['note'] = (r['note'] + '; ' if r['note'] else '') + 'kept by user decision (final rule 7) despite falling below threshold'
    if fl in CLOSED_SET and not meets(r): r['note'] = (r['note'] + '; ' if r['note'] else '') + f'closed set ({CLOSED_SET[fl]}, V13): kept below threshold'
    if fl in RESTORE and restored_tok[fl]: r['note'] = (r['note'] + '; ' if r['note'] else '') + f'restored from proper-noun filter ({RESTORE[fl]}; {restored_tok[fl]} of {r["total_count"]} body tokens were tagged as proper nouns)'   # W8j
    kept_all.append(r)
kept_all.sort(key=lambda r: (-r['total_count'], -r['books'], r['_first']))
for i, r in enumerate(kept_all, 1): r['rank'] = i
for r in kept_all:
    r['removed_A_zipf6'] = r['zipf'] >= 6.0; r['removed_B_zipf5.5'] = r['zipf'] >= 5.5
    r['removed_C_headword5.5_keep22'] = r['zipf_headword'] >= 5.5 and r['lemma'] not in KEEP_C
final = [r for r in kept_all if not r['removed_C_headword5.5_keep22']]
for i, r in enumerate(final, 1): r['final_rank'] = i

# ---------- list membership (as 10-31) ----------
EBB = re.findall(r'"word":"([^"]+)"', open(LSRC + 'ebb2981_words.ts.txt', encoding='utf-8').read())
C84 = [w['word'] for w in json.load(open(LSRC + 'c8464d2_active_words.json'))]
cand_keys = {}
for r in kept_all:
    for k in [r['lemma'], *r['aliases'].lower().split('|'), *r['merged_from'].split('|')]:
        if k and k not in cand_keys: cand_keys[k] = r
surf2lem = {form: c.most_common(1)[0][0] for form, c in form_lemma.items()}
def classify(head, flag=None):
    h = head.strip().lower()
    cands = [h, UKUS.get(h, h), surf2lem.get(h, ''), UKUS.get(surf2lem.get(h, ''), '')]
    for a, b in (('ization', 'isation'), ('izer', 'iser'), ('ize', 'ise'), ('yze', 'yse'), ('or', 'our'), ('er', 're'), ('ense', 'ence')):
        if h.endswith(a) and len(h) > 5: cands.append(h[:-len(a)] + b)
    for k in cands:
        if k in cand_keys:
            r = cand_keys[k]
            if flag is None or not r[flag]: return 'in_candidate', r['lemma']
            return 'removed_too_basic', r['lemma']
    for k in cands:
        if k and k in REMOVE: return 'removed_rule_list', k
        if k and k in CONN: return 'connectives_csv', k
    for k in cands:
        if k and k in R:
            r = R[k]
            if r['_isfunc']: return 'function_word', k
            if r in dropped_excl: return 'dropped_after_sample_exclusion', k
            return 'below_threshold(<10 or <3 books)', k
    return 'not_in_exams', h
for name, raw in (('ebb2981', EBB), ('c8464d2', C84)):
    hit = {k for h in raw for c, k in [classify(h)] if c == 'in_candidate'}
    for r in kept_all: r[f'in_{name}'] = r['lemma'] in hit
diff = {}
for name, raw in (('ebb2981', EBB), ('c8464d2', C84)):
    heads = list(dict.fromkeys(w.strip() for w in raw)); cls = collections.Counter(); ex = collections.defaultdict(list)
    for h in heads:
        c, k = classify(h, 'removed_C_headword5.5_keep22'); cls[c] += 1
        if c != 'in_candidate' and len(ex[c]) < 30: ex[c].append(h)
    adds = [r for r in final if not r[f'in_{name}']]
    diff[name] = {'list_headwords': len(heads), 'headword_status': dict(cls), 'examples_not_kept': dict(ex), 'candidate_entries': len(final),
                  'candidate_in_list': len(final) - len(adds), 'candidate_not_in_list(adds)': len(adds), 'adds_top40': [r['lemma'] for r in adds[:40]]}
json.dump(diff, open('diff_vs_lists.json', 'w'), indent=1, ensure_ascii=False)

def fmt(v): return ('true' if v else 'false') if isinstance(v, bool) else v
# ================= deliverables =================
FCOLS = ['rank', 'lemma', 'display_form', 'aliases', 'total_count', 'books', 'listening_count', 'reading_count', 'writing_count', 'speaking_count',
         'other_count', 'zipf', 'zipf_headword', 'instruction_word', 'single_text_concentration', 'ielts_characteristic', 'in_ebb2981', 'in_c8464d2',
         'top_unit', 'top_unit_share', 'distinct_units', 'instruction_line_count', 'prompt_rubric_count', 'excluded_source_count', 'merged_from', 'note']
NEWCOLS = ['single_text_flag', 'top3_unit_share', 'count_outside_top_unit', 'month_flag', 'weekday_flag', 'question_count', 'prompt_count', 'nonbody_exam_count']
with open('final_wordlist.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(FCOLS + ['rank_before_basic_filter'] + NEWCOLS)
    for r in final: w.writerow([r['final_rank']] + [fmt(r.get(c, '')) for c in FCOLS[1:]] + [r['rank']] + [fmt(r[c]) for c in NEWCOLS])
# app export: no note / internal columns (audit 124) - asserted
APPCOLS = ['rank', 'lemma', 'display_form', 'aliases', 'total_count', 'books', 'instruction_word', 'single_text_flag', 'month_flag', 'weekday_flag']
with open('app_export_wordlist.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(APPCOLS)
    for r in final: w.writerow([r['final_rank']] + [fmt(r[c]) for c in APPCOLS[1:]])
assert 'note' not in open('app_export_wordlist.csv', encoding='utf-8').readline().strip().split(','), 'note column must not be in the app export'
MCOLS = ['rank', 'lemma', 'display_form', 'aliases', 'total_count', 'books', 'listening_count', 'reading_count', 'writing_count', 'speaking_count', 'other_count',
         'zipf', 'zipf_headword', 'ielts_characteristic', 'in_ebb2981', 'in_c8464d2', 'instruction_word', 'single_text_concentration', 'top_unit', 'top_unit_share',
         'distinct_units', 'instruction_line_count', 'prompt_rubric_count', 'excluded_source_count', 'removed_A_zipf6', 'removed_B_zipf5.5',
         'removed_C_headword5.5_keep22', 'merged_from', 'note'] + NEWCOLS
with open('main_before_basic_filter.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(MCOLS)
    for r in kept_all: w.writerow([fmt(r.get(c, '')) for c in MCOLS])
# removed words: rule lists, filter C only (audit 701), function words meeting the threshold (audit 702)
RCOLS = ['lemma', 'category', 'reason', 'total_count', 'books', 'listening_count', 'reading_count', 'writing_count', 'speaking_count', 'other_count', 'zipf', 'zipf_headword', 'nonbody_exam_count']
with open('removed_words.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(RCOLS)
    def wr(r, cat, why): w.writerow([r['lemma'], cat, why] + [r[c] for c in RCOLS[3:]])
    for r in sorted(removed, key=lambda r: (REMOVE[r['lemma']].split(':')[0], -r['total_count'])):
        cat, why = REMOVE[r['lemma']].split(':', 1) if ':' in REMOVE[r['lemma']] else ('interjection', REMOVE[r['lemma']])
        wr(r, cat.strip(), why.strip())
    for r in kept_all:
        if r['removed_C_headword5.5_keep22']: wr(r, 'too_basic_C_headword>=5.5', f"zipf_headword {r['zipf_headword']} (filter C, final rule 8; 22 exceptions)")
    for r in sorted(func_rows, key=lambda r: -r['total_count']):
        if r['lemma'] not in CONN and meets(r): wr(r, 'function_word', r['_fw_reason'] or 'function word')
with open('merges.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['from_lemma', 'surface_form', 'to_lemma', 'tokens', 'rule'])
    for (o, s, t, ru), c in sorted(remap.items(), key=lambda x: (x[0][3], -x[1])): w.writerow([o, s, t, c, ru])
with open('connectives_reserved.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['lemma', 'category', 'total_count', 'books', 'listening_count', 'reading_count', 'writing_count', 'speaking_count', 'other_count', 'zipf', 'zipf_headword', 'main_pos', 'why_not_in_main', 'meets_10x3', 'note'])
    for r in sorted([R[x] for x in CONN if x in R], key=lambda r: -r['total_count']):
        note = {'due': 'residual uses only: "due to" is a main-list phrase card', 'per': 'residual uses only: "per cent" is counted in percent (V3)'}.get(r['lemma'], '')
        if CONN[r['lemma']].startswith('discourse idiom'): note = 'idiom tokens moved out of the noun card (' + r['lemma'].split()[-1] + ')'
        w.writerow([r['lemma'], CONN[r['lemma']], r['total_count'], r['books'], r['listening_count'], r['reading_count'], r['writing_count'], r['speaking_count'], r['other_count'], r['zipf'], r['zipf_headword'], r['main_pos'],
                    r['_fw_reason'] or 'content word by POS rule; reserved as connective', meets(r), note])
restored_rows = sorted([R[w] for w in restored_tok if w in R], key=lambda r: -r['total_count'])
kept_set = {r['lemma'] for r in final}; main_set = {r['lemma'] for r in kept_all}
with open('restored_proper_nouns.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['lemma', 'display_form', 'category', 'restored_capitalised_tokens', 'total_count', 'books', 'meets_10x3', 'in_main_list', 'in_final_list'])
    for r in restored_rows: w.writerow([r['lemma'], r['display_form'], RESTORE[r['lemma']], restored_tok[r['lemma']], r['total_count'], r['books'], meets(r), r['lemma'] in main_set, r['lemma'] in kept_set])
place_removed = [r for r in removed if r.get('_place_single')]
with open('place_words_removed_single_text.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['lemma', 'display_form', 'category', 'total_count', 'books', 'top_unit', 'top_unit_share'])
    for r in sorted(place_removed, key=lambda r: -r['total_count']): w.writerow([r['lemma'], r['display_form'], RESTORE[r['lemma']], r['total_count'], r['books'], r['top_unit'], r['top_unit_share']])
def status(l):
    if l in kept_set: return 'in final list'
    r = R.get(l)
    if r is None or r['total_count'] == 0: return 'no body tokens'
    if l in REMOVE: return 'removed: ' + REMOVE[l][:60]
    if r.get('removed_C_headword5.5_keep22'): return f"removed by filter C (zipf_headword {r['zipf_headword']})"
    if not meets(r): return f"below threshold ({r['total_count']} body tokens in {r['books']} books)"
    return 'not in list (function word)'
gcount = collections.Counter()
for (o, s, t, ru), c in remap.items():
    if ru == 'activity gerund -> verb': gcount[o] += c
with open('gerund_decisions.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['ing_form', 'decision', 'target_or_reason', 'ing_noun_tokens', 'base_noun_share', 'final_status'])
    for g, v in sorted(GERUND_MERGE.items()):
        if g in GERUND_SPLIT: w.writerow([g, 'keep own card (V9)', f'base "{v}" is mainly a noun in body text', R[g]['total_count'] if g in R else 0, GERUND_SPLIT[g], status(g)])
        else: w.writerow([g, 'merge into verb', v, gcount[g], round(noun_share(v), 2), status(v)])
    for g, cat in sorted(GERUND_KEEP.items()): w.writerow([g, 'keep own card', cat, R[g]['total_count'] if g in R else 0, '', status(g)])
# observed body surface forms per card (for STEP 2 example matching: match these forms only, never generated inflections - bee/being)
with open('card_forms.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['rank', 'lemma', 'surface_forms'])
    for r in final: w.writerow([r['final_rank'], r['lemma'], '|'.join(f'{k}:{v}' for k, v in E[r['lemma']]['forms'].most_common())])
# review list: capitalised generic words still filtered as proper nouns (not applied; V12 restores only the 3 audited words)
pc = collections.Counter(); pcb = collections.defaultdict(set)
for o in ST:
    if o['is_body'] and o['propn'] and zipf_frequency(o['lower'], 'en') >= 4.0 and o['lower'] not in RESTORE and o['lowcnt'] >= 2:
        pc[o['lower']] += 1; pcb[o['lower']].add(o['book'])
with open('propn_generic_candidates.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['word', 'capitalised_body_tokens', 'books', 'lowercase_tokens_in_exam_text', 'example'])
    for wd, c in pc.most_common():
        if c >= 10 and len(pcb[wd]) >= 3:
            ex = next(o for o in ST if o['lower'] == wd and o['propn'] and o['is_body'])
            w.writerow([wd, c, len(pcb[wd]), next(o['lowcnt'] for o in ST if o['lower'] == wd), ctx(ex, 100)])

# ---------- context checks ----------
checks = {}
def toks_where(pred): return [(o, FL[k]) for k, o in enumerate(ST) if o['is_body'] and pred(o)]
for w_ in ('may', 'meter', 'meters', 'cent', 'thanks', 'dear', 'mine', 'course', 'fact', 'hand', 'thank', 'march'):
    xs = toks_where(lambda o, w_=w_: o['lower'] == w_)
    c = collections.Counter((fl or 'DROPPED') + ' <- ' + (ru or 'base') for o, (fl, _, ru) in xs)
    checks[w_] = {'body_tokens': len(xs), 'assigned': dict(c.most_common()), 'examples': {k: [ctx(o, 110) for o, (fl, _, ru) in xs if (fl or 'DROPPED') + ' <- ' + (ru or 'base') == k][:4] for k in list(c)[:6]}}
checks['gerund_split'] = GERUND_SPLIT
checks['adj_form_majority'] = ADJ_FORM
checks['hyphen_fragments'] = {w_: {'standalone_body_tokens': R[w_]['total_count'] if w_ in R else 0, 'in_final': w_ in kept_set} for w_ in ('self', 'bell', 'gatherer', 'glow', 'worm', 'sighted', 'sized')}
checks['hyphen_compound_cards_in_final'] = [(r['lemma'], r['total_count'], r['books']) for r in final if '-' in r['lemma']]
json.dump(checks, open('context_checks.json', 'w'), indent=1, ensure_ascii=False)

# ---------- summary ----------
fsum = {'N_counted_body_tokens': N, 'nonbody_tokens_by_bucket': dict(NB), 'main_before_basic_filter': len(kept_all), 'final_C': len(final),
        'C_removed_count': len(kept_all) - len(final), 'C_removed': [r['lemma'] for r in kept_all if r['removed_C_headword5.5_keep22']],
        'section_totals_final': {k: sum(r[k + '_count'] for r in final) for k in ('listening', 'reading', 'writing', 'speaking', 'other')},
        'top30': [(r['final_rank'], r['lemma'], r['display_form'], r['total_count'], r['books']) for r in final[:30]],
        'place_removed': [(r['lemma'], r['total_count'], r['books'], r['top_unit_share']) for r in place_removed],
        'force_content': {l: (R[l]['total_count'], R[l]['books'], R[l].get('final_rank')) for l in FORCE_CONTENT if l in R},
        'surface_cards': {l: (R[l]['total_count'], R[l]['books'], R[l].get('final_rank')) for l in SURFACE_CARD if l in R},
        'keep12': [(l, R[l]['total_count'] if l in R else 0, R[l]['books'] if l in R else 0, R[l].get('final_rank') if l in R else None) for l in KEEP_ANYWAY],
        'closed_set': [(l, R[l]['total_count'] if l in R else 0, R[l]['books'] if l in R else 0, R[l].get('final_rank') if l in R else None, status(l)) for l in sorted(CLOSED_SET)],
        'n_connectives_reserved': len([x for x in CONN if x in R]),
        'flags_final': {k: sum(bool(r[k]) for r in final) for k in ('instruction_word', 'single_text_concentration', 'single_text_flag', 'ielts_characteristic', 'month_flag', 'weekday_flag')},
        'gerund_split': GERUND_SPLIT, 'adj_form_majority': {k: v[0] for k, v in ADJ_FORM.items()},
        'drops_by_context_rule': dict(drops), 'drop_examples': drop_ex,
        'diff_lists': {L: {k: diff[L][k] for k in ('list_headwords', 'candidate_entries', 'candidate_in_list', 'candidate_not_in_list(adds)', 'headword_status')} for L in diff}}
json.dump(fsum, open('final_summary.json', 'w'), indent=1, ensure_ascii=False)
pickle.dump({'R': {k: {kk: (sorted(vv) if isinstance(vv, set) else vv) for kk, vv in v.items()} for k, v in R.items()}, 'final': [r['lemma'] for r in final],
             'kept_all': [r['lemma'] for r in kept_all], 'REMOVE': REMOVE, 'CONN': CONN, 'removed': [r['lemma'] for r in removed],
             'func': [r['lemma'] for r in func_rows], 'forms': {k: dict(v['forms']) for k, v in E.items() if v['count']},
             'rules': {k: dict(v['rules']) for k, v in E.items() if v['count']}}, open('build_state.pkl', 'wb'))
print({k: fsum[k] for k in ('N_counted_body_tokens', 'nonbody_tokens_by_bucket', 'main_before_basic_filter', 'final_C', 'flags_final', 'n_connectives_reserved')})
