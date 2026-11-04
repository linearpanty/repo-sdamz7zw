#!/usr/bin/env python3
"""ClawWords v3 Stage 1 (2026-11-01): clean + segment clawwords.md, line by line, keeping source line numbers.
Built on v2 01v2_clean_segment.py (same page/state machine), with the omarchy audit (2026-11-01) fixes:
  A. body-only labelling: every line gets a region; is_body=1 only for reading-passage text and listening tapescripts.
     Reading question blocks (stems, options, TRUE/FALSE/NOT GIVEN statements, summary/notes completions, heading lists),
     the listening question paper, writing/speaking prompts, model/sample answers and examiner comments are is_body=0.
  B. section location: test numbers inferred from listening-start events (test papers) and from section-number resets /
     TEST headings (tapescripts); lost PART/SECTION 3/4 headings in tapescripts recovered from Q-marker order.
     Book 12 keeps its printed numbering Test 5-8.
  C. OCR normalisation at the corpus layer (text_clean only; clawwords.md itself is never modified):
     'Al' -> 'AI' (when AI/artificial intelligence is used nearby), watermark fragments (C. COM / OC. COM / 034. COM),
     stray question numbers (033, 'Q24', '- Q24', trailing 'Example' marker), kil/kils -> kiln/kilns, 'Ljust' -> 'I just'.
Outputs: section_index.csv (one row per clawwords.md line), lines_v3.jsonl (non-empty classified lines for tokenising),
         segment_stats.json

2026-11-03 revision (candidate-2026-11-01-v3, this directory). Changes vs the 11-01 input copy (orig_v3_scripts/01_segment_v3.py):
  R1. INSTR/W_KEEP/W_RUBRIC are exec'd from ./v2_instr.py (regenerated from v2 01v2_clean_segment.py L72-104 by make_v2_instr.py)
      instead of the missing copy in the system temp directory; default SRC points at the read-only v3-inputs copy of clawwords.md.
  R2. OCR: 'Al's' (possessive) -> "AI's" inside AI passages (the name guard used to block it); trailing 'Example' marker also after a
      capital letter ('how can I Example'); '1' read for 'a' inside a word ('1uthor', 'monogr1phs', 'd1ms') -> 'a' when the result is a
      known word; a year glued to a word ('in1993') is split; 't' read for 'f' in an unknown word that becomes a common word with one
      t -> f ('intormation', 'tirst', 'sottware'; skipped when a vowel swap also gives a word: 'tolk'); 'Id like' -> "I'd like";
      mid-sentence capital 'If'/'In' after a lowercase word ('that If the', 'growth In adventure') -> lowercase.
  R3. Lines that consist only of tapescript Q markers ('Q30', 'Q23/24', '025/26') get region 'q_marker' (they used to fall through to
      'watermark' because the inline-Q fix emptied them first). Non-body either way; affects region statistics only.
  R4. Reading passage numbers: gap-numbers inside completion questions ('offer his 8 ..', 'has 21 ....') are added as DP anchors
      (weight 1). Without them, tests whose passage-1/2 questions are all gap-fill (14 T2, 15 T3, 15 T4) had passage text labelled with
      the next passage's number.
  R5. Listening question papers: part numbers follow 'Questions a-b' headers (part = (a-1)//10+1, monotone within a test) when the
      'PART n' heading was lost (books 20, 21). Question-paper lines are non-body, so this changes section_index only, not counts.
  R7. Tapescript part boundaries: page-end Q-marker columns no longer outvote a PART/SECTION heading on the same page (post-pass 1).
  R8. Reading question blocks whose 'Questions a-b' header was lost: a column of bare question numbers opening a page, or >= 3 lines led
      by consecutive question numbers, opens a question block (TRUE/FALSE/NOT GIVEN lists in 15 T3 / 15 T4 were labelled passage).
  R9. Figure/table captions ('Fig. 2 ...') get region 'caption' (non-body).
  R6. Body-region set is unchanged: is_body = region in {passage, tapescript}. Writing/speaking model answers stay excluded, exactly as
      in the 10-31 final (EXCLUDED_SRC = writing_sample, speaking_model).

2026-11-03 v4 revision (candidate-2026-11-03-v4, this file = copy of v3 01_segment_v3.py + the re-audit fixes below; rule ids W1..W8):
  W1a Tapescript citations: a 'Test n' line is a REAL test heading only when the next content line is a SECTION/PART 1 heading; every
      other 'Test n' line is a printed running page header (top or bottom of a page) and is no longer a DP anchor, so it can never
      override the nearest real TEST/SECTION/PART heading (book 8 L30236-30279 = T2 Section 1, not T1 S4; book 12 L56830-56835 =
      end of T6 Section 4, not T7). Region of such lines: 'running_header' (non-body, as before).
  W1b R7 extended: page-end Q markers of an earlier test (Q38-40 printed after 'TEST 2 / SECTION 1' on the same page) are moved before
      the TEST heading, like R7 already did for markers of an earlier part.
  W1c General Training: the running page header 'General Training: Reading and Writing' no longer resets the GT test letter (GT-A/GT-B
      -> 'GT') nor flips a Writing page back to Reading; 'You should spend about 20 minutes on this task' (a Writing rubric) no longer
      flips Writing -> Reading. Effect: GT Writing Task 1 prompts are no longer counted as reading-passage body text.
  W2  Rubric lines inside body regions are non-body: GT 'Read the text below and answer Questions 9-14.' (13 lines, books 5-10) and
      the same kind found by a scan ('... answer Questions n', '... on your answer sheet'); the GT running header (region
      running_header); narrator turns inside tapescripts that the line-start NARRATOR rule missed ('Part two, you will hear ...',
      'Narrator/Instructor: ...', '... look at questions 11 to 16. Now listen carefully and answer questions 11 to 16.' + the wrapped
      lines between them) and the transcription note 'Here is the transcript of the conversation ...' (book 20).
  W3  Speaker labels are stripped inside tapescript lines, not only at the line start in CAPITALS: 'Speaker 1 (Woman):',
      'Narrator/Instructor:', title-case name/role labels of the book ('Rosie:', 'House Owner:', 'Student 1:', 'Lecturer:') at the
      line start or after a sentence end, and known CAPITAL labels ('MAN:', 'JOHN:') after a sentence end. A line that is only a label
      becomes region speaker_label.
  W4  OCR'd closing quotes at a sentence end are normalised: '.?' '.!' -> '.', '?.' -> '?', '!.' -> '!' (not after abbreviations
      such as 'p.m.?').
  W8f OCR g read for q: a non-word whose g->q variant is attested within 300 lines ('ganat' -> 'qanat', book 16).
  W8g Footnote / glossary asterisks glued to words ('cartographers*', 'Master**', '*** MSC') are removed from text_clean.
  W8k OCR '1' for the pronoun I before a verb ('Yeah, 1 suppose so', 'if 1 can help') and 'II' / ' ll' for 'll after a pronoun
      ('you II maintain', 'that ll be') are repaired.
  The dictionary for W8f is the vendored vendor/words.txt via wordlist_v4.py (W7); no system path is read.
"""
import re, json, csv, collections, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wordfreq import zipf_frequency
from wordlist_v4 import is_word

SRC = sys.argv[1] if len(sys.argv) > 1 else '../v3-inputs/v2src/clawwords.md'
RAW = open(SRC, encoding='utf-8').read().split('\n')
if RAW and RAW[-1] == '': RAW.pop()
NL = len(RAW)

# ---------- page split (with line numbers, 1-based) ----------
pages = []; book = page = None
line_meta = {}   # lineno -> dict for non-page lines (markup)
for i, l in enumerate(RAW, 1):
    m = re.match(r'^## (ClawWords-(\d+)) - Page (\d+)', l)
    if m:
        book, page = m.group(2), int(m.group(3)); pages.append([book, page, []])
        line_meta[i] = dict(book=book, page=page, region='markup'); continue
    if re.match(r'^#\s', l) or re.match(r'^##\s', l) or l.strip() == '---':
        line_meta[i] = dict(book=book, page=page, region='markup'); continue
    if pages: pages[-1][2].append((i, l))
    else: line_meta[i] = dict(book=None, page=None, region='front_matter' if l.strip() else 'blank')

I = re.I
def rx(*ps, flags=I): return [re.compile(p, flags) for p in ps]
def any_m(rs, s): return any(r.search(s) for r in rs)
# --- cue regexes: identical to v2 ---
CUE_L = rx(r'^\s*listening\s*$', r'^\s*(section|part)\s*[1-4]\b.*questions?', r'^\s*test\s*\d+\s*listening\b', r'listen to|you will hear')
CUE_R = rx(r'^\s*reading\s*$', r'^\s*reading passage\s*[1-3]\s*$', r'^\s*general training reading\b', r'you should spend about 20 minutes',
           r'^\s*test\s*\d+\s*reading\b', r'reading passage \d (below|on (the following )?pages?)', r'^\s*passage\s*[1-3]\s*(below|on)\b',
           r'which are based on reading', r'spend about 20 minutes on questions')
