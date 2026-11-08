import type { Genome } from '../genetics/genome'
import type { SpeciesType } from './species'

export interface Organism {
  id: number
  x: number
  y: number
  angle: number
  energy: number
  age: number
  generation: number
  size: number
  species: SpeciesType
  genome: Genome
}