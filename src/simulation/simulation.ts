
import { createGenome, mutateGenome } from './genetics/genome'
import type { Organism } from './entities/organism'
import type { Food } from './entities/food'
import { createWorld } from './world/world'
import type { World } from './world/world'

const EATING_DISTANCE = 12
const TURN_SPEED = 10

const MAX_FOOD = 80
const FOOD_SPAWN_INTERVAL = 2
const FOOD_SPAWN_AMOUNT = 3

const REPRODUCTION_THRESHOLD = 150
const REPRODUCTION_COST = 75
const OFFSPRING_ENERGY = 75
const MAX_POPULATION = 50
const REPRODUCTION_DISTANCE = 20

function randomPosition(max: number): number {
  return Math.random() * max
}

function distanceBetween(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= Math.PI * 2
  while (angle < -Math.PI) angle += Math.PI * 2
  return angle
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

function findNearestFood(
  organism: Organism,
  food: Food[]
): Food | null {
  let nearest_food: Food | null = null
  let closest_distance = organism.genome.vision

  for (const item of food) {
    const distance = distanceBetween(
      organism.x,
      organism.y,
      item.x,
      item.y
    )

    if (distance < closest_distance) {
      closest_distance = distance
      nearest_food = item
    }
  }

  return nearest_food
}

function updateOrganism(
  organism: Organism,
  food: Food[],
  delta_time: number,
  world: World
): { organism: Organism; consumed_food_id: number | null } {
  let angle = organism.angle

  const target_food = findNearestFood(organism, food)

  if (target_food) {
    const target_angle = Math.atan2(
      target_food.y - organism.y,
      target_food.x - organism.x
    )

    const angle_difference = normalizeAngle(target_angle - angle)

    const rotation = Math.max(
      -TURN_SPEED * delta_time,
      Math.min(TURN_SPEED * delta_time, angle_difference)
    )

    angle += rotation
  } else {
    angle += (Math.random() * 2 - 1) * 1.8 * delta_time
  }

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

  let energy =
    organism.energy - organism.genome.metabolism * delta_time

  let consumed_food_id: number | null = null

  if (target_food) {
    const distance_to_food = distanceBetween(
      x,
      y,
      target_food.x,
      target_food.y
    )

    if (distance_to_food <= EATING_DISTANCE) {
      energy += target_food.energy
      consumed_food_id = target_food.id
    }
  }

  return {
    organism: {
      ...organism,
      x,
      y,
      angle,
      energy,
      age: organism.age + delta_time
    },
    consumed_food_id
  }
}

export function advanceWorld(
  world: World,
  delta_time: number
): World {
  const remaining_food = [...world.food]
  const surviving_organisms: Organism[] = []
  let next_entity_id = world.next_entity_id

  for (const organism of world.organisms) {
    const result = updateOrganism(
      organism,
      remaining_food,
      delta_time,
      world
    )

    if (result.consumed_food_id !== null) {
      const food_index = remaining_food.findIndex(
        (item) => item.id === result.consumed_food_id
      )

      if (food_index !== -1) {
        remaining_food.splice(food_index, 1)
      }
    }

    if (result.organism.energy > 0) {
      surviving_organisms.push(result.organism)
    }
  }

  const initial_population = surviving_organisms.length

  for (let i = 0; i < initial_population; i++) {
    if (surviving_organisms.length >= MAX_POPULATION) {
      break
    }

    const parent = surviving_organisms[i]

    if (!parent || parent.energy < REPRODUCTION_THRESHOLD) {
      continue
    }

    const offspring_angle = Math.random() * Math.PI * 2

    const offspring: Organism = {
      id: next_entity_id++,
      x: Math.max(
        0,
        Math.min(
          world.width,
          parent.x + Math.cos(offspring_angle) * REPRODUCTION_DISTANCE
        )
      ),
      y: Math.max(
        0,
        Math.min(
          world.height,
          parent.y + Math.sin(offspring_angle) * REPRODUCTION_DISTANCE
        )
      ),
      angle: Math.random() * Math.PI * 2,
      energy: OFFSPRING_ENERGY,
      age: 0,
      generation: parent.generation + 1,
      genome: mutateGenome(parent.genome)
    }

    surviving_organisms[i] = {
      ...parent,
      energy: parent.energy - REPRODUCTION_COST
    }

    surviving_organisms.push(offspring)
  }

  let food_spawn_timer = world.food_spawn_timer

  if (remaining_food.length < MAX_FOOD) {
    food_spawn_timer += delta_time

    if (food_spawn_timer >= FOOD_SPAWN_INTERVAL) {
      const amount = Math.min(
        FOOD_SPAWN_AMOUNT,
        MAX_FOOD - remaining_food.length
      )

      for (let i = 0; i < amount; i++) {
        remaining_food.push({
          id: next_entity_id++,
          x: randomPosition(world.width),
          y: randomPosition(world.height),
          energy: 25
        })
      }

      food_spawn_timer -= FOOD_SPAWN_INTERVAL
    }
  } else {
    food_spawn_timer = 0
  }

  return {
    ...world,
    organisms: surviving_organisms,
    food: remaining_food,
    next_entity_id,
    food_spawn_timer,
    tick: world.tick + 1
  }
}