CUE_W = rx(r'^\s*writing\s*$', r'^\s*writing task\s*[12]\s*$', r'you should spend about 40 minutes', r'write at least (150|250) words',
           r'^\s*general training writing\b', r'^\s*test\s*\d+\s*writing\b')
CUE_S = rx(r'^\s*speaking\s*$', r'^\s*test\s*\d+\s*speaking\b', r'^\s*you should say\s*:?\s*$', r'^\s*discussion topics\s*:?\s*$', r'examiner (asks|will ask)')
CUE_S_AFTER_W = rx(r'^\s*part\s*[123]\s*$')
CUE_Q = rx(r'^\s*questions?\s*\d+\s*[-–]\s*\d+', r'^\s*complete the (notes|form|table|sentences|flow-?chart) below', r'^\s*(section|part)\s*1\b.*questions?', r'^\s*listening\s*$')   # v3: bare 'PART 1' (Speaking Part 1) no longer flips Speaking -> Listening
BACK_AUDIO = rx(r'^\s*(audio ?scripts?|tapescripts?|transcripts?)\s*$')
INLINE_BOOKS = {'20'}
CUE_INLINE_KEY = rx(r'^\s*answers?\s*:?\s*$')
BACK_KEY = rx(r'^\s*(listening and reading )?answer keys?\b', r'^\s*answer key with extra explanations')
BACK_SAMPLE = rx(r'^\s*model and sample answers', r'^\s*sample answers? for writing', r'^\s*sample answer\s*$',
                 r'this is an answer written by a candidate', r'^\s*model answer\b', r"^\s*here is the examiner'?s comment", r'^\s*examiner comment')
BACK_EXCL = rx(r'^\s*sample answer sheets?\s*$', r'^\s*(photo |text )?acknowledge?ments?\b.{0,40}$', r'do not write (below|in) this', r'resource bank', r'^\s*\d{13}\s*$')
START = rx(r'^\s*(section|part)\s*1\b.*questions?\s*1\s*[-–]', r'^\s*questions?\s*1\s*[-–]\s*\d+\s*$', r'^\s*complete the (notes|form|table) below')
SPEAKER = re.compile(r"^\s*([A-Z][A-Z'\-]+(?: [A-Z][A-Z'\-]+)?)\s*[:.;]\s*")
SPEAKER_ONLY = re.compile(r"^\s*([A-Z][A-Z'\-]+(?: [A-Z][A-Z'\-]+)?)\s*[:.;]\s*$")
SECTION_WORDS = {'LISTENING','READING','WRITING','SPEAKING','PART','SECTION','TEST','NOTES','EXAMPLE','ANSWER','TASK','QUESTIONS','NB','NOTE'}
exec(open('v2_instr.py').read())   # R1: INSTR / W_KEEP / W_RUBRIC lists copied verbatim from v2 (01v2_clean_segment.py L72-104) by make_v2_instr.py
TESTNO = re.compile(r'^\s*test\s*\.?\s*([1-8lI])\b', I)   # W1d: also OCR 'TEST. 2'
PARTNO = re.compile(r'^\s*(?:section|part|reading passage|passage|writing task|task)\s*([1-4])\b', I)
WATERMARK = rx(r'h\s*t\s*t\s*p\s*:', r'//\s*st\.', r'huj\s*i\s*ang', r'uxue', r'@mirsielts', r'^\s*\S{0,4}\s*\.?\s*com\s*$')
COPYRIGHT = rx(r'©|\(c\)\s*(cambridge|ucles)', r'\bcopyright\b', r'\bisbn\b', r'cambridge (university press|assessment|english)', r'\bucles\b',
               r'reproduced (with|by)', r'photocopiable', r'www\.|https?://|\.com\b|\.org\b', r'all rights reserved', r'this reprint',
               r'\bprinted in\b', r'\bpublished by\b', r'\bpermission\b.*\b(reproduc|cambridge)')
TITLE = rx(r'clawwords', r'^\s*(cambridge\s*)?ielts\s*\d*\b.{0,30}$', r'^\s*(official|authentic) (cambridge )?(preparation|practice|examination papers)\b',
           r'^\s*with answers\s*$', r'^\s*(academic|general training)\s*\d*\s*$', r'^\s*(audioscripts?|tapescripts?|transcripts?)\s*$')
OPTION_ONLY = re.compile(r'^\s*([A-K]|i{1,3}|iv|vi{0,3}|ix|x{1,2}i{0,3})(\s*[\.\)]?\s+([A-K]|i{1,3}|iv|vi{0,3}|ix|x))*\s*[\.\)]?\s*$')
PAGENUM = re.compile(r'^\s*\d{1,3}\s*$')
GAP = re.compile(r'(_{2,}|\.{2,}|…+|-{3,})')
LEAD_QNUM = re.compile(r'^\s*\d{1,2}\s*[\.\)]?\s+(?=\S)')
LEAD_OPT = re.compile(r'^\s*([B-HJK])\s*[\.\)]?\s+(?=[A-Za-z])')
# v3 additions
HEADING = rx(r'^\s*(section|part)\s*[1-4]\b', r'^\s*test\s*[1-8lI]\b', r'^\s*(listening|reading|writing|speaking)\b.{0,25}$', r'^\s*reading passage\s*[1-3]\b',
             r'^\s*writing task\s*[12]\b', r'^\s*questions?\s*\d+(\s*(-|–|and|to)\s*\d+)?\.?\s*$', r'^\s*q\s*\d{1,2}\s*$')
QMARK_LINE = re.compile(r'^\s*Q\s?(\d{1,2})(?:\s*[/&,\-–]\s*Q?(\d{1,2}))*\s*$')
QMARK_INLINE = re.compile(r'\bQ\s?(\d{1,2})(?:\s*[/&,\-–]\s*Q?\d{1,2})*\b')
PASSAGE_START = rx(r'^\s*reading passage\s*[1-3]\b', r'^\s*passage\s*[1-3]\s*(below|on)\b', r'reading passage \d (below|on (the following )?pages?)', r'which are based on reading', r'you should spend about 20 minutes', r'^\s*passage\s*[1-3]\s*$', r'^\s*section\s*[1-3]\s*$')
SPEND_PASSAGE = re.compile(r'based on reading\s*passage\s*([1-3])', I)
QRANGE = re.compile(r'^\s*questions?\s*(\d{1,2})\s*(?:[-–]|and|to)?\s*(\d{1,2})?', I)
GT_START = re.compile(r'^\s*general training\s*:?\s*reading', I)
GT_HEAD = re.compile(r'^\s*general\s*training\s*:?\s*re\w{2,5}\s+\w{2,4}\s+wr\w{3,5}\b', I)   # W1c: incl. OCR 'Reuding und Writing'
# W2: exam rubric that sits inside body regions (GT reading: 'Read the text below and answer Questions 9-14.')
RUBRIC_IN_BODY = rx(r'^\s*read the (?:\w+\s){0,3}?(?:text|texts|information|passage|article|advertisements?|extracts?|notices?|leaflet|timetable|details)\b.{0,40}\b(?:below|on the following pages?|opposite)\b',
                    r'\banswer questions?\s*\d', r'\bin boxes\b.{0,40}\banswer she', r'\bon your answer shee[lt]\b')
# W2: narrator / rubric turns inside tapescripts (anywhere in the line; the v2/v3 NARRATOR rule only looked at the line start)
NARR_IN = rx(r'\b(?:answer|look at) questions?\s*\d', r'\bfirst,? you have some time\b', r'\byou now have (?:some|half a minute|a (?:few|minute)|\w+ seconds?)\b',
             r'\bbefore you hear the (?:rest|next|talk|conversation|lecture)\b', r'^\s*(?:part|section) (?:one|two|three|four|[1-4])\b,? you will hear\b',
             r'^\s*narrator\b', r'\bthat is the end of (?:part|section|the listening)\b', r'\bnow listen carefully and answer\b')
