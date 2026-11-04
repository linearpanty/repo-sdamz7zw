#!/usr/bin/env python3
"""ClawWords v3 override tables (2026-11-03). Every word-level decision of the v3 build lives here, with its reason.
Imported by 03_stage_tokens_v3.py (LEMMA_FIX, HYPHEN_TO_PHRASE) and build_v3.py (everything else). No output row is ever edited by hand.
Rule ids (V1..V20) are referenced in merges.csv, removed_words.csv, REPORT.md and audit_resolution.csv.

2026-11-03 v4 (candidate-2026-11-03-v4): copy of overrides_v3.py; V1-V20 unchanged except where a W rule below says so. New ids:
  W6, W8a-W8e (word level, 2026-11-03 re-audit) and W9 (user decision 1, May). Corpus-level rules W1-W5, W8f, W8g live in 01/02.
2026-11-04 v4.1 (candidate-2026-11-04-v4.1, 11-04 re-audit must-fix rid 5506 / mexico 5485): W10a LEMMA_FIX riding/rid -> ride;
  W10b PLACE_NAME_PARTS 'Mexico' after 'New' dropped (US state). Nothing else changed."""

# V1  spaCy lemma misassignments, (surface form, spaCy lemma) -> correct lemma. Reviewed from lemma_scan.csv (scan_lemma_errors.py).
#     Only pairs where the spaCy lemma is a different (or non-)word are listed; correct irregulars (lives->life, shown->show ...) are not.
LEMMA_FIX = {
    ('hoping', 'hop'): 'hope', ('hoped', 'hop'): 'hope', ('hopes', 'hop'): 'hope',              # 10-31 FIX_FORM, kept
    ('coping', 'cop'): 'cope', ('coped', 'cop'): 'cope', ('copes', 'cop'): 'cope',              # 10-31 FIX_FORM, kept
    ('senses', 'sens'): 'sense', ('taxes', 'taxis'): 'tax',                                     # 10-31 FIX_FORM, kept
    ('installed', 'instal'): 'install', ('installing', 'instal'): 'install', ('installs', 'instal'): 'install',  # audit 692: was a UK/US alias
    ('specimen', 'speciman'): 'specimen', ('coding', 'cod'): 'code', ('coded', 'cod'): 'code', ('serves', 'serf'): 'serve',
    ('sloping', 'slop'): 'slope', ('graves', 'graf'): 'grave', ('motives', 'motif'): 'motive', ('relies', 'relie'): 'rely',
    ('trialled', 'trialle'): 'trial', ('trialling', 'trialle'): 'trial', ('rifted', 'rifte'): 'rift', ('primed', 'prim'): 'prime',
    ('certifies', 'certifie'): 'certify', ('fined', 'fin'): 'fine', ('equinoxes', 'equinoxe'): 'equinox', ('sparing', 'spar'): 'spare',
    ('spared', 'spar'): 'spare', ('curvier', 'curvi'): 'curvy', ('possesses', 'possesse'): 'possess', ('reconnecting', 'reconnecte'): 'reconnect',
    ('teamworking', 'teamworke'): 'teamwork', ('babysitting', 'babysitte'): 'babysit', ('comics', 'comic_strip'): 'comic',
    ('likelier', 'likeli'): 'likely', ('focussed', 'focusse'): 'focus', ('focussing', 'focusse'): 'focus', ('pest', 'p'): 'pest',
    ('wooded', 'woode'): 'wooded', ('toothed', 'toothe'): 'toothed', ('talented', 'talente'): 'talented', ('renowned', 'renowne'): 'renowned',
    ('unequalled', 'unequalle'): 'unequalled', ('masted', 'maste'): 'masted',
    ('riding', 'rid'): 'ride',                                                                  # W10a (v4.1, 11-04 re-audit rid 5506): all 10 body tokens are 'ride'
}

