#!/usr/bin/env python3
"""W1 verification: independent heading walk over clawwords.md, compared with the (test, part) labels of a section_index.csv.
For every BODY line (is_body=1) the label is compared with the nearest preceding REAL heading of its stream:
  - tapescripts (section listening): test from the last 'TEST n' line whose next content line is 'SECTION/PART 1' (a test start),
    part from the last 'SECTION/PART n' heading;
  - academic reading: part from the last 'READING PASSAGE n' heading of the same book/test;
  - GT reading: test letter from the last 'Test A/B' heading, part from the last 'SECTION n' heading.
A disagreement span is classed 'page_header_beats_heading' when a printed running header ('Test n' that is not a test start, or the GT
'General Training: Reading and Writing' header) lies between that real heading and the line and the label agrees with the header, i.e.
the page header overrode the real heading. Other disagreements (typically a heading lost in OCR, resolved from Q markers / question
numbers by the DP) are listed for information. Usage: check_citations_v4.py SECTION_INDEX CLAWWORDS_MD OUT_PREFIX"""
import csv, re, sys, json, collections
SI_PATH, MD, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SI = list(csv.DictReader(open(SI_PATH, encoding='utf-8')))
RAW = open(MD, encoding='utf-8').read().split('\n')
I = re.I
TEST = re.compile(r'^\s*test\s*\.?\s*([1-8lI])\s*$', I)
SEC = re.compile(r'^\s*(?:section|part)\s*([1-4Il])\b', I)
RP = re.compile(r'^\s*reading passage\s*([1-3])\b', I)
GTT = re.compile(r'^\s*test\s*([AB])\s*$', I)
GTH = re.compile(r'^\s*general\s*training\s*:?\s*re\w{2,5}\s+\w{2,4}\s+wr\w{3,5}\b', I)
num = lambda x: int(str(x).replace('l', '1').replace('I', '1'))
def next_content(i):
    k = i + 1
    while k < len(RAW) and (not RAW[k].strip() or RAW[k].startswith('## ') or re.fullmatch(r'\s*\d{1,3}\s*', RAW[k]) or re.search(r'h\s*t\s*t\s*p|\.com', RAW[k], I)): k += 1
    return RAW[k].strip() if k < len(RAW) else ''
out = []; stats = collections.Counter()
state = {}
for r in SI:
    i = int(r['line']) - 1; s = RAW[i].strip(); b = r['book']
    st = state.setdefault(b, dict(test=None, part=None, rp=None, gtt=None, gts=None, header=None, gthead=False))
    m = TEST.match(s)
    if m:
        nc = next_content(i)
        if s.startswith('TEST') or (SEC.match(nc) and num(SEC.match(nc).group(1)) == 1): st.update(test=num(m.group(1)), part=None, header=None, test_line=i)
        else: st['header'] = num(m.group(1))
    m = SEC.match(s)
    if m and len(s) < 40:
        p = num(m.group(1))
        if r['section'] == 'listening' and p == 1 and st['part'] and st['part'] >= 2 and st['test'] is not None and i - st.get('test_line', -99) > 3:
            st['test'] += 1; st['header'] = None                       # TEST heading lost in OCR: a new PART/SECTION 1 starts the next test
        st['part'] = p; st['gts'] = p
    if r['section'] == 'reading' and str(r['test']).isdigit() and st.get('rd_test') != r['test']: st['rp'] = None; st['rd_test'] = r['test']
    m = RP.match(s)
    if m: st['rp'] = int(m.group(1))
    m = GTT.match(s)
    if m: st['gtt'] = 'GT-' + m.group(1).upper(); st['gthead'] = False
    if GTH.match(s): st['gthead'] = True
    if r['is_body'] != '1': continue
    lab_t, lab_p = r['test'], r['part']
    if r['section'] == 'listening':
        exp = (str(st['test']), str(st['part']))
        if st['test'] is None or st['part'] is None: continue
        stats['tapescript_lines_checked'] += 1
        if (lab_t, lab_p) != exp:
            kind = 'page_header_beats_heading' if st['header'] is not None and str(st['header']) == lab_t and lab_t != exp[0] else 'other'
            out.append(dict(line=r['line'], book=b, stream='tapescript', label=f'T{lab_t} P{lab_p}', heading_implies=f'T{exp[0]} P{exp[1]}', kind=kind, text=s[:70]))
    elif r['section'] == 'reading' and str(lab_t).isdigit() and st['rp']:
        stats['academic_reading_lines_checked'] += 1
        if lab_p != str(st['rp']):
            out.append(dict(line=r['line'], book=b, stream='reading', label=f'T{lab_t} P{lab_p}', heading_implies=f'P{st["rp"]}', kind='other', text=s[:70]))
    elif r['section'] == 'reading' and str(lab_t).startswith('GT') and st['gtt']:
        stats['gt_reading_lines_checked'] += 1
        if lab_t != st['gtt'] or (st['gts'] and lab_p != str(st['gts'])):
            kind = 'page_header_beats_heading' if st['gthead'] and lab_t != st['gtt'] else 'other'
            out.append(dict(line=r['line'], book=b, stream='gt_reading', label=f'{lab_t} P{lab_p}', heading_implies=f'{st["gtt"]} P{st["gts"]}', kind=kind, text=s[:70]))
# spans
spans = []
for o in out:
    if spans and spans[-1]['book'] == o['book'] and spans[-1]['stream'] == o['stream'] and spans[-1]['label'] == o['label'] and spans[-1]['heading_implies'] == o['heading_implies'] \
            and spans[-1]['kind'] == o['kind'] and int(o['line']) - spans[-1]['line_to'] <= 40:
        spans[-1]['line_to'] = int(o['line']); spans[-1]['body_lines'] += 1; continue
    spans.append(dict(book=o['book'], stream=o['stream'], line_from=int(o['line']), line_to=int(o['line']), body_lines=1, label=o['label'],
                      heading_implies=o['heading_implies'], kind=o['kind'], first_text=o['text']))
with open(OUT + '.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=list(spans[0].keys()) if spans else ['book']); w.writeheader(); w.writerows(spans)
summ = dict(stats); summ['disagreement_spans'] = collections.Counter(s['kind'] for s in spans)
summ['disagreement_body_lines'] = collections.Counter()
for s in spans: summ['disagreement_body_lines'][s['kind']] += s['body_lines']
json.dump(summ, open(OUT + '.json', 'w'), indent=1)
print(SI_PATH, json.dumps(summ))
for s in spans: print('  ', s)