HEADING_ONLY = re.compile(r'^\s*(?:test|section|part|reading passage)\s*\.?\s*(?:[1-8]|[IVl]{1,3})\s*\.?\s*$', I)
TRANSCRIPT_NOTE = rx(r'^\s*here is the transcript\b', r'\bbased on the provided sources\s*:?\s*$')
W1_LOG = collections.Counter(); W2_LOG = collections.Counter(); W2_EX = collections.defaultdict(list)
GT_TEST = re.compile(r'^\s*test\s*([AB])\s*$', I)
RUNNING_HEAD = re.compile(r'^\s*(test\s*[1-8lI]|reading|listening|writing|speaking|general training)\s*(test\s*[1-8AB])?\s*$', I)
GAPQ = re.compile(r'\b([1-9]|[1-3]\d|40)\s*(\.{2,}|_{2,}|…)|(\.{2,}|_{2,}|…)\s*([1-9]|[1-3]\d|40)?\s*\.?\s*$|^\s*(\.{2,}|_{2,}|…)')
QSTEM = rx(r'\bthe (writer|author)(\'s)? (says|suggests?|mentions?|believes?|argues?|claims?|states?|describes?|refers?|explains?|thinks?|concludes?|implies|uses?|compares?|gives?|points? out|makes?|wants?|is (suggesting|arguing|referring)|views?|opinion|main purpose|purpose)\b',
             r'\baccording to the (writer|author|text|passage|article|information)\b', r'^\s*(in|from) the (first|second|third|fourth|fifth|sixth|seventh|eighth|last|final|opening|closing) (paragraph|section)\b',
             r'\b(paragraph|section)s? [A-I]\b(?!\.)', r'\breading passage\b', r'\banswer sheet\b', r'\bboxes? \d', r'\b(list of|correct) headings?\b', r'\bcorrect (letter|answer|heading|number)\b',
             r'\b(has|have|contains?) (four|five|six|seven|eight|nine|ten) (paragraphs|sections)\b', r'\bNOT GIVEN\b', r'\b(which|what) (paragraph|section)\b', r'\bthe (passage|text) (says|states|suggests|mentions)\b', flags=0)
SPEND_CONT = re.compile(r'^\s*(on\s+)?(reading\s+)?passage\s*[1-3]\b\s*(below|on the following pages?|on pages? [\d\s and-]+)?\s*\.?\s*$', I)
LSTART = rx(r'^\s*(section|part)\s*1\b', r'^\s*questions?\s*1\s*[-–]\s*\d+', r'^\s*listening\s*$', r'^\s*test\s*\d+\s*listening\b')
NARRATOR = rx(r'^\s*(you will hear|you now have|that is the end of|now turn to|before you hear|first,? you have some time|now listen carefully)')
QNUM_LED = re.compile(r'^\s*\d{1,2}\s*[\.\)]?\s+\S')
OPT_LED = re.compile(r'^\s*([A-K]|i{1,3}|iv|vi{0,3}|ix|x)\s*[\.\)]?\s+\S')
GAPNUM = re.compile(r'(_{2,}|\.{2,}|…)|(?<![\d,.])\b([1-9]|[1-3]\d|40)\b(?![\d,.%])')

def garbage(s):
    toks = re.findall(r"[A-Za-z][A-Za-z'\-]*", s)
    letters = sum(c.isascii() and c.isalpha() for c in s)
    if letters == 0: return True
    if sum(c.isalpha() and not c.isascii() for c in s) > letters * 0.3: return True
    nonspace = sum(not c.isspace() for c in s)
    if nonspace and letters / nonspace < 0.5 and len(toks) < 3: return True
    if len(toks) >= 3:
        known = sum(1 for t in toks if zipf_frequency(t.lower(), 'en') >= 1.5 and (len(t) > 1 or t.lower() in ('a','i')))
        if known / len(toks) < 0.5: return True
    return False

# ---------- v4 pre-passes ----------
line_book = {n: bk for bk, _, pls in pages for n, _ in pls}
# W3: speaker-label inventory per book. Title-case labels ('Rosie:', 'House Owner:', 'Student 1:') that open >= 3 lines of the book, plus
#     role words that are labels whenever they open a tapescript line; CAPITAL labels ('MAN:', 'JOHN:') that open >= 2 lines of the book.
ROLE_LABELS = set('''Speaker Narrator Instructor Lecturer Interviewer Presenter Tutor Student Teacher Professor Receptionist Guide Manager Woman Man
Girl Boy Customer Assistant Officer Announcer Librarian Host Caller Agent Clerk Doctor Nurse Director Adviser Advisor Counsellor Supervisor'''.split())
TITLE_LABEL = re.compile(r"^\s*([A-Z][a-z'’]+(?: [A-Z][a-z'’]+)?(?: \d)?)\s*:\s")
CAPS_LABEL = re.compile(r"^\s*([A-Z][A-Z'\-]+(?: [A-Z][A-Z'\-]+)?)\s*[:;]")
_tl = collections.Counter(); _cl = collections.Counter()
for n, l in enumerate(RAW, 1):
    bk = line_book.get(n)
    if not bk: continue
    m = TITLE_LABEL.match(l)
    if m: _tl[(bk, m.group(1))] += 1
    m = CAPS_LABEL.match(l)
    if m: _cl[(bk, m.group(1))] += 1
NOT_LABEL = {'General Training', 'Note', 'Notes', 'Example', 'Answer', 'Questions', 'Question', 'Name', 'Address', 'Date', 'Time', 'Tel', 'Email',
             'Price', 'Cost', 'Total', 'Section', 'Part', 'Test', 'Task', 'Source', 'Hint', 'Yes', 'No'}
BOOK_LABELS = collections.defaultdict(set); BOOK_CAPS = collections.defaultdict(set)
for (bk, lab), c in _tl.items():
    if lab in NOT_LABEL: continue
    if c >= 3 or lab.split()[0] in ROLE_LABELS: BOOK_LABELS[bk].add(lab)
for (bk, lab), c in _cl.items():
    if c >= 2 and lab not in SECTION_WORDS and len(lab) >= 2: BOOK_CAPS[bk].add(lab)
SPEAKER_N = re.compile(r"\b(?:Speaker\s*\d+\s*(?:\([^)]{1,30}\))?|Narrator(?:\s*/\s*Instructor)?)\s*:\s*")
ROLE_LABEL = re.compile(r"^\s*(?:[A-Z][a-z]+\s+(?:and\s+|of\s+)?){0,4}(?:" + '|'.join(sorted(ROLE_LABELS)) + r")(?:\s*\d)?\s*:\s*")
LABEL_LOG = collections.Counter(); LABEL_EX = collections.defaultdict(list)
def strip_labels(t, bk, n):
    """W3: remove speaker labels anywhere in a tapescript line. Returns the stripped text."""
    t0 = t
    t = SPEAKER_N.sub('', t)
    t = ROLE_LABEL.sub('', t)                                  # 'Design and Technology Lecturer: ...' (multi-word role label at the line start)
    labs = sorted(BOOK_LABELS.get(bk, ()), key=len, reverse=True)
    if labs:
        alt = '|'.join(re.escape(x) for x in labs)
        t = re.sub(rf"(?:^|(?<=[.?!…'’\"]\s)|(?<=[.?!…]))\s*(?:{alt})\s*:\s*", lambda m: ' ' if m.start() else '', t)
    caps = sorted(BOOK_CAPS.get(bk, ()), key=len, reverse=True)
    if caps:
        alt = '|'.join(re.escape(x) for x in caps)
        t = re.sub(rf"(?<=[.?!…,'’\"])\s+(?:{alt})\s*[:;]\s*", ' ', t)
    t = re.sub(r'\s{2,}', ' ', t).strip() if t != t0 else t
    if t != t0:
        LABEL_LOG['lines_with_label_stripped'] += 1
        if len(LABEL_EX[bk]) < 6: LABEL_EX[bk].append(f'L{n}: {t0[:80]}  =>  {t[:80]}')
    return t
# W8f: words containing 'q' per line, for the g->q OCR check ('ganat' -> 'qanat' when 'qanat' is printed nearby)
Q_WORDS = collections.defaultdict(list)
for n, l in enumerate(RAW, 1):
    for w in re.findall(r'[A-Za-z]*q[A-Za-z]*', l.lower()): Q_WORDS[w].append(n)

# ---------- OCR normalisation (corpus layer) ----------
AI_CONTEXT = re.compile(r'\bAI\b|artificial intelligence', I)
ai_lines = [i for i, l in enumerate(RAW, 1) if AI_CONTEXT.search(l)]
import bisect
def ai_nearby(n, w=400):
    k = bisect.bisect_left(ai_lines, n - w); return k < len(ai_lines) and ai_lines[k] <= n + w
