# ClawWords 词表 v4.1：开发说明

本目录是 ClawWords 雅思词表 v4.1 的数据、例句、生成脚本和报告，日期 2026-11-04。**这里只有数据，应用代码没有改。**

- 词表：**2,557** 张卡（`final_wordlist.csv` 的行数）
- 例句：**7,511** 条（`examples.csv` 的行数）
  - 主例句 2,555 条，备选一 2,527 条，备选二 2,429 条
  - 2 个词没有例句，列在 `missing.csv`

## 1. 选词规则

1. **来源和排序**：统计《剑桥雅思》4–21 真题的词频，按频次从高到低排，频次相同时按出现的书数排。**不按字母排序。**
2. **只统计正文**：以下内容都不计入：
   - 题干和选项
   - TRUE/FALSE/NOT GIVEN 陈述
   - 写作和口语题目
   - 范文的考官评语
   - 页眉、页码、题号、水印

   G 类（GT）阅读的文章算正文。
3. **入选门槛**：一般要求在正文中至少出现 10 次，并且分布在至少 3 本书里。规则 7 的强制保留词和封闭词类不受这个限制。
4. **词形**：
   - 有独立义项的屈折形式单独成卡，例如 based、advanced、concerned。
   - 纯屈折形式并入原形。合并记录见 `merges.csv`。
   - 主形式用英式拼写，美式拼写作为别名。
5. **太基础的词跳过**：用方案 C 过滤。headword 的 Zipf 值 ≥ 5.5 的词不收，例外共 23 个：
   - 原定稿的 22 个例外，包括 based
   - **May（月份）是第 23 个例外**。只有日期语境里的 May 算作月份，情态动词 may 不算。
6. **数字词不收。**
7. **规则 7 强制保留**：chart、graph、overview 等写作必需词保留。
8. **其他定稿规则（10-31 的 8 条）照旧**：
   - 删除叹词 yes、sure、goodbye。
   - 不恢复城市名。只靠单篇文章撑起来的地名删除。
   - 问题只标记，不删除。标记字段为 `instruction_word`、`single_text_flag`、`month_flag` 和 `weekday_flag`。
   - 写作评分标准里的句子不计入。
   - 连接词另存为 `connectives_reserved.csv`，不进主表。
9. **等级标签**：只存在数据里，前台不显示。

## 2. 例句规则

1. 例句都是真题原句，不改写，也不编造。
2. 每张卡有 1 句主例句，另外最多 2 句备选。
3. 句子里必须出现词头或它的屈折形式，而且义项要和卡片对应。实际匹配到的形式记在 `matched_form`。
4. 每句都标出处，字段为 `book`、`test`、`section`、`part` 和 `source_kind`。`line_start` 和 `line_end` 是原文语料的行号，用于追溯。
5. 只用正文句子，不用答案、题干、指令和考官评语。听力对话去掉说话人标签。
6. 句子要完整，长度大约 8–25 词，不能有听力填空、题号或 OCR 乱码。
7. OCR 只修明显的字符错误：
   - 修过的句子标 `ocr_fixed=1`。
   - 原文保留在 `sentence_raw`。
   - 修复规则见 `pipeline/ocr_rules.json`。
   - v4.1 共有 97 条修过，其中主例句 17 条。
8. 找不到合格句子的词列入 `missing.csv`，不硬凑。
9. 来源分布：听力 3,860 条，阅读 3,651 条。写作和口语部分没有例句入选。

## 3. 文件说明

| 文件 | 内容 |
|---|---|
| `final_wordlist.csv` | 完整词表，2,557 行，35 列。包括排名、lemma、显示形式、别名和总频次。还有书数、各部分频次（listening/reading/writing/speaking/other）和 Zipf 值。另有标记列：instruction_word、single_text_flag、month_flag、weekday_flag。还记录了合并来源、备注和基础词过滤前的排名等。 |
| `app_export_wordlist.csv` | 给应用用的精简版，2,557 行。列为 rank、lemma、display_form、aliases、total_count、books 和 4 个标记列。 |
| `card_forms.csv` | 每张卡计入的词形（surface_forms），2,557 行。 |
| `merges.csv` | 屈折形式和变体并入原形的记录，354 行。列为 from_lemma、surface_form、to_lemma、tokens 和 rule。 |
| `removed_words.csv` | 被删的词，281 行，含类别、原因和频次。 |
| `connectives_reserved.csv` | 另存的连接词，99 行，不进主表。 |
| `examples.csv` | 例句，7,511 行。列为 rank、lemma、role（primary/alt1/alt2）、sentence、sentence_raw、matched_form、book、test、section、part、source_kind、line_start、line_end、word_count、ocr_fixed、sense_check、sentence_id 和 v3_status。 |
| `missing.csv` | 没有合格例句的卡（universe、sequence），附原因。 |
| `REPORT_wordlist.md` | 词表报告。包括 v4.1 补丁、关键数字、W1–W10 管线修复、两轮审计的逐条处理、sanity checks、抽样和局限。 |
| `REPORT_examples.md` | 例句 v4.1 补丁报告，逐条说明复审提出的 12 项必须修。 |
| `REPORT_full.md` | 例句完整报告。包括覆盖率、相对 v3 的变化、管线修复、复审映射、主例句扫描、OCR 修复、校验、例句少的卡和遗留项。 |
| `pipeline/*.py`、`pipeline/run_all.sh` | 生成词表的脚本：分段、词形还原、token 分级、建表、diff、审计处理、sanity check 和写报告。 |
| `pipeline/reproducibility.txt` | 2026-11-03 v4 做的干净环境复现记录：45 个产物中 44 个逐字节一致，只有 run.log 不同。 |
| `pipeline/ocr_rules.json` | 例句阶段的 OCR 拒绝规则和逐行修复规则（fix_rules）。 |
| `SHA256SUMS-2026-11-04-v4.1.txt` | 原始交付包 `candidate-2026-11-04-v4.1.tgz` 和 `examples-2026-11-04-v4.1.tgz` 的 sha256。这两个 tgz 没有放进仓库。本目录的文件已逐个和包里的同名文件核对，完全一致。 |

