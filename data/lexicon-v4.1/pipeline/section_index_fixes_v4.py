#!/usr/bin/env python3
"""section_index_fixes_v4.csv: every v4 change to section_index.csv vs the read-only v3 file (../candidate-2026-11-01-v3/section_index.csv).
One row per contiguous line range with the same kind of change (field, old -> new), tagged with the v4 rule (W1..W8) that caused it.
Fields compared: test/part (citation), section, region, is_body, text_clean. Rule attribution is computed from the v4 row (region,
ocr_fixes) and the kind of change - never typed per line.
Usage: section_index_fixes_v4.py OLD NEW"""
import csv, sys, collections, re

def rule(o, n, kind):
    if kind == 'text_clean':
        f = n['ocr_fixes']
        if 'end_punct_quote' in f: return 'W4: end punctuation from OCR quotes normalised'
        if 'asterisk' in f: return 'W8g: footnote/glossary asterisk removed'
        if 'g_for_q' in f: return "W8f: OCR 'g' for 'q' (ganat -> qanat)"
        if 'digit1_for_I' in f or 'II_for_ll' in f: return "W8k: OCR '1' for I / 'II' for 'll"
        if n['region'] in ('tapescript', 'narrator', 'speaker_label', 'transcript_note') or o['region'] == 'tapescript': return 'W3: speaker label stripped inside the line'
        if n['region'] in ('instruction',) and o['region'] != n['region']: return 'W2: rubric line now an instruction line'
        if n['region'] == 'running_header': return 'W1a/W1c: printed running page header (text no longer kept)'
        if n['region'] == 'heading': return "W1d: heading-only line ('Test l', 'TEST. 2') is not body"
        return 'text change (region change)'
    if kind in ('region', 'is_body'):
        if n['region'] == 'running_header': return 'W1a/W1c: printed running page header (Test n / General Training: Reading and Writing)'
        if n['region'] == 'instruction' and o['region'] in ('passage', 'reading_question'): return "W2: GT/reading rubric 'Read the text below and answer Questions ...' is non-body"
        if n['region'] in ('narrator', 'transcript_note'): return 'W2: narrator/rubric turn or transcription note inside a tapescript is non-body'
        if n['region'] == 'speaker_label': return 'W3: line consisting only of a speaker label'
        if n['region'] == 'heading' and str(n['test']).startswith('GT'): return "W1c: GT section title 'General Training: Reading and Writing' is a heading"
        if n['region'] == 'heading': return "W1d: heading-only line ('Test l', 'TEST. 2') is not body"
        if n['region'] == 'passage' and o['region'] == 'reading_question' and str(n['test']).startswith('GT'): return 'W1c: GT running header no longer opens a question block (passage text restored as body)'
        if n['section'] == 'writing' and o['section'] != 'writing': return "W1c: GT Writing page no longer flipped to Reading (task prompt is non-body)"
        if n['region'] == 'q_marker' and o['region'] == 'tapescript': return "W1d: OCR'd Q-marker line ('QI5') is non-body"
        if 'asterisk' in n['ocr_fixes'] or (o['region'] == 'ocr_garbage' and '*' in o['text_clean'] + n['text_clean']): return 'W8g: asterisk removal changed a non-body line class'
        if n['region'] == 'ocr_garbage' and o['region'] == 'tapescript': return 'W3: only a spelled-out name left after the speaker label was stripped (OCR garbage filter)'
        return 'region change (side effect of W1c/W2 state change)'
    if kind == 'section':
        return "W1c: GT Writing page no longer flipped to Reading by the running header / 'spend about 20 minutes on this task'"
    # test/part
    if n['section'] == 'listening': return 'W1a/W1b: tapescript citation from the nearest real TEST/SECTION/PART heading (running page headers ignored)'
    if str(n['test']).startswith('GT'): return "W1c: GT test letter kept (running header no longer resets 'GT-A'/'GT-B' to 'GT')"
    return 'test/part change'

if __name__ == '__main__':
    OLD = sys.argv[1] if len(sys.argv) > 1 else '../candidate-2026-11-01-v3/section_index.csv'
    NEW = sys.argv[2] if len(sys.argv) > 2 else 'section_index.csv'
    O = list(csv.DictReader(open(OLD, encoding='utf-8'))); N = list(csv.DictReader(open(NEW, encoding='utf-8')))
    assert len(O) == len(N), (len(O), len(N))
    rows = []; cur = None
    for o, n in zip(O, N):
        ch = []
        if (o['test'], o['part']) != (n['test'], n['part']): ch.append(('test/part', f"T{o['test']} {o['section']} part {o['part']}", f"T{n['test']} {n['section']} part {n['part']}"))
        if o['section'] != n['section']: ch.append(('section', o['section'], n['section']))
        if o['region'] != n['region']: ch.append(('region', o['region'], n['region']))
        if o['is_body'] != n['is_body']: ch.append(('is_body', o['is_body'], n['is_body']))
        if o['text_clean'] != n['text_clean']: ch.append(('text_clean', o['text_clean'][:80], n['text_clean'][:80]))
        for kind, a, b in ch:
            rl = rule(o, n, kind)
            key = (kind, a, b, rl) if kind != 'text_clean' else (kind, None, None, rl)
            line = int(n['line'])
            if cur and cur['_key'] == key and line - cur['line_to'] <= 6 and cur['book'] == n['book']:
                cur['line_to'] = line; cur['lines_changed'] += 1; cur['body_lines_changed'] += int(n['is_body'] == '1' or o['is_body'] == '1')
                if kind == 'text_clean' and len(cur['examples']) < 300: cur['examples'] += f" | L{line}: {a} => {b}"
                continue
            cur = dict(_key=key, line_from=line, line_to=line, book=n['book'], field=kind, old=a if kind != 'text_clean' else '', new=b if kind != 'text_clean' else '',
                       lines_changed=1, body_lines_changed=int(n['is_body'] == '1' or o['is_body'] == '1'), rule=rl,
                       examples=f"L{line}: {a} => {b}" if kind == 'text_clean' else '')
            rows.append(cur)
    cols = ['line_from', 'line_to', 'book', 'field', 'old', 'new', 'lines_changed', 'body_lines_changed', 'rule', 'examples']
    with open('section_index_fixes_v4.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction='ignore'); w.writeheader(); w.writerows(rows)
    c = collections.Counter(); cb = collections.Counter(); cr = collections.Counter()
    for r in rows:
        k = (r['rule'].split(':')[0], r['field']); c[k] += r['lines_changed']; cb[k] += r['body_lines_changed']; cr[k] += 1
    print('ranges', len(rows))
    for k in sorted(c): print(f'  {k[0]:8s} {k[1]:10s} ranges {cr[k]:4d}  lines {c[k]:5d}  body(old or new) {cb[k]:5d}')
    bo = sum(r['is_body'] == '1' for r in O); bn = sum(r['is_body'] == '1' for r in N)
    print('body lines v3', bo, '-> v4', bn)