OCR_LOG = collections.Counter(); OCR_EX = collections.defaultdict(list)
def ocr_fix(s, n, state):
    fixes = []
    def sub(name, pat, rep, s, flags=0):
        new, k = re.subn(pat, rep, s, flags=flags)
        if k:
            fixes.append(name); OCR_LOG[name] += k
            if len(OCR_EX[name]) < 8: OCR_EX[name].append(f'L{n}: {s.strip()[:90]}  =>  {new.strip()[:90]}')
        return new
    # watermark fragments glued to text: '... 034. COM', '... OC. COM', '... C.COM', '... TELTS COM', '... 022 COm'
    s = sub('watermark_COM', r'\s*(?:\bQ\d{1,2}\s+)?(?:\b(?:[A-Z]{1,3}|\d{2,3})\s*\.?\s*)?\bC[Oo][Mm]\b\s*$', '', s)
    s = sub('watermark_COM', r'\s*\b(?:TELTS|IELTS)\s+COM\b', '', s)
    s = sub('watermark_com_lower', r'\s+(?:0\d\d\s+)?c\.?\s?com\s*$', '', s, flags=I)
    # stray question numbers 0dd at line end / before watermark (033, 034 ...)
    s = sub('stray_qnum_0dd', r'(?<=[A-Za-z,.;:\'")])\s+0\d\d\s*$', '', s)
    s = sub('stray_qnum_0dd', r'(?<=[a-z,])\s+0\d\d\b(?=\s+[a-z])', '', s)
    # Q markers inside lines (tapescripts): 'Ireland, Q31', '- Q24', 'Q23/24'
    if state in ('L_SCRIPT',):
        s = sub('inline_Q_marker', r'\s*[-–]?\s*\bQ\s?\d{1,2}(?:\s*[/&,\-–]\s*Q?\d{1,2})*\b', '', s)
        s = sub('trailing_Example_marker', r'(?<=[A-Za-z,.?])\s+Example\s*$', '', s)   # R2: also after a capital ('how can I Example')
    # 'Al' -> 'AI' when the text around uses AI / artificial intelligence (not 'Al-' names, not 'Al Gore'-type names)
    if 'Al' in s and ai_nearby(n):
        s = sub('Al_to_AI', r'\bAl\b(?=[\'’]s\b)', 'AI', s)                          # R2: possessive Al's -> AI's
        s = sub('Al_to_AI', r'\bAl\b(?![-\'’]\w)(?!\s+(?:Gore|Capone|Jolson|Pacino)\b)', 'AI', s)
    s = sub('kiln', r'\bkil(s?)\b', r'kiln\1', s)
    # R2: digit '1' read for the letter 'a' inside a word ('1uthor', 'monogr1phs', 'd1ms'); only when the repaired word is known
    def _one(m):
        w = m.group(0); c = w.replace('1', 'a')
        return c if zipf_frequency(c.lower(), 'en') >= 2.5 and zipf_frequency(w.lower(), 'en') == 0 else w
    s2 = re.sub(r'\b[A-Za-z]*[A-Za-z]1[A-Za-z]*\b|\b1[a-z]{3,}\b', _one, s)
    if s2 != s:
        fixes.append('digit1_to_a'); OCR_LOG['digit1_to_a'] += 1
        if len(OCR_EX['digit1_to_a']) < 8: OCR_EX['digit1_to_a'].append(f'L{n}: {s.strip()[:90]}  =>  {s2.strip()[:90]}')
        s = s2
    s = sub('glued_year', r'\b(in|of|by|since|until|from)(1[5-9]\d\d|20\d\d)\b', r'\1 \2', s)   # R2: 'in1993' -> 'in 1993'
    # R2: 't' read for 'f' ('trom', 'sottware', 'Calitornian'): an unknown word that becomes a common word with one t -> f
    def _tf(m):
        w = m.group(0)
        if zipf_frequency(w.lower(), 'en') >= 1.5: return w
        for k, ch in enumerate(w.lower()):                                # ambiguous misread (tolk: talk/folk) -> leave it
            if any(zipf_frequency(w.lower()[:k] + v + w.lower()[k+1:], 'en') >= 3.5 for v in 'aeiou' if v != ch): return w
        for k, ch in enumerate(w):
            if ch == 't':
                c = w[:k] + 'f' + w[k+1:]
                if zipf_frequency(c.lower(), 'en') >= 3.5: return c
        return w
    s2 = re.sub(r'\b[A-Za-z]*t[A-Za-z]*\b', _tf, s)
    if s2 != s:
        fixes.append('t_for_f'); OCR_LOG['t_for_f'] += 1
        if len(OCR_EX['t_for_f']) < 8: OCR_EX['t_for_f'].append(f'L{n}: {s.strip()[:90]}  =>  {s2.strip()[:90]}')
        s = s2
    s = sub('Id_to_Id', r"\bId(?= (?:like|love|prefer|rather|better|need|have|be|go|say|think|want)\b)", "I'd", s)          # R2: 'Id like' -> "I'd like"
    s = sub('midsentence_If_In', r'(?<=[a-z,] )(If|In)(?= [a-z])', lambda m: m.group(1).lower(), s)                    # R2: 'that If the', 'growth In adventure'
    # 'Ljust', 'Lonly', 'Lalso' -> 'I just' ... (OCR read the pronoun I as L glued to the next word)
    def _L(m):
        w = m.group(1)
        if zipf_frequency(w, 'en') >= 4.5 and zipf_frequency('l' + w, 'en') < 2.0: return 'I ' + w
        return m.group(0)
    s2 = re.sub(r'\bL([a-z]{2,})\b', _L, s)
    if s2 != s:
        fixes.append('L_to_I'); OCR_LOG['L_to_I'] += 1
        if len(OCR_EX['L_to_I']) < 8: OCR_EX['L_to_I'].append(f'L{n}: {s.strip()[:90]}  =>  {s2.strip()[:90]}')
        s = s2
    # W4: OCR'd closing quote at a sentence end ('lock.?'', 'culture.!', 'protozoa?.') -> one end mark; abbreviations ('p.m.?') untouched
    def _punct(m):
        before = s_cur[:m.start()]
        w = re.search(r'(\S+)$', before); w = w.group(1) if w else ''
        if '.' in w or w.lower().strip('(\'"') in ABBR: return m.group(0)
        a = m.group(1) or m.group(3)
        return '.' if a == '.' else a
    s_cur = s
    s2 = re.sub(r'(?<=[A-Za-z0-9)\'"’])(?<!\.)(\.)([?!])(?![.?!])|(?<=[A-Za-z0-9)\'"’])([?!])(\.)(?![.?!])', _punct, s)
    if s2 != s:
        fixes.append('end_punct_quote'); OCR_LOG['end_punct_quote'] += 1
        if len(OCR_EX['end_punct_quote']) < 12: OCR_EX['end_punct_quote'].append(f'L{n}: {s.strip()[:90]}  =>  {s2.strip()[:90]}')
        s = s2
    # W8f: 'g' read for 'q' in a non-word whose q-variant is printed within 300 lines ('ganat' -> 'qanat')
    def _gq(m):
        w = m.group(0); lw = w.lower()
        if is_word(lw) or zipf_frequency(lw, 'en') > 0: return w
        for k, ch in enumerate(lw):
            if ch != 'g': continue
            c = lw[:k] + 'q' + lw[k+1:]
            if any(abs(x - n) <= 300 for x in Q_WORDS.get(c, ()) or Q_WORDS.get(c[:-1] if c.endswith('s') else c, ())): return w[:k] + ('Q' if w[k].isupper() else 'q') + w[k+1:]
        return w
    s2 = re.sub(r'\b[A-Za-z]*g[A-Za-z]*\b', _gq, s)
    if s2 != s:
        fixes.append('g_for_q'); OCR_LOG['g_for_q'] += 1
        if len(OCR_EX['g_for_q']) < 8: OCR_EX['g_for_q'].append(f'L{n}: {s.strip()[:90]}  =>  {s2.strip()[:90]}')
        s = s2
    # W8g: footnote / glossary asterisks ('cartographers*', 'Master**', '*** MSC: ...', '*Mayan')
    s2 = re.sub(r'(?<=[A-Za-z.,;:)\'’"”])\*+', '', s)
    s2 = re.sub(r'(?:(?<=\s)|^)\*+\s*(?=\S)', '', s2)
    if s2 != s:
        fixes.append('asterisk'); OCR_LOG['asterisk'] += 1
        if len(OCR_EX['asterisk']) < 8: OCR_EX['asterisk'].append(f'L{n}: {s.strip()[:90]}  =>  {s2.strip()[:90]}')
        s = s2
    # W8k: OCR digit '1' for the pronoun I ('Yeah, 1 suppose so', 'if 1 can help') and 'II' / ' ll' for 'll ('you II maintain', 'you ll never')
    s = sub('digit1_for_I', (r"(^|" if state == 'L_SCRIPT' else r"(") + r"[.?!,;:'\"]\s+|\b(?:and|but|so|because|if|when|that|what|think|said|says|see)\s+)1(\s+(?:suppose|guess|think|mean|am|have|had|was|would|will|can|could|don't|didn't|can't|wouldn't|know|want|need|hope|believe|just|really|also|must|should|might)\b)",
            r'\1I\2', s)
    s = sub('digit1_for_I', r"(?<=\b[a-z]{2})(\s+)1(\s+(?:suppose|guess|think|mean|reckon|believe|hope|know)\b)|(?<=\b[a-z]{3})(\s+)1(\s+(?:suppose|guess|think|mean|reckon|believe|hope|know)\b)",
            lambda m: (m.group(1) or m.group(3)) + 'I' + (m.group(2) or m.group(4)), s)    # 'now 1 guess', 'well 1 think': a cognition verb never follows a numeral
    s = sub('II_for_ll', r"\b(you|we|they|I|he|she|it|that|there|who|You|We|They|He|She|It|That|There|Who)\s+(?:II|ll)\b", r"\1'll", s)
    return s, fixes