# V2  hyphen compounds whose open (spaced) spelling is the card
HYPHEN_TO_PHRASE = {'air-conditioning': 'air conditioning', 'air-conditioned': 'air conditioning', 'carbon-dioxide': 'carbon dioxide',
                    'global-warming': 'global warming'}

# V3  phrase cards built from two adjacent tokens: (first word, second word) -> card. The absorbed partner token is not counted separately.
#     'per cent' is the BrE spelling of percent (audit 282: 45 of 47 body 'cent' tokens); New Zealand is a country (audit 446);
#     'United States' / 'US' are the USA (audit 284); carbon dioxide / global warming / air conditioning: >= 75% of the head word's tokens
#     are in the phrase (audit 285, 286, 288); 'thanks to' is a cause phrase like 'due to' (audit 20).
PHRASES = {('per', 'cent'): 'percent', ('carbon', 'dioxide'): 'carbon dioxide', ('global', 'warming'): 'global warming',
           ('air', 'conditioning'): 'air conditioning', ('new', 'zealand'): 'new zealand', ('united', 'states'): 'usa',
           ('thanks', 'to'): 'thanks to'}
PHRASE_REASON = {'percent': 'V3 per cent -> percent (BrE spelling)', 'carbon dioxide': 'V3 phrase card (compound fragment)',
                 'global warming': 'V3 phrase card (compound fragment)', 'air conditioning': 'V3 phrase card (compound fragment)',
                 'new zealand': 'V3 multi-word country restored', 'usa': 'V3 United States -> USA', 'thanks to': 'V3 phrase card (cause phrase, like due to)'}

# V4  discourse idioms: their tokens are moved OUT of the noun card into connectives_reserved.csv (audit 474, 476, 478)
IDIOMS = {('of', 'course'): 'of course', ('in', 'fact'): 'in fact', ('the', 'other', 'hand'): 'on the other hand', ('the', 'one', 'hand'): 'on the one hand'}

# V5  interjections / formulae (same class as yes/sure/goodbye, final rule 1): token-level drops
#     thanks (not followed by 'to'), 'thank you/goodness', 'oh dear', salutation 'Dear X'
INTERJ_TOKEN = {'thanks': 'interjection formula "thanks" (V5; "thanks to" is a phrase card)', 'thank': 'formula "thank you/goodness" (V5)',
                'dear': 'interjection "oh dear" / letter salutation "Dear X" (V5)'}
THANK_FORMULA_NEXT = {'you', 'goodness', 'god', 'heaven', 'heavens'}

# V6  number words are not cards (closed set; audit 19, 429-439, 442 - 'delete all ordinals'). 'second' is kept (time unit; filter C decides).
NUMBER_WORDS = set('''one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen
nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion trillion first third fourth fifth sixth
seventh eighth ninth tenth eleventh twelfth thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth
twenty-first thirtieth fortieth fiftieth hundredth thousandth millionth'''.split())

# V7  unit symbols / spellings -> the full BrE unit card (audit 418, 426, 427); time markers removed (audit 428)
UNIT_ALIAS = {'cm': 'centimetre', 'km': 'kilometre', 'mm': 'millimetre', 'kg': 'kilogram'}   # W8e: 'ton' -> 'tonne' removed (see TON_*)
TIME_MARKERS = {'pm': 'time marker p.m. (V7; am already removed)', 'am': 'time marker a.m. (V7)'}

