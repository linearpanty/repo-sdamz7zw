import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const audioDir = join(ROOT, 'public/audio/us')
const audioTsPath = join(ROOT, 'src/lib/audio.ts')

const ids = readdirSync(audioDir)
  .filter((f) => f.endsWith('.mp3'))
  .map((f) => f.slice(0, -4))
  .sort()

// Use JSON.stringify directly if single quote is present (e.g. o'clock)
const formattedEntries = ids
  .map((id) => (id.includes("'") ? `  "${id}",` : `  '${id}',`))
  .join('\n')

const src = readFileSync(audioTsPath, 'utf8')
const updated = src
  .replace(
    /export const LOCAL_US_AUDIO_IDS: ReadonlySet<string> = new Set\(\[[\s\S]*?\]\)/,
    `export const LOCAL_US_AUDIO_IDS: ReadonlySet<string> = new Set([\n${formattedEntries}\n])`,
  )
  .replace(
    "import.meta.env.BASE_URL + 'audio/us/' + cleanId + '.mp3'",
    "import.meta.env.BASE_URL + 'audio/us/' + encodeURIComponent(cleanId) + '.mp3'",
  )

writeFileSync(audioTsPath, updated, 'utf8')
console.log(`Updated LOCAL_US_AUDIO_IDS in src/lib/audio.ts with ${ids.length} word IDs.`)