ABBR = {'etc', 'al', 'dr', 'mr', 'mrs', 'ms', 'st', 'lab', 'approx', 'no', 'vs', 'jr', 'sr', 'inc', 'ltd', 'co', 'fig', 'eg', 'ie'}

def keylike(page_lines):
    ne = [x.strip() for _, x in page_lines if x.strip()]
    if len(ne) < 8: return False
    short = sum(1 for x in ne if len(x.split()) <= 3)
    return short / len(ne) >= 0.6

def is_speaker_only(s):
    m = SPEAKER_ONLY.match(s); return bool(m) and m.group(1) not in SECTION_WORDS

def prose_line(s):
    w = s.split()
    return len(w) >= 5 and not QNUM_LED.match(s) and not OPT_LED.match(s) and not GAP.search(s) and not any_m(INSTR, s) \
        and not re.search(r'(?<![\d,.£$])\b([1-9]|[1-3]\d|40)\b\s*$', s)

def page_is_prose(pls):
    ne = [x.strip() for _, x in pls if x.strip() and not PAGENUM.match(x) and not any_m(TITLE, x) and not TESTNO.match(x.strip())
          and not re.match(r'^\s*(reading|test \d+)\s*$', x, I)]
    if len(ne) < 8: return False
    if any(any_m(INSTR, x) for x in ne[:6]): return False
    q = sum(1 for x in ne if QNUM_LED.match(x) or GAP.search(x))
    pl = sum(1 for x in ne if len(x.split()) >= 4)
    return q <= 2 and pl / len(ne) >= 0.7

