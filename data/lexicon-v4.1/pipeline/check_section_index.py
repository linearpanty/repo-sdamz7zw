#!/usr/bin/env python3
"""Sanity checks on section_index.csv (run after 01_segment_v3.py). Writes section_index_checks.json and prints a summary.
  1. listening: every 'Questions a-b' header / tapescript Q marker lies in the range of the part it is labelled with
     (Q markers in the last 12 lines of a page are margin-column markers that OCR placed after the running head; reported separately);
  2. reading (academic tests): every test has body text for passages 1, 2 and 3;
  3. book 12 test numbers are 5-8; every book's tapescripts cover 4 tests x 4 parts;
  4. the known lost-heading cases from the audit (b21 T1/T2, b14 T4) are labelled part 4."""
import csv, re, json, sys, collections
SI = sys.argv[1] if len(sys.argv) > 1 else 'section_index.csv'
SRC = sys.argv[2] if len(sys.argv) > 2 else '../v3-inputs/v2src/clawwords.md'
R = list(csv.DictReader(open(SI, encoding='utf-8')))
raw = open(SRC, encoding='utf-8').read().split('\n')
page_last = {}
for r in R:
    if r['page']: page_last[(r['book'], r['page'])] = int(r['line'])
out = {'listening_out_of_range': [], 'listening_margin_markers': 0, 'reading_missing_passage': [], 'tapescript_slots_missing': [], 'known_cases': {}}
for r in R:
    if r['section'] != 'listening' or not str(r['part']).isdigit() or int(r['part']) == 0: continue
    s = raw[int(r['line']) - 1]; p = int(r['part']); qs = []
    if r['region'] in ('q_marker', 'tapescript', 'narrator'):
        qs = [int(m.group(1)) for m in re.finditer(r'\bQ\s?(\d{1,2})\b', s)]
    m = re.match(r'^\s*(?:(?:section|part)\s*[1-4]?\s*)?questions?\s*(\d{1,2})\s*(?:[-–]|and|to)\s*(\d{1,2})', s, re.I)
    if m: qs += [int(m.group(1)), int(m.group(2))]
    bad = [q for q in qs if 1 <= q <= 40 and not ((p - 1) * 10 < q <= p * 10)]
    if not bad: continue
    near_end = page_last.get((r['book'], r['page']), 0) - int(r['line']) <= 12
    if r['region'] == 'q_marker' and near_end: out['listening_margin_markers'] += 1; continue
    out['listening_out_of_range'].append(dict(line=int(r['line']), book=r['book'], test=r['test'], part=p, region=r['region'], is_body=int(r['is_body']), q=bad, text=s[:60]))
rd = collections.defaultdict(set); ts = collections.defaultdict(set)
for r in R:
    if r['is_body'] != '1': continue
    if r['section'] == 'reading' and r['test'].isdigit(): rd[(r['book'], r['test'])].add(r['part'])
    if r['region'] == 'tapescript': ts[r['book']].add((r['test'], r['part']))
for k, v in sorted(rd.items()):
    miss = {'1', '2', '3'} - v
    if miss: out['reading_missing_passage'].append(dict(book=k[0], test=k[1], missing=sorted(miss)))
for b, v in sorted(ts.items()):
    tests = sorted({t for t, _ in v if t.isdigit()}, key=int)
    t0 = 5 if b == '12' else 1
    exp = {(str(t), str(p)) for t in range(t0, t0 + 4) for p in range(1, 5)}
    if exp - v: out['tapescript_slots_missing'].append(dict(book=b, missing=sorted(exp - v)))
out['book12_tests'] = sorted({r['test'] for r in R if r['book'] == '12' and r['section']})
for name, (a, b) in {'b21_T1_lecture L106730-106784': (106730, 106784), 'b21_T2_lecture L107049-107105': (107049, 107105),
                     'b14_T4_lecture L68478-68532': (68478, 68532)}.items():
    labs = collections.Counter((r['test'], r['part']) for r in R[a - 1:b] if r['is_body'] == '1')
    out['known_cases'][name] = {f'T{t} part {p}': c for (t, p), c in labs.items()}
json.dump(out, open('section_index_checks.json', 'w'), indent=1)
print('listening Q out of range (excluding page-end margin markers):', len(out['listening_out_of_range']),
      ' body lines among them:', sum(x['is_body'] for x in out['listening_out_of_range']), ' margin markers:', out['listening_margin_markers'])
for x in out['listening_out_of_range'][:40]: print('  ', x)
print('reading tests missing a passage:', out['reading_missing_passage'])
print('tapescript slots missing:', out['tapescript_slots_missing'])
print('book 12 tests:', out['book12_tests']); print('known cases:', out['known_cases'])
