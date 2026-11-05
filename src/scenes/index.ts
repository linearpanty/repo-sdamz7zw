import { abandon, adequate, approach, benefit, challenge, collapse, environment, evidence, factor, significant } from './scenesA'
import { adjacent, arbitrary, authority, available, capacity, feature, impact, process, strategy, structure } from './scenesB'
import type { Scene } from './timeline'

export type { Scene } from './timeline'

/** One bespoke three-beat scene per headword, keyed by word id. */
export const SCENES: Readonly<Record<string, Scene>> = Object.fromEntries(
  [
    abandon,
    challenge,
    benefit,
    collapse,
    significant,
    adequate,
    environment,
    factor,
    approach,
    evidence,
    adjacent,
    structure,
    available,
    impact,
    strategy,
    arbitrary,
    process,
    authority,
    feature,
    capacity,
  ].map((scene) => [scene.id, scene]),
)

export function sceneFor(id: string): Scene | null {
  return SCENES[id] ?? null
}