# ---------- state machine ----------
stats = collections.Counter(); rows = {}; EVENTS = []; fix_log_seg = collections.Counter()
cur_book = None
for book, pg, pls in pages:
    if book != cur_book:
        cur_book = book; phase = 'front'; state = 'FRONT'; test_no = 0; part_no = 0; last_sec = None
        qblock = False; explicit_since = 0; left_L = True; last_nonL = 'FRONT'; gt = False; last_qnum = 0; last_r_q = False
    labs = collections.Counter(SPEAKER.match(x).group(1) for _, x in pls if SPEAKER.match(x) and SPEAKER.match(x).group(1) not in SECTION_WORDS)
    speakers = sum(labs.values()) if (labs and max(labs.values()) >= 2) else 0
    ne_ = [x for _, x in pls if x.strip()]
    prose = len(ne_) >= 12 and sum(1 for x in ne_ if len(x.split()) >= 10) / len(ne_) >= 0.6
    kl = keylike(pls)
    if phase == 'test' and speakers >= 3: phase = 'back'; state = 'L_SCRIPT'
    if phase == 'back' and state not in ('EXCL',):
        if speakers >= 3: state = 'L_SCRIPT'
        elif kl and state in ('KEY', 'L_SCRIPT', 'W_SAMPLE', 'U'): state = 'KEY'
        elif state == 'KEY' and not kl: state = 'U'
    if phase == 'test' and state == 'L' and prose and speakers == 0: state = 'R'
    if phase == 'front': explicit_since = 0
    if phase == 'test' and state == 'R' and page_is_prose(pls): qblock = False      # v3: a prose page restarts passage text
    opt_A_next = [bool(re.match(r'^\s*B\s', pls[j+1][1])) if j + 1 < len(pls) else False for j in range(len(pls))]
    # lookahead for mid-page passage resumption inside a question block: runs of >= 8 prose lines
    prose_run_start = set()
    run = []
    for j, (n, raw) in enumerate(pls + [(None, '')]):
        s = raw.strip()
        if s and prose_line(s): run.append(j); continue
        if not s and n is not None: continue
        if len(run) >= 8: prose_run_start.add(run[0])
        run = []
    # R8: question-number evidence the 'Questions a-b' header lost in OCR cannot hide:
    #   (a) the page opens with a column of >= 2 ascending bare question numbers (1-40) before any text ('2 / 4 / 5 / 7' then statements,
    #       15 T3 L71341-71354): the page is a question page - start a question block there and ignore prose-run restarts on it;
    #   (b) a run of >= 3 lines led by consecutive question numbers ('15 Silbo is ...', '16 In the ...', '17 ...'): question block, plus the
    #       un-numbered line just before it when that line follows a bare number (L72012 '14' / L72013).
    ne_idx = [j for j, (_, x) in enumerate(pls) if x.strip()]
    qcol = []
    for j in ne_idx:
        s = pls[j][1].strip()
        if re.fullmatch(r'\d{1,2}', s) and 1 <= int(s) <= 40 and (not qcol or int(s) > int(pls[qcol[-1]][1].strip())): qcol.append(j); continue
        break
    qcol_page = len(qcol) >= 2
    qrun = set(); k = 0
    while k < len(ne_idx):
        m0 = re.match(r'^\s*(\d{1,2})\s+[A-Za-z]', pls[ne_idx[k]][1])
        if not m0: k += 1; continue
        seq = [ne_idx[k]]; last = int(m0.group(1)); kk = k + 1
        while kk < len(ne_idx):
            x = pls[ne_idx[kk]][1]; m1 = re.match(r'^\s*(\d{1,2})\s+[A-Za-z]', x)
            if m1 and int(m1.group(1)) == last + 1: seq.append(ne_idx[kk]); last += 1; kk += 1; continue
            if not m1 and re.match(r'^\s*[a-z]', x) and len(x.split()) <= 8: seq.append(ne_idx[kk]); kk += 1; continue   # wrapped item ('standards', 'existence today.')
            break
        if sum(1 for j in seq if re.match(r'^\s*\d{1,2}\s+[A-Za-z]', pls[j][1])) >= 3:
            qrun |= set(seq)
            p = ne_idx.index(seq[0])
            if p >= 2 and re.fullmatch(r'\d{1,2}', pls[ne_idx[p - 2]][1].strip()) and not re.match(r'^\s*\d', pls[ne_idx[p - 1]][1]): qrun.add(ne_idx[p - 1])
        k = kk
    if qcol_page: prose_run_start = {j for j in prose_run_start if j < qcol[0]}
    # R9: figure/table captions ('Fig. 2 Subjects were asked ...') and their wrapped continuation lines are not passage text
    caption = set(); cap_on = False
    for j in ne_idx:
        s = pls[j][1].strip()
        if re.match(r'^(fig\.?|figure|table|diagram|graph|chart)\s*\d+\b', s, I): cap_on = True; caption.add(j)
        elif cap_on and len(caption) < 6: caption.add(j)
        else: cap_on = False
        if cap_on and re.search(r'[.!?]["\')]?$', s): cap_on = False
    for j, (n, raw) in enumerate(pls):
        s = raw.strip()
        R_ = dict(book=book, page=pg)
        if not s: R_['region'] = 'blank'; rows[n] = R_; continue
        prev_state = state; gt_running_head = False; gt_heading = False
        if phase == 'front' and any_m(START, s):
            phase = 'test'; state = 'L'; test_no = 0
        if phase in ('test', 'back'):
            inline = book in INLINE_BOOKS and phase == 'test'
            if any_m(BACK_KEY, s) and not inline: phase = 'back'; state = 'KEY'
            elif any_m(BACK_EXCL, s) and phase == 'back' and not (state == 'KEY' and re.search('resource bank', s, I)): state = 'EXCL'
            elif inline and any_m(CUE_INLINE_KEY, s): state = 'S_MODEL' if state in ('S', 'S_MODEL') else 'KEY'
            elif inline and any_m(BACK_SAMPLE, s): state = 'W_SAMPLE'
            elif any_m(BACK_AUDIO, s): phase = 'back'; state = 'L_SCRIPT'
            elif any_m(BACK_KEY, s): phase = 'back'; state = 'KEY'
            elif any_m(BACK_SAMPLE, s): phase = 'back'; state = 'W_SAMPLE'
            elif phase == 'back' and re.search(r'^\s*sample answer sheets?\s*$|^\s*(photo |text )?acknowledge?ments?\b.{0,40}$', s, I): state = 'EXCL'
            elif phase == 'test' and (GT_START.search(s) or GT_HEAD.match(s)):
                mgt = re.search(r'\btest\s*([AB])\b', s, I)
                if not gt: state = 'R'; test_no = 'GT'; gt_heading = True   # first GT heading of the book (a heading, not passage text)
                elif mgt: state = 'R'                                     # 'General Training Reading and Writing Test B' (book 9): a test start
                else: gt_running_head = True; W1_LOG['gt_running_header_lines'] += 1   # W1c: printed page header - no state/test change
                if mgt: test_no = 'GT-' + mgt.group(1).upper()
                gt = True
            elif phase == 'test' and gt:
                mg = GT_TEST.match(s)
                if mg: test_no = 'GT-' + mg.group(1).upper()
                if any_m(CUE_W, s): state = 'W'
                elif (any_m(CUE_R, s) and not (state == 'W' and re.search(r'this task', s, I))) or re.match(r'^\s*section\s*1\b', s, I): state = 'R'   # W1c
            elif phase == 'test':
                if state in ('S', 'S_MODEL') and any_m(CUE_Q, s): state = 'L'
                elif any_m(CUE_S, s) or (state == 'W' and any_m(CUE_S_AFTER_W, s)): state = 'S'
                elif any_m(CUE_W, s): state = 'W'
                elif any_m(CUE_R, s) and not (state == 'W' and re.search(r'this task', s, I)): state = 'R'
                elif any_m(CUE_L, s) and state not in ('S', 'S_MODEL'): state = 'L'   # v3: 'listen to' in a Speaking prompt no longer flips to Listening
        # ---- test number (test papers): explicit headings + listening-start events ----
        mt = TESTNO.match(s)
        if mt:
            tn = int(mt.group(1).replace('l', '1').replace('I', '1'))
            if phase in ('test', 'front') and not gt: explicit_since = tn
            else: test_no = tn
        if phase == 'test':
            # listening-start event: entering Listening Section/Part 1 after Speaking/Writing (or at the start of the papers)
            if state == 'L' and left_L and last_nonL in ('FRONT', 'S', 'S_MODEL', 'W', 'W_SAMPLE') and not gt:
                test_no = explicit_since if explicit_since and explicit_since > test_no else test_no + 1
                left_L = False; explicit_since = 0; part_no = 0; last_qnum = 0; EVENTS.append((book, n, test_no, last_nonL, s[:50]))
            if state not in ('L',):
                left_L = True; last_nonL = state
        mp = PARTNO.match(s)
        if mp: part_no = int(mp.group(1))
        ms = SPEND_PASSAGE.search(s)
        if ms and state == 'R': part_no = int(ms.group(1))
        cur_sec = {'L': 'L', 'L_SCRIPT': 'L', 'R': 'R', 'W': 'W', 'W_SAMPLE': 'W', 'S': 'S', 'S_MODEL': 'S', 'U': 'U'}.get(state)
        if cur_sec != last_sec and not mp and not ms: part_no = 0 if cur_sec != 'R' else part_no
        if cur_sec == 'R' and last_sec != 'R' and not mp and not ms: part_no = 0
        last_sec = cur_sec
        # reading: question-block tracking
        if state == 'R' and phase == 'test':
            if any_m(PASSAGE_START, s) or j in prose_run_start: qblock = False
            if j in qrun or (qcol_page and j == qcol[0]):                                      # R8
                if not qblock: fix_log_seg['question_block_from_qnumber_evidence'] += 1
                qblock = True
        else:
            qblock = False
        R_.update(state=state, phase=phase, test=test_no, part=part_no, sec=cur_sec)
        rows[n] = R_
        # ---- region ----
        if state == 'FRONT': R_['region'] = 'front_matter'; continue
        if gt_running_head: R_['region'] = 'running_header'; continue                       # W1c
        if gt_heading: R_['region'] = 'heading'; continue                                    # W1c: 'General Training: Reading and Writing' section title
        if state == 'EXCL': R_['region'] = 'back_matter'; continue
        if state == 'KEY': R_['region'] = 'answer_key'; continue
        if PAGENUM.match(s): R_['region'] = 'page_number'; continue
        if state == 'L_SCRIPT' and (QMARK_LINE.match(s) or re.match(r'^\s*0[1-4]\d\s*/\s*\d{1,2}\s*$', s) or re.match(r'^\s*Q[Il]\d\s*$', s)):   # R3: 'Q30', 'Q23/24', OCR '025/26'; W1d: OCR 'QI5'
            R_['region'] = 'q_marker'; OCR_LOG['q_marker_line'] += 1; continue
        s_fixed, fixes = ocr_fix(s, n, state)
        if not s_fixed.strip(): R_['region'] = 'watermark'; continue
        if any_m(WATERMARK, s_fixed): R_['region'] = 'watermark'; continue
        if any_m(COPYRIGHT, s_fixed): R_['region'] = 'copyright'; continue
        if any_m(TITLE, s_fixed): R_['region'] = 'title'; continue
        if is_speaker_only(s_fixed): R_['region'] = 'speaker_label'; continue
        if OPTION_ONLY.match(s_fixed): R_['region'] = 'option_letters'; continue
        if QMARK_LINE.match(s_fixed): R_['region'] = 'q_marker'; R_['qmark'] = int(QMARK_LINE.match(s_fixed).group(1)); continue
        if SPEND_CONT.match(s_fixed): R_['region'] = 'instruction'; continue   # 'Passage 2 on the following pages.' (wrapped rubric line)
        w_keep = state == 'W' and any_m(W_KEEP, s_fixed)
        if any_m(INSTR, s_fixed) and not w_keep:
            R_['region'] = 'heading' if any_m(HEADING, s_fixed) else 'instruction'
            if state == 'R' and phase == 'test' and not any_m(PASSAGE_START, s_fixed) and not RUNNING_HEAD.match(s_fixed): qblock = True   # running page headers ('Test 4', 'Reading') do not open a question block
            if state in ('L', 'R', 'W', 'S') and phase == 'test': R_['text'] = GAP.sub(' ', s_fixed); R_['sub'] = 'instruction'
            continue
        if state in ('R', 'L_SCRIPT') and HEADING_ONLY.match(s_fixed):                       # W1d: 'Test l', 'TEST. 2' alone on a line
            R_['region'] = 'heading'; W1_LOG['heading_only_line_not_body'] += 1; continue
        if state == 'R' and phase == 'test' and any_m(RUBRIC_IN_BODY, s_fixed):          # W2: rubric line inside the reading text
            R_['region'] = 'instruction'; R_['text'] = GAP.sub(' ', s_fixed); R_['sub'] = 'instruction'; R_['w2'] = 1
            W2_LOG['rubric_line_in_reading'] += 1
            if len(W2_EX['rubric']) < 30: W2_EX['rubric'].append(f'L{n}: {s_fixed[:90]}')
            continue
        if state == 'R' and phase == 'test' and QRANGE.match(s_fixed) and not any_m(PASSAGE_START, s_fixed): qblock = True
        if state == 'R' and phase == 'test' and GAPQ.search(s_fixed): qblock = True
        if state == 'R' and phase == 'test' and any_m(QSTEM, s_fixed): qblock = True   # v3: question stems / rubric fragments whose header was lost   # v3: a numbered gap ('9 ..', '___') is completion-question material even when the 'Questions n-m' header was lost in OCR
        lead_q = bool(QNUM_LED.match(s_fixed)); lead_o = bool(LEAD_OPT.match(s_fixed)) or (re.match(r'^\s*A\s+', s_fixed) and opt_A_next[j])
        t = GAP.sub(' ', s_fixed)
        t = re.sub(r'[•·●■□○◦▪►\[\]\|]', ' ', t)
        t = SPEAKER.sub(lambda m: '' if m.group(1) not in SECTION_WORDS else m.group(0), t)
        if state == 'L_SCRIPT':
            narr_in = any_m(NARR_IN, t) or any_m(TRANSCRIPT_NOTE, t)                   # W2 (checked before the labels are stripped)
            t = strip_labels(t, book, n)                                               # W3
            if not t.strip(): R_['region'] = 'speaker_label'; continue
        t = LEAD_QNUM.sub('', t); t = LEAD_OPT.sub('', t)
        if re.match(r'^\s*A\s+', t) and opt_A_next[j]: t = re.sub(r'^\s*A\s+', '', t)
        t = re.sub(r'\b\d{1,2}\s*(?=$)', '', t).strip()
        if not t: R_['region'] = 'page_number'; continue
        if garbage(t): R_['region'] = 'ocr_garbage'; continue
        R_['text'] = t; R_['ocr_fixes'] = '|'.join(fixes)
        if state == 'L_SCRIPT':
            R_['region'] = 'narrator' if any_m(NARRATOR, t) else 'tapescript'; R_['sub'] = 'tapescript'
            if R_['region'] == 'tapescript' and narr_in:                              # W2
                R_['region'] = 'narrator' if not any_m(TRANSCRIPT_NOTE, t) else 'transcript_note'; W2_LOG[R_['region'] + '_line_in_tapescript'] += 1
                if len(W2_EX['narrator']) < 30: W2_EX['narrator'].append(f'L{n}: {t[:90]}')
        elif state == 'L': R_['region'] = 'listening_question'; R_['sub'] = 'question'
        elif state == 'R':
            # v3: inside a question block every line is question material; outside it, number-led lines are passage text
            # (narrow-column passages often start a line with a number, e.g. '40 million cells per cubic centimetre')
            if j in caption and phase == 'test': R_['region'] = 'caption'; R_['sub'] = 'caption'; fix_log_seg['caption_lines'] += 1   # R9
            elif qblock: R_['region'] = 'reading_question'; R_['sub'] = 'question'
            else: R_['region'] = 'passage'; R_['sub'] = 'passage'
        elif state == 'W':
            R_['region'] = 'writing_rubric' if any_m(W_RUBRIC, s) else 'writing_prompt'; R_['sub'] = 'prompt'
        elif state == 'S': R_['region'] = 'speaking_prompt'; R_['sub'] = 'prompt'
        elif state == 'W_SAMPLE': R_['region'] = 'writing_model_answer'; R_['sub'] = 'excluded_sample'
        elif state == 'S_MODEL': R_['region'] = 'speaking_model_answer'; R_['sub'] = 'excluded_sample'
        else: R_['region'] = 'other'; R_['sub'] = 'other'

