
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
  
  export function createGenome(
    overrides: Partial<Genome> = {}
  ): Genome {
    return {
      ...BASE_GENOME,
      ...overrides
    }
  }
  