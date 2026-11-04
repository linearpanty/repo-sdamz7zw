#!/usr/bin/env python3
"""W7: the ONLY dictionary used by the v4 scripts. Reads the vendored copy vendor/words.txt (never a system path).
vendor/words.txt = byte-identical copy of the macOS system word list (web2, Webster's 2nd International, 235,976 entries), copied once on
2026-11-03 (provenance in vendor/SOURCE.txt); its sha256 is checked here and recorded in REPORT.md.
web2 lists base forms and lacks many modern words (online, email, website), so is_word() also accepts a word that wordfreq rates as
common (zipf >= COMMON_ZIPF) and regular inflections of a listed base form."""
import os, hashlib
from wordfreq import zipf_frequency
HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, 'vendor', 'words.txt')
SHA256 = 'be41ad97963bf8dabedd5871d5d691596175269d540956b0f9965a885c2bbab9'
_raw = open(PATH, 'rb').read()
assert hashlib.sha256(_raw).hexdigest() == SHA256, 'vendor/words.txt does not match the recorded sha256'
DICT = {w.strip().lower() for w in _raw.decode('utf-8').split('\n') if w.strip()}
COMMON_ZIPF = 3.0

def _bases(w):
    out = {w}
    for suf, rep in (('ies', 'y'), ('es', ''), ('s', ''), ('ied', 'y'), ('ed', ''), ('ed', 'e'), ('ing', ''), ('ing', 'e'), ('ly', ''), ('er', ''),
                     ('est', ''), ('ers', ''), ('ings', ''), ('ness', ''), ('ment', ''), ('ments', '')):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            b = w[:-len(suf)] + rep; out.add(b)
            if len(b) >= 4 and b[-1] == b[-2] and suf in ('ed', 'ing', 'er', 'est'): out.add(b[:-1])   # doubled consonant: stopped -> stop
    return out

def in_dict(w):
    """listed in the vendored word list (directly or as a regular inflection of a listed base form)"""
    w = w.lower()
    return any(b in DICT for b in _bases(w))

def is_word(w):
    """dictionary word: vendored list (incl. regular inflections) or a common word by wordfreq (zipf >= 3.0)"""
    w = w.lower()
    return bool(w) and (in_dict(w) or zipf_frequency(w, 'en') >= COMMON_ZIPF)

def is_part_word(w):
    """looser test for the halves of a hyphenated compound (W5 rule c): is_word, or wordfreq zipf >= 2.0, or the US spelling of a British
    word is listed (web2 is American: millimetre -> millimeter, colour -> color, organise -> organize)."""
    w = w.lower()
    if is_word(w) or zipf_frequency(w, 'en') >= 2.0: return True
    for a, b in (('tre', 'ter'), ('our', 'or'), ('ise', 'ize'), ('ised', 'ized'), ('ising', 'izing'), ('isation', 'ization'), ('yse', 'yze'), ('ogue', 'og')):
        if w.endswith(a) and in_dict(w[:-len(a)] + b): return True
    return False