# V8  meter: per token. Unit context (number / square / cubic / per / few before it, or long/high/deep... after it) -> metre (US spelling of
#     the unit, audit 16); otherwise the measuring device ('parking meter', 'water meter') stays 'meter'.
METER_UNIT_PREV = {'square', 'cubic', 'per', 'few', 'several', 'many', 'hundred', 'hundreds', 'thousand', 'thousands', 'million', 'millions',
                   'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'twenty', 'fifty', 'a', 'of', 'kilo', 'centi'}
METER_UNIT_NEXT = {'long', 'high', 'wide', 'deep', 'tall', 'away', 'below', 'above', 'per', 'square', 'thick', 'across', 'in', 'of', 'from'}

# V9  the gerund rule, made operational (audit 283 cycle/cycling and 562-571): an activity -ing noun in GERUND_MERGE gets its OWN card
#     when its base word is mainly a noun in body text (NOUN share >= 0.6 of the base's non -ing tokens) - the base card then teaches a
#     different meaning (cycle = life cycle, shop = store, camp = place, stream = river). Otherwise it is a pure inflection and merges.
GERUND_SPLIT_NOUN_SHARE = 0.6

# V10 predominantly adjectival -ed forms are one card: when >= 50% of a surface form's tokens are on its own ADJ card (e.g. 'endangered'),
#     the VERB-tagged tokens of the same form join it (audit 15 endanger, 416 isolate, 417 specialise). VERB-majority forms are unchanged.
#     'Adjectival' = tagged ADJ, or a VERB-tagged participle used attributively (directly before a noun/adjective: 'endangered species');
#     the share must be a strict majority (> 0.5). Applies only to forms that already have their own -ed card AND whose base verb hardly
#     occurs in other forms (other forms <= 25% of the -ed form's tokens: endanger/endangers vs endangered). Verbs with a life of their own
#     (control, prepare, limit, share ...) keep their passive/participle tokens - otherwise the rule would empty strong verb cards.
ADJ_FORM_MAJORITY, ADJ_FORM_BASE_MAX = 0.5, 0.25

# V11 independent-sense inflections given their own card (fixed rule: 'inflected forms with an independent sense get their own card')
OWN_FORM = {'born': 'born (be born) - independent sense of bear, audit 443'}

# V12 restored proper-noun-filter words (capitalised inside names, e.g. 'Royal Society', 'Bronze Age', 'Institute of ...'), audit 453-455.
#     Other words of this kind are only listed for review in propn_generic_candidates.csv, not restored automatically.
RESTORE_GENERIC = {'institute': 'generic word in names (Institute of ...)', 'royal': 'generic word in names (Royal Society ...)',
                   'bronze': 'generic word in names (Bronze Age)'}
# nationality plurals -> singular card (audit 468, 469); 'arms' is no longer a lexical plural (audit 467, already in 03)
NATIONALITY_PLURAL = {'romans': 'roman', 'europeans': 'european'}

# V13 months: closed set. All 12 are cards regardless of threshold (audit 444, 445), flagged month_flag=true so the app can group them.
#     Only capitalised month tokens count; 'May' counts only in a date context (V13a); lowercase march/may are other words (audit 577).
MAY_PREV = {'in', 'of', 'early', 'late', 'mid', 'since', 'until', 'till', 'by', 'from', 'during', 'last', 'next', 'this', 'each', 'every',
            'between', 'and', 'or', 'to', 'before', 'after', 'end', 'beginning', 'through', 'throughout', 'on', 'april', 'june', '-', '–'}
# weekdays: same closed-set treatment (weekday_flag)

# V14 pronoun 'mine' (a friend of mine, yours and mine, mine too) is a function word; only the noun/verb counts (audit 143):
#     noun = preceded by a determiner / material word, verb = after 'to'; every other 'mine' is the possessive pronoun.
MINE_NOUN_PREV = {'the', 'a', 'an', 'this', 'that', 'our', 'its', 'their', 'his', 'her', 'every', 'each', 'coal', 'copper', 'gold', 'salt', 'tin',
                  'silver', 'iron', 'diamond', 'open-cast', 'opencast', 'old', 'disused', 'working', 'to'}
# V15 extra function words (no content meaning) - not cards, listed in removed_words.csv as function_word
FUNC_EXTRA = {'none': 'pronoun (audit 434)'}

# V16 display form (audit 403-414; precedent: 10-31 RENAME situated/entitled/domesticated). A verb card displays its -ed/-ing form when
#     >= 66% of its body tokens are that form used as a participle/adjective (tag VBN/JJ, or the -ing gerund) AND the bare form is <= 25%
#     (past tenses such as 'discovered' do not count). Plural display only for lexicalised / Latin plurals in PLURAL_DISPLAY when the plural
#     is >= 90% of the tokens (ordinary nouns keep the singular even if mostly plural: inhabitant, settler). Lemma (card id) unchanged.
DISPLAY_OVERRIDE = {'etc': 'etc.'}
DISPLAY_BARE_MAX = 0.25
PLURAL_DISPLAY = {'stair': 'stairs', 'criterion': 'criteria', 'phenomenon': 'phenomena'}
DISPLAY_SHARE_PARTICIPLE, DISPLAY_SHARE_PLURAL = 0.66, 0.90

# V17 single-text flag (audit 470, 479, 482 - 'ant', 'lizard', 'tortoise' were not flagged): single_text_flag = top_unit_share >= 0.6
#     OR >= 80% of the tokens come from at most 3 texts (units). Flag only - the rank is still by total_count (final rule 5).
SINGLE_TEXT_TOP1, SINGLE_TEXT_TOP3 = 0.6, 0.8

# V18 instruction_word flag, recomputed for body-only counts: exam-paper non-body tokens (instructions + question stems/options +
#     prompts + writing rubric; never model answers) >= 10 AND >= 50% of (body + those) tokens, i.e. the word is at least as frequent in
#     the question paper as in the texts. (0.4 flagged 299 cards - too broad to be useful.) Audit 419-425.
INSTR_MIN, INSTR_SHARE = 10, 0.5

# V19 extra removals (word level)
REMOVE_V3 = {'thanks': 'interjection (V5): conversational "thanks"; "thanks to" is its own phrase card',
             'cent': 'merged (V3): body uses are "per cent" -> percent; residual coin uses below threshold'}
REMOVE_V3.update({w: 'number_word (V6): cardinal/ordinal number words are not cards' for w in NUMBER_WORDS})
REMOVE_V3.update({w: TIME_MARKERS[w] for w in TIME_MARKERS})

# V20 the 10-31 HYPH_FRAG rule (self/sighted/sized) is superseded by the general hyphen rule of 02 (H1): compounds are single tokens.

# ======================= v4 rules (2026-11-03 re-audit, reaudit-2026-11-03/REAUDIT.md) =======================
# W6  'mm' is the millimetre only after a number ('5 mm', '6.8 mm', '5mm', 'five mm'). Every other 'mm'/'Mm' is the hesitation sound
#     ('Mm.', 'Mm, I see') and stays a filler (removed: 'filler: hesitation sound (v1)'). Applied per token in build_v4.final_lemma.
NUMERIC_UNIT_ONLY = {'mm'}
NUMBER_WORDS_PREV = NUMBER_WORDS | {'a', 'few', 'several', 'half', 'hundreds', 'thousands', 'millions', 'tens', 'dozen'}

# W8a 'lay' as the past tense of 'lie' ('The village lay in ruins', 'Its appeal lay in') belongs to lie; present/infinitive 'lay'
#     ('turtles lay eggs', 'lay the foundations', 'lay her hands on') to lay. spaCy tags both 'lay' VBD sometimes, so per token:
#     VBD 'lay' -> lie, unless the previous word makes it a base form (to / modal / do / and even ...) or an object of 'lay' follows
#     (a pronoun, or a typical object noun within the next two words).
LAY_BASE_PREV = {'to', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'do', 'does', 'did', "n't", 'not', 'even', 'never', 'often'}
LAY_OBJECT_NEXT = {'them', 'it', 'their', 'our', 'his', 'her', 'its', 'my', 'your', 'eggs', 'down', 'out', 'off', 'aside'}
LAY_OBJECT_NOUN = {'foundation', 'foundations', 'groundwork', 'egg', 'eggs', 'claim', 'hand', 'hands', 'track', 'tracks', 'pipe', 'pipes', 'brick',
                   'bricks', 'cable', 'cables', 'carpet', 'blame', 'plan', 'plans', 'basis', 'trap', 'traps', 'siege', 'emphasis'}

# W8b 'as opposed to' is a fixed contrast phrase, not the verb oppose / adjective opposed: its 'opposed' token becomes the phrase
#     'as opposed to', which is reserved with the connectives (connectives_reserved.csv), like 'on the other hand' (V4).
AS_OPPOSED_TO = 'as opposed to'

# W8c display spelling of the percent card: the card id stays 'percent' (V3), the display form is the spelling used by most body tokens
#     ('per cent' in these British exam texts); the other spelling becomes the alias.
PERCENT_DISPLAY_BY_MAJORITY = True

# W8d V16 participle display threshold raised 0.66 -> 0.75: a verb card shows its -ed/-ing form only when that form is >= 75% of the
#     tokens (locate: located 28 of 38 = 0.74 -> displayed 'locate', as the re-audit asked; the verb 'locate' = find also occurs).
DISPLAY_SHARE_PARTICIPLE_V4 = 0.75

# W8e ton vs tonne: 'ton(s)' is no longer merged into 'tonne' (different units; the re-audit flagged tonne examples using 'tons').
#     Exception: 'metric ton(s)' IS a tonne. Other 'ton(s)' tokens form their own lemma 'ton' (a card only if it passes 10 x 3).
TON_FORMS = {'ton', 'tons'}
TON_METRIC_PREV = {'metric'}

# W9  USER DECISION 1 (2026-11-03): the month May is KEPT as the 23rd exception to filter C (final rule 8). The V13 date-context rule
#     still decides which 'May' tokens are the month; zipf_headword('may') = 5.98 is the modal's frequency, so without this exception
#     filter C removes the card. Implemented in build_v4.KEEP_C (22 exceptions + 'may').
FILTER_C_EXTRA_EXCEPTIONS = {'may': 'W9 user decision 1 (2026-11-03): month May kept as the 23rd filter-C exception'}
# User decisions 2-4 are applied by NOT changing rules: V6 number words (incl. thousand/million/billion) stay removed; final rule 7 keeps
# chart/graph/overview and the other 9 words; body-only counting (V-rules of v3) stays, with General Training reading texts counted as body.

# W8h place-name parts (re-audit issues 'wales' / 'latin'): 'Wales' in 'New South Wales' and 'Latin' in 'Latin America(n)' are parts of
#     a place name, not the country Wales / the language Latin; those tokens are dropped like other proper-noun tokens.
PLACE_NAME_PARTS = {('wales', 'prev2', ('new', 'south')): 'W8h "New South Wales" (Australian state) is not Wales',
                    ('latin', 'next', ('america', 'american', 'americans', 'americas')): 'W8h "Latin America(n)" is a place name, not the language Latin',
                    ('mexico', 'prev', ('new',)): 'W10b "New Mexico" (US state) is not the country Mexico'}   # W10b (v4.1, 11-04 re-audit mexico 5485)
# W8i independent-sense forms (re-audit issues 'plain', 'stable', 'indoor'; 11-01 optional 'rich'): own lemma, like the LEX_PLURAL words
#     (savings, goods ...). plains = flat land (not the adjective plain), stables = buildings for horses (not the adjective stable),
#     riches = wealth, indoors = adverb (a separate dictionary headword from the adjective indoor). Each is a card only if it passes 10 x 3.
INDEPENDENT_FORMS = {'plains': ('NOUN', 'PROPN'), 'stables': ('NOUN', 'PROPN'), 'riches': ('NOUN', 'PROPN'), 'indoors': None}
# W8j note text of restored proper-noun-filter cards: 'N of M body tokens were tagged as proper nouns' (re-audit 'french': the v3 note
#     '5 capitalised tokens' read as if the card had 5 tokens).