# ---------- post-pass 0 (W2): a wrapped tapescript line between two narrator lines of the same page is narrator text ----------
_ts = [n for n in sorted(rows) if rows[n].get('state') == 'L_SCRIPT' and rows[n].get('region') not in ('blank',)]
for a, b, c in zip(_ts, _ts[1:], _ts[2:]):
    if rows[b]['region'] == 'tapescript' and rows[a]['region'] == 'narrator' and rows[c]['region'] == 'narrator' and rows[a]['page'] == rows[c]['page'] \
            and not re.search(r'[.!?]\s*$', rows[a].get('text', '')):
        rows[b]['region'] = 'narrator'; W2_LOG['narrator_continuation_line'] += 1
        if len(W2_EX['narrator']) < 40: W2_EX['narrator'].append(f'L{b} (continuation): {rows[b].get("text", "")[:90]}')

# ---------- post-pass 1: tapescripts - recover test / part from headings + Q markers ----------
def script_runs():
    by_book = collections.defaultdict(list)
    for n in sorted(rows):
        r = rows[n]
        if r.get('state') == 'L_SCRIPT': by_book[r['book']].append(n)
    return by_book
SEC_HEAD = re.compile(r'^\s*(?:section|part)\s*([1-4])\b', I)
TEST_HEAD = re.compile(r'^\s*test\s*\.?\s*([1-8lI])\b', I)   # W1d: also OCR 'TEST. 2'
fix_log = collections.Counter(); fix_ex = collections.defaultdict(list)
W1_LOG_EX = []
SEC1_HEAD = re.compile(r'^\s*(?:section|part)\s*[1Il]\b', I)
NONCONTENT = {'blank', 'markup', 'watermark', 'copyright', 'title', 'page_number', 'q_marker', 'ocr_garbage', 'running_header'}
def real_test_heading(n):
    """W1a: a 'TEST n' line starts a test when it is printed in capitals ('TEST 2', the tapescript heading style; the printed running
    page header is title case 'Test 2') or when the next content line (or the rest of the same line) is a SECTION/PART 1 heading."""
    s = RAW[n-1].strip()
    if re.match(r'^\s*TEST\b', s): return True
    if SEC1_HEAD.match(re.sub(r'^\s*test\s*\.?\s*[1-8lI]\b\s*:?\s*', '', s, flags=I)): return True
    k = n + 1
    while k <= NL and k - n <= 6:
        r = rows.get(k) or line_meta.get(k) or {}
        if r.get('region') in NONCONTENT or not RAW[k-1].strip(): k += 1; continue
        return bool(SEC1_HEAD.match(RAW[k-1].strip()))
    return False
