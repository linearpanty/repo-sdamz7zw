#!/usr/bin/env python3
"""Per-token card assignment of the v3 build, for diff_vs_v3.py. Runs pass 1 of the READ-ONLY v3 builder
(../candidate-2026-11-01-v3/build_v3.py, up to '# ---------- pass 2') on the v3 staged tokens, exactly as STEP 2 of v3 did
(examples s00_make_v3_pass1.py), and writes v3_card_tokens.pkl = [(staged index, line, surface form, card, rule)] for body tokens.
Nothing in the v3 directory is written (bytecode disabled)."""
import sys, os
sys.dont_write_bytecode = True
V3 = sys.argv[1] if len(sys.argv) > 1 else '../candidate-2026-11-01-v3'
src = open(f'{V3}/build_v3.py', encoding='utf-8').read().split('\n')
end = next(i for i, l in enumerate(src) if l.startswith('# ---------- pass 2'))
body = '\n'.join(src[:end])
for a, b in [("sys.path.insert(0, '.')", "sys.path.insert(0, V3)"), ("pickle.load(open('staged_v3.pkl', 'rb'))", "pickle.load(open(f'{V3}/staged_v3.pkl', 'rb'))"),
             ("pickle.load(open('tokens_v3.pkl', 'rb'))", "pickle.load(open(f'{V3}/tokens_v3.pkl', 'rb'))"), ("pickle.load(open('sents_v3.pkl', 'rb'))", "pickle.load(open(f'{V3}/sents_v3.pkl', 'rb'))")]:
    assert body.count(a) == 1, a
    body = body.replace(a, b)
g = {'V3': V3, '__name__': 'v3_pass1'}
exec(compile(body, 'v3_pass1', 'exec'), g)
import pickle
ST, FL = g['ST'], g['FL']
pickle.dump([(k, o['line'], o['lower'], FL[k][0], FL[k][2]) for k, o in enumerate(ST) if o['is_body']], open('v3_card_tokens.pkl', 'wb'))
print('v3 body tokens with card assignment:', sum(1 for k, o in enumerate(ST) if o['is_body']))