## 4. 怎么复现

**剑桥原文语料 `clawwords.md` 不在仓库里**，pkl、jsonl 等中间产物也不在，所以仓库本身无法直接重跑。

`pipeline/run_all.sh` 设定的目录结构是：

- 词表目录（例如 `candidate-2026-11-04-v4.1/`）
- 和它平级的 `../v3-inputs/`。里面有 `v2src/clawwords.md`、v2 分段脚本、10-31 定稿、11-01 审计和 ielts-freq 词频表。
- `../candidate-2026-11-01-v3/`
- `../reaudit-2026-11-03/`
- `../examples-2026-11-03-exam/examples.csv`
- 本目录的 `vendor/words.txt`。它是 macOS `/usr/share/dict/words`（web2）的拷贝，sha256 为 `be41ad97…bab9`，**也没有放进仓库**。

环境要求：

- Python 需在 `./.venv/bin/python`
- spaCy 模型为 `en_core_web_md`
- 需要 wordfreq
- 需设置 `PYTHONHASHSEED=0`

运行 `./run_all.sh` 会重建该目录的全部产物，日志写到 run.log。

注意事项：

- `reproducibility.txt` 记录的是 v4（11-03）的运行结果。v4.1 之后，`final_wordlist.csv` 和 `card_forms.csv` 的 sha256 已经和记录里的不同，`merges.csv` 仍然一致。
- 例句阶段的脚本（`scripts/s01–s12` 等）**不在仓库里**，这里只有 `ocr_rules.json`。所以例句结果只能用原始交付包复现。

## 5. 版本迭代

| 版本 | 时间 | 要点 |
|---|---|---|
| 10-31 定稿 | 2026-10-31 | 应用 8 条规则和方案 C，22 个例外（含 based），共 2,977 词。题干等非正文也计入了词频。 |
| v3 | 11-01/11-03 | 只统计正文，修正章节定位，清洗 OCR，修坏卡，共 2,561 词。复审评估：v3 必须修的卡约 7.6%。 |
| v4 | 11-03 | W1–W9 修复，包括：引用改用真实章节标题、写作评分标准行、说话人标签、去连字符、May 作第 23 个例外。共 2,558 词。11-04 复审估计：主例句中必须修的约 1.0%（约 25/2,556）。 |
| **v4.1** | 11-04 | 修完 11-04 复审指出的 12 项必须修：<br>- 词表 W10a：riding/rid 并入 ride，rid 因此低于门槛删除。<br>- 词表 W10b：New Mexico 不再计入 mexico。<br>- 例句侧点修。<br>最终 **2,557 词、7,511 条例句**。 |

## 6. 未处理的建议项

- **主例句的上下文依赖**：按 11-04 复审抽样，约 35% 的主例句离开上下文不好懂，例如含有指代不明的 it、this、they、here 或 the X。这一项算建议修，不阻塞发布。
- **有争议的合并**：close、shop/shopping、sink 等，暂按现状处理。
- **暂无例句**：universe 和 sequence。候选句都太长或有 OCR 问题，见 `missing.csv`。
- **mexico**：W10b 之后剩 11 个正文 token、分布在 8 本书，其中 2 次是 Mexico City（L2457、L20152）。去掉这 2 次就只剩 9 次，低于门槛。目前暂时保留，等决定。
- 其他遗留项见 `REPORT_full.md` 第 9 节和 `REPORT_wordlist.md` 第 9 节，例如 ton 的计数包含人名 Ton，indian 只有一个可用句子。
