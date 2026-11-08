
export interface Genome {
    speed: number
    vision: number
    metabolism: number
  }
  
  export const BASE_GENOME: Readonly<Genome> = {
    speed: 50,
    vision: 100,
    metabolism: 1
  }
  
  const MUTATION_RATE = 0.15
  const MUTATION_STRENGTH = 0.1
  
  export function createGenome(
    overrides: Partial<Genome> = {}
  ): Genome {
    return {
      ...BASE_GENOME,
      ...overrides
    }
  }
  
  function mutateValue(
    value: number,
    min: number,
    max: number
  ): number {
    if (Math.random() >= MUTATION_RATE) {
      return value
    }
  
    const variation =
      1 + (Math.random() * 2 - 1) * MUTATION_STRENGTH
  
    return Math.max(min, Math.min(max, value * variation))
  }
  
  export function mutateGenome(genome: Genome): Genome {
    return {
      speed: mutateValue(genome.speed, 20, 100),
      vision: mutateValue(genome.vision, 50, 300),
      metabolism: mutateValue(genome.metabolism, 0.2, 3)
    }
  }
  