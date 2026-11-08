
import { createGenome } from './genetics/genome'
import type { Organism } from './entities/organism'
import type { Food } from './entities/food'
import { createWorld } from './world/world'
import type { World } from './world/world'

function randomPosition(max: number): number {
  return Math.random() * max
}

export function createInitialWorld(
  width = 1200,
  height = 800
): World {
  const world = createWorld(width, height)

  for (let i = 0; i < 12; i++) {
    const organism: Organism = {
      id: world.next_entity_id++,
      x: randomPosition(width),
      y: randomPosition(height),
      angle: Math.random() * Math.PI * 2,
      energy: 100,
      age: 0,
      generation: 0,
      genome: createGenome()
    }

    world.organisms.push(organism)
  }

  for (let i = 0; i < 50; i++) {
    const food: Food = {
      id: world.next_entity_id++,
      x: randomPosition(width),
      y: randomPosition(height),
      energy: 25
    }

    world.food.push(food)
  }

  return world
}
