#!/bin/bash
# ClawWords v4.1 (STEP 1, wordlist only; v4 + 11-04 re-audit rules W10a/W10b): rebuild every output of this directory from the read-only inputs.
#   inputs: ../v3-inputs/ (clawwords.md, v2 segmenter, 10-31 final, 11-01 audit, ielts-freq lists), ../candidate-2026-11-01-v3/ (v3 build, for
#   the v3 diff and section_index diff), ../reaudit-2026-11-03/ (re-audit), ../examples-2026-11-03-exam/examples.csv (to locate re-audit rows),
#   vendor/words.txt (vendored word list, W7). Only ./.venv/bin/python is used. Nothing outside this directory is written.
# Usage: ./run_all.sh            (log: run.log)
set -euo pipefail
cd "$(dirname "$0")"
PY=./.venv/bin/python
IN=../v3-inputs
V3=../candidate-2026-11-01-v3
RA=../reaudit-2026-11-03
EXC=../examples-2026-11-03-exam/examples.csv
MD=$IN/v2src/clawwords.md
export PYTHONDONTWRITEBYTECODE=1 PYTHONHASHSEED=0
exec > >(tee run.log) 2>&1
echo "=== ClawWords v4 run_all.sh  $(date '+%Y-%m-%d %H:%M:%S')"
echo "python: $($PY -c 'import sys,spacy,wordfreq;print(sys.version.split()[0],"spacy",spacy.__version__)')  model: $($PY -c 'import spacy;print(spacy.load("en_core_web_md").meta["version"])')"
echo "input clawwords.md sha256: $(shasum -a 256 $MD | cut -d' ' -f1)"
echo "vendor/words.txt sha256:   $(shasum -a 256 vendor/words.txt | cut -d' ' -f1)"
t0=$(date +%s)
echo "--- 0. regenerate v2_instr.py from the v2 segmenter";            $PY make_v2_instr.py $IN/candidate-2026-10-30-v2/01v2_clean_segment.py
echo "--- 1. segment (section_index.csv, lines_v4.jsonl)";             $PY 01_segment_v4.py $MD > seg_run.log; tail -n 25 seg_run.log
echo "--- 1b. section_index checks, fixes vs v3, citation scans";      $PY check_section_index.py section_index.csv $MD
                                                                       $PY section_index_fixes_v4.py $V3/section_index.csv section_index.csv
                                                                       $PY check_citations_v4.py $V3/section_index.csv $MD citation_scan_v3 | head -n 1
                                                                       $PY check_citations_v4.py section_index.csv $MD citation_scan_v4 | head -n 1
echo "--- 2. lemmatize (spaCy en_core_web_md) + W5 de-hyphenation";   $PY 02_lemmatize_v4.py $MD | tee lemmatize.log
echo "--- 2b. lemma misassignment scan";                             $PY scan_lemma_errors.py tokens_v4.pkl sents_v4.pkl | head -n 1
echo "--- 3. stage tokens";                                           $PY 03_stage_tokens_v4.py
echo "--- 4. build list";                                             $PY build_v4.py
echo "--- 5. diffs: vs v3 (token-level reasons) and vs 10-31";       $PY v3_card_tokens.py $V3
                                                                       $PY diff_vs_v3.py $V3 | head -n 1
                                                                       $PY diff_vs_1031.py
echo "--- 6. note-column review";                                     $PY note_review.py
echo "--- 7. audits: 11-01 (audit_resolution.csv), 11-03 re-audit";  $PY resolve_audit_1101.py | tail -n 1
                                                                       $PY resolve_reaudit_v4.py $RA $EXC
echo "--- 8. samples";                                                $PY samples_30.py
echo "--- 9. sanity checks";                                          $PY sanity_checks_v4.py
echo "--- 9b. v4.1 diff vs v4 (read-only)";                         $PY diff_vs_v4.py ../candidate-2026-11-03-v4
echo "--- 10. report";                                                $PY write_report_v4.py
echo "=== done in $(( $(date +%s) - t0 ))s"
