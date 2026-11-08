
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

export function advanceWorld(
  world: World,
  delta_time: number
): World {
  const organisms = world.organisms.map((organism) => {
    let angle = organism.angle

    angle += (Math.random() * 2 - 1) * 1.8 * delta_time

    let x =
      organism.x +
      Math.cos(angle) * organism.genome.speed * delta_time

    let y =
      organism.y +
      Math.sin(angle) * organism.genome.speed * delta_time

    if (x < 0 || x > world.width) {
      angle = Math.PI - angle
      x = Math.max(0, Math.min(world.width, x))
    }

    if (y < 0 || y > world.height) {
      angle = -angle
      y = Math.max(0, Math.min(world.height, y))
    }

    return {
      ...organism,
      x,
      y,
      angle
    }
  })

  return {
    ...world,
    organisms,
    tick: world.tick + 1
  }
}
