
import type { World } from './world/world'

export interface SimulationStatistics {
  population: number
  food_count: number
  max_generation: number
  average_speed: number
  average_vision: number
  average_metabolism: number
  average_energy: number
}

export function calculateStatistics(
  world: World
): SimulationStatistics {
  const { organisms, food } = world

  if (organisms.length === 0) {
    return {
      population: 0,
      food_count: food.length,
      max_generation: 0,
      average_speed: 0,
      average_vision: 0,
      average_metabolism: 0,
      average_energy: 0
    }
  }

  const totals = organisms.reduce(
    (accumulator, organism) => ({
      speed: accumulator.speed + organism.genome.speed,
      vision: accumulator.vision + organism.genome.vision,
      metabolism: accumulator.metabolism + organism.genome.metabolism,
      energy: accumulator.energy + organism.energy,
      max_generation: Math.max(
        accumulator.max_generation,
        organism.generation
      )
    }),
    {
      speed: 0,
      vision: 0,
      metabolism: 0,
      energy: 0,
      max_generation: 0
    }
  )

  const population = organisms.length

  return {
    population,
    food_count: food.length,
    max_generation: totals.max_generation,
    average_speed: totals.speed / population,
    average_vision: totals.vision / population,
    average_metabolism: totals.metabolism / population,
    average_energy: totals.energy / population
  }
}
