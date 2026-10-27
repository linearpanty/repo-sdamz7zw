import { readdir, readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'

const BANNED = [
  '温故',
  '知新',
  '图鉴',
  '选义',
  'Boss',
  'boss',
  '日签',
  '已掌握',
  '待温故',
  '待解锁',
  'FSRS',
  'fsrs',
  '熟悉度',
  '已学会',
  '掌握率',
  '通关',
  '战报',
  '待复习',
  '复习队列',
  '测验模式',
  '复习模式',
]

const REQUIRED_IN_JS = [
  '开始',
  '继续',
  '下一词',
  '完成今天',
  '今天好了',
  '还有',
  '回今天',
  '输入这个词',
  '词卡',
  'abandon the car',
  'adequate supply',
  'adjacent rooms',
  'arbitrary decision',
  'the bridge collapsed',
  'illus/abandon.webp',
  'illus/adequate.webp',
  'illus/adjacent.webp',
  'illus/arbitrary.webp',
  'illus/collapse.webp',
]

const ROOTS = ['src', 'dist', 'public']
const EXTRA = ['index.html']
const TEXT_EXT = new Set(['.ts', '.tsx', '.css', '.html', '.js', '.svg', '.webmanifest', '.json'])

async function walk(dir, out) {
  let entries
  try {
    entries = await readdir(dir)
  } catch {
    return
  }
  for (const name of entries) {
    const path = join(dir, name)
    const info = await stat(path)
    if (info.isDirectory()) {
      if (name === 'node_modules' || name === 'audio') continue
      await walk(path, out)
    } else if (TEXT_EXT.has(extname(name))) {
      out.push(path)
    }
  }
}

const files = []
for (const root of ROOTS) await walk(root, files)
files.push(...EXTRA)

const hits = []
let jsBundle = ''
for (const file of files) {
  const text = await readFile(file, 'utf8')
  if (file.startsWith('dist/') && file.endsWith('.js')) jsBundle += text
  for (const word of BANNED) {
    if (text.includes(word)) hits.push(`${file}: ${word}`)
  }
}

if (hits.length) {
  console.error('Banned copy found:')
  for (const hit of hits) console.error('  ' + hit)
  process.exit(1)
}

const missing = REQUIRED_IN_JS.filter((word) => !jsBundle.includes(word))
if (!jsBundle) {
  console.error('No dist JS bundle to check. Run vite build first.')
  process.exit(1)
}
if (missing.length) {
  console.error('Built JS is missing required copy: ' + missing.join(', '))
  process.exit(1)
}

console.log(`Copy check ok (${files.length} files, bundle ${jsBundle.length} chars).`)