FIRST_TEST = {'12': 5}          # Cambridge IELTS 12 prints its tests as Test 5-8
W_TEST, W_HEAD, W_Q = 3.0, 2.0, 1.0
for bk, ns in script_runs().items():
    t0 = FIRST_TEST.get(bk, 1)
    slots = [(t, p) for t in range(t0, t0 + 4) for p in range(1, 5)]
    anchors = []   # (line, kind, value)
    for n in ns:
        s = RAW[n-1].strip()
        if TEST_HEAD.match(s) and len(s) < 40:
            tv = int(TEST_HEAD.match(s).group(1).replace('l', '1').replace('I', '1'))
            if real_test_heading(n):
                anchors.append((n, 'test', tv)); W1_LOG['tapescript_real_test_headings'] += 1
            else:                                                     # W1a: printed running page header - never an anchor
                W1_LOG['tapescript_running_headers_ignored'] += 1
                if rows[n].get('region') in ('heading', 'instruction', 'title', 'other', 'tapescript', 'narrator'): rows[n]['region'] = 'running_header'
                if len(W1_LOG_EX) < 400: W1_LOG_EX.append((bk, n, s))
                continue
        if SEC_HEAD.match(s) and len(s) < 40: anchors.append((n, 'head', int(SEC_HEAD.match(s).group(1))))
        for m in re.finditer(r'\bQ\s?(\d{1,2})\b', s):
            q = int(m.group(1))
            if 1 <= q <= 40: anchors.append((n, 'q', (q - 1) // 10 + 1))
    if not anchors: continue
    # R7: Q markers are a margin column that OCR emits at the END of each page. On a page that also carries a 'PART/SECTION n' heading,
    # markers numbered for an earlier part belong above that heading; move them to just before it so they cannot outvote it
    # (book 18 T1: 'PART 4' at L90068 was overruled by the page-end markers Q26-Q30 and the whole lecture stayed Part 3).
    # Only markers in the trailing block (no tapescript text after them on the page) are moved: when OCR keeps markers inline in text
    # order and puts the heading at the top of the page instead (book 09 T4 L37408-37409 Q19/Q20), the markers are right, not the heading.
    heads_on_page = collections.defaultdict(list); last_text = collections.defaultdict(int); tests_on_page = collections.defaultdict(list)
    for n, kind, v in anchors:
        if kind == 'head': heads_on_page[rows[n]['page']].append((n, v))
        if kind == 'test': tests_on_page[rows[n]['page']].append(n)
    for n in ns:
        if rows[n].get('region') == 'tapescript': last_text[rows[n]['page']] = max(last_text[rows[n]['page']], n)
    moved = []
    for n, kind, v in anchors:
        pos = n
        if kind == 'q' and n > last_text[rows[n]['page']]:
            for hn, hv in heads_on_page.get(rows[n]['page'], []):
                if hn < n and v < hv: pos = hn - 0.5; fix_log['page_end_q_markers_moved_before_heading'] += 1; break
            # W1b: markers of a later part than any heading on the page, on a page where a new test starts ('TEST 2 / SECTION 1' then
            # page-end Q38-Q40 of the previous test's lecture) belong before that TEST heading
            if pos == n and v > 1 and not any(hv == v and hn < n for hn, hv in heads_on_page.get(rows[n]['page'], [])):
                for tl in tests_on_page.get(rows[n]['page'], []):
                    if tl < n: pos = tl - 0.5; fix_log['W1b_page_end_q_markers_moved_before_test_heading'] += 1; break
        moved.append((pos, n, kind, v))
    moved.sort(); anchors = [(n, kind, v) for _, n, kind, v in moved]
    # monotone alignment of anchors to the 16 ordered (test, section) slots, minimising weighted disagreement (DP)
    INF = 1e18; K = len(slots); A = len(anchors)
    def cost(a, k):
        n, kind, v = a; t, p = slots[k]
        if kind == 'test': return 0 if v == t else W_TEST
        return 0 if v == p else (W_HEAD if kind == 'head' else W_Q)
    dp = [[INF] * K for _ in range(A)]; bp = [[0] * K for _ in range(A)]
    for k in range(K): dp[0][k] = cost(anchors[0], k) + 0.001 * k
    for i in range(1, A):
        best, arg = INF, 0
        for k in range(K):
            if dp[i-1][k] < best: best, arg = dp[i-1][k], k
            dp[i][k] = best + cost(anchors[i], k) + (0.01 if arg != k else 0); bp[i][k] = arg
    k = min(range(K), key=lambda k: dp[A-1][k]); path = [0] * A
    for i in range(A - 1, -1, -1): path[i] = k; k = bp[i][k]
    disagree = sum(1 for i in range(A) if cost(anchors[i], path[i]) > 0)
    fix_log['anchor_disagreements_overruled'] += disagree
    # boundaries
    changes = [(ns[0], path[0])]
    for i in range(1, A):
        if path[i] == path[i-1]: continue
        n, kind, v = anchors[i]; lo = min(anchors[i-1][0], n - 1)
        if kind in ('head', 'test'): b = n
        else:
            cand = [m for m in range(lo + 1, n + 1) if RAW[m-1].startswith('## ClawWords-')]
            b = cand[0] if cand else lo + 1
            t, p = slots[path[i]]
            fix_log['section_boundary_from_Q_markers(heading lost)'] += 1
            if len(fix_ex['lost_heading']) < 40: fix_ex['lost_heading'].append(f'book{bk} L{b}: -> T{t} Section/Part {p} (first anchor Q-marker L{n})')
        changes.append((b, path[i]))
    changes.sort(); ci = 0; cur = changes[0][1]
    for n in ns:
        while ci < len(changes) and changes[ci][0] <= n: cur = changes[ci][1]; ci += 1
        t, p = slots[cur]; r = rows[n]
        if (r['test'], r['part']) != (t, p): fix_log['script_relabelled_lines'] += 1
        r['test'], r['part'] = t, p

# ---------- post-pass 1b: reading passage numbers (academic tests) from question-number anchors ----------
# passage text is always followed (or, for heading-matching, preceded) by its own questions, so each reading line takes
# the passage number of the next anchor; anchors = 'READING PASSAGE n' / 'based on Reading Passage n' (weight 3),
# 'Questions a-b' headers (2), numbered question lines (1); a monotone DP over passages 1..3 overrules OCR-misread numbers.
def q2p(q): return 1 if q <= 13 else 2 if q <= 26 else 3 if q >= 28 else None
rd = collections.defaultdict(list)
for n in sorted(rows):
    r = rows[n]
    if r.get('state') == 'R' and r.get('phase') == 'test' and isinstance(r.get('test'), int): rd[(r['book'], r['test'])].append(n)
for key, ns in rd.items():
    anchors = []
    for n in ns:
        s = RAW[n-1].strip(); r = rows[n]
        m = re.match(r'^\s*reading passage\s*([1-3])\b', s, I) or SPEND_PASSAGE.search(s)
        if m: anchors.append((n, int(m.group(1)), 3.0)); continue
        m = QRANGE.match(s)
        if m and r['region'] in ('heading', 'instruction'):
            for g in (m.group(1), m.group(2)):
                if g and q2p(int(g)): anchors.append((n, q2p(int(g)), 2.0))
            continue
        if r['region'] == 'reading_question':
            m = re.match(r'^\s*(\d{1,2})\b', s)
            if m and 1 <= int(m.group(1)) <= 40 and q2p(int(m.group(1))): anchors.append((n, q2p(int(m.group(1))), 1.0)); continue
            # R4: gap-number of a completion question ('offer his 8 ..', 'has 21 ....', '.. by governments and lack of public 29')
            m = re.search(r'(?<![\d,.£$])\b([1-9]|[1-3]\d|40)\s*(?:\.{2,}|_{2,}|…)', s) or re.search(r'(?:\.{2,}|_{2,}|…)\s*([1-9]|[1-3]\d|40)\s*\.?\s*$', s) \
                or re.search(r'(?<![\d,.£$])\b([1-3]\d|40)\s*$', s)
            if m and q2p(int(m.group(1))): anchors.append((n, q2p(int(m.group(1))), 1.0)); fix_log['reading_gapnum_anchors'] += 1
    if not anchors: continue
    A = len(anchors); INF = 1e18
    dp = [[INF] * 4 for _ in range(A)]; bp = [[0] * 4 for _ in range(A)]
    for k in (1, 2, 3): dp[0][k] = (0 if anchors[0][1] == k else anchors[0][2]) + 0.001 * k
    for i in range(1, A):
        for k in (1, 2, 3):
            j = min((jj for jj in (1, 2, 3) if jj <= k), key=lambda jj: dp[i-1][jj])
            dp[i][k] = dp[i-1][j] + (0 if anchors[i][1] == k else anchors[i][2]); bp[i][k] = j
    k = min((1, 2, 3), key=lambda k: dp[A-1][k]); path = [0] * A
    for i in range(A - 1, -1, -1): path[i] = k; k = bp[i][k]
    fix_log['reading_anchor_disagreements_overruled'] += sum(1 for i in range(A) if anchors[i][1] != path[i])
    ai = 0
    for n in ns:
        while ai < A - 1 and anchors[ai][0] < n: ai += 1
        p = path[ai] if anchors[ai][0] >= n else path[-1]
        if rows[n]['part'] != p: fix_log['reading_lines_relabelled'] += 1
        rows[n]['part'] = p

# ---------- post-pass 1c (R5): listening question papers - part from 'Questions a-b' headers when 'PART n' was lost ----------
lq = collections.defaultdict(list)
for n in sorted(rows):
    r = rows[n]
    if r.get('state') == 'L' and r.get('phase') == 'test' and r.get('sec') == 'L': lq[(r['book'], r['test'])].append(n)
for key, ns in lq.items():
    cur = 0
    for n in ns:
        s = RAW[n-1].strip(); r = rows[n]
        m = re.match(r'^\s*(?:(?:section|part)\s*[1-4]?\s*)?questions?\s*(\d{1,2})\s*(?:[-–]|and|to)', s, I)
        mp = re.match(r'^\s*(?:section|part)\s*([1-4])\b', s, I)
        if mp: cur = max(cur, int(mp.group(1)))
        if m and 1 <= int(m.group(1)) <= 40: cur = max(cur, (int(m.group(1)) - 1) // 10 + 1)
        if cur and r['part'] != cur and cur > (r['part'] or 0):
            fix_log['listening_qpaper_lines_relabelled'] += 1
            if len(fix_ex['listening_qpaper']) < 20 and m: fix_ex['listening_qpaper'].append(f"book{r['book']} T{r['test']} L{n}: part {r['part']} -> {cur} ({s[:40]})")
            r['part'] = cur

# ---------- post-pass 2: units, is_body, assemble ----------
SECNAME = {'L': 'listening', 'R': 'reading', 'W': 'writing', 'S': 'speaking', 'U': 'other', None: ''}
BODY = {'passage', 'tapescript'}
out_rows = []; jl = []
for n in range(1, NL + 1):
    r = rows.get(n) or line_meta.get(n) or dict(book=None, page=None, region='blank')
    reg = r['region']; sec = r.get('sec')
    is_body = int(reg in BODY)
    unit = f"{r['book']}-T{r.get('test', 0)}-{sec}{r.get('part', 0)}" if sec else ''
    out_rows.append(dict(line=n, book=int(r['book']) if r['book'] else '', page=r.get('page') or '', test=r.get('test', '') if sec else '',
                         section=SECNAME.get(sec, ''), part=r.get('part', '') if sec else '', region=reg, is_body=is_body,
                         unit=unit, ocr_fixed=int(bool(r.get('ocr_fixes'))), ocr_fixes=r.get('ocr_fixes', ''), text_clean=r.get('text', '')))
    if r.get('text') and r.get('sub'):
        jl.append(dict(line=n, book=int(r['book']), page=r['page'], sec=sec, sub=r['sub'], region=reg, is_body=is_body, unit=unit,
                       test=r.get('test'), part=r.get('part'), text=r['text']))
    stats['region:' + reg] += 1
with open('section_index.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(out_rows[0].keys())); w.writeheader(); w.writerows(out_rows)
with open('lines_v4.jsonl', 'w') as f:
    for o in jl: f.write(json.dumps(o, ensure_ascii=False) + '\n')
summary = dict(listening_start_events=EVENTS, lines=NL, rows=len(out_rows), regions={k[7:]: v for k, v in sorted(stats.items())}, ocr_fixes=dict(OCR_LOG), ocr_examples=OCR_EX,
               script_fixes=dict(fix_log), script_fix_examples=fix_ex, segmentation_fixes=dict(fix_log_seg),
               v4_W1=dict(W1_LOG), v4_W1_running_headers=[f'book{b} L{n}: {t}' for b, n, t in W1_LOG_EX], v4_W2=dict(W2_LOG), v4_W2_examples=W2_EX,
               v4_W3=dict(LABEL_LOG), v4_W3_examples=LABEL_EX, v4_W3_label_inventory={b: sorted(BOOK_LABELS[b] | BOOK_CAPS[b]) for b in sorted(set(BOOK_LABELS) | set(BOOK_CAPS))},
               body_lines=sum(o['is_body'] for o in out_rows))
json.dump(summary, open('segment_stats.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: summary[k] for k in ('lines', 'rows', 'regions', 'ocr_fixes', 'script_fixes', 'segmentation_fixes', 'body_lines', 'v4_W1', 'v4_W2', 'v4_W3')}, indent=1))
