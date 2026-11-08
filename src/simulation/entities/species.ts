
import type { Genome } from '../genetics/genome'

export type SpeciesType =
  | 'herbivore'
  | 'carnivore'
  | 'omnivore'
  | 'predator'
  | 'decomposer'

export interface SpeciesDefinition {
  name: string
  color: string
  diet: 'food' | 'organisms' | 'both' | 'dead'
  aggression: number
  genome: Genome
  initial_size: number
}

export const SPECIES: Record<SpeciesType, SpeciesDefinition> = {
  herbivore: {
    name: 'Herbívoro',
    color: '#8bd450',
    diet: 'food',
    aggression: 0,
    genome: {
      speed: 45,
      vision: 110,
      metabolism: 0.8
    },
    initial_size: 5
  },

  carnivore: {
    name: 'Carnívoro',
    color: '#ef4444',
    diet: 'organisms',
    aggression: 0.35,
    genome: {
      speed: 55,
      vision: 125,
      metabolism: 1.4
    },
    initial_size: 5.5
  },

  omnivore: {
    name: 'Onívoro',
    color: '#f59e0b',
    diet: 'both',
    aggression: 0.3,
    genome: {
      speed: 50,
      vision: 120,
      metabolism: 1
    },
    initial_size: 5
  },

  predator: {
    name: 'Predador',
    color: '#a855f7',
    diet: 'organisms',
    aggression: 1,
    genome: {
      speed: 75,
      vision: 200,
      metabolism: 1.5
    },
    initial_size: 7
  },

  decomposer: {
    name: 'Decompositor',
    color: '#14b8a6',
    diet: 'dead',
    aggression: 0,
    genome: {
      speed: 40,
      vision: 160,
      metabolism: 0.7
    },
    initial_size: 5.5
  }
}
