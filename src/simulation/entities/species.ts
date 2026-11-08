
import type { Genome } from '../genetics/genome'

export type SpeciesType =
  | 'herbivore'
  | 'carnivore'
  | 'omnivore'
  | 'predator'
  | 'decomposer'
  | 'decomposer_hunter'

export interface SpeciesDefinition {
  name: string
  color: string
  diet: 'food' | 'organisms' | 'both' | 'dead' | 'decomposers'
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
      speed: 100,
      vision: 150,
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
      vision: 250,
      metabolism: 1.15
    },
    initial_size: 8
  },

  decomposer: {
    name: 'Decompositor',
    color: '#14b8a6',
    diet: 'dead',
    aggression: 0,
    genome: {
      speed: 300,
      vision: 160,
      metabolism: 0.7
    },
    initial_size: 5.5
  },

  decomposer_hunter: {
    name: 'Caçador de decompositores',
    color: '#3b82f6',
    diet: 'both',
    aggression: 0.85,
    genome: {
      speed: 65,
      vision: 180,
      metabolism: 1.25
    },
    initial_size: 6
  }
}
