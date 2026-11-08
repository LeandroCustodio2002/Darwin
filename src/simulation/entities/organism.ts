
import type { Genome } from '../genetics/genome'

export interface Organism {
  id: number
  x: number
  y: number
  angle: number
  energy: number
  age: number
  generation: number
  genome: Genome
}
