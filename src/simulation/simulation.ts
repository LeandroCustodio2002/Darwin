
import { createGenome, mutateGenome } from './genetics/genome'
import type { Organism } from './entities/organism'
import type { Food } from './entities/food'
import { SPECIES } from './entities/species'
import type { SpeciesType } from './entities/species'
import { createWorld } from './world/world'
import type { World } from './world/world'

const EATING_DISTANCE = 12
const TURN_SPEED = 10
const MAX_SIZE = 12
const MAX_ENERGY = 200

const MAX_FOOD = 80
const FOOD_SPAWN_INTERVAL = 2
const FOOD_SPAWN_AMOUNT = 3

const OFFSPRING_ENERGY = 50
const REPRODUCTION_ENERGY = 50
const MAX_POPULATION = 50
const REPRODUCTION_DISTANCE = 20

const REPRODUCTION_RULES: Record<SpeciesType, number> = {
  herbivore: 120,
  omnivore: 150,
  carnivore: 180,
  predator: 190
}

const INITIAL_SPECIES: SpeciesType[] = [
  'herbivore',
  'herbivore',
  'herbivore',
  'herbivore',
  'carnivore',
  'carnivore',
  'carnivore',
  'omnivore',
  'omnivore',
  'omnivore',
  'predator',
  'predator'
]

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

  for (const species of INITIAL_SPECIES) {
    const definition = SPECIES[species]

    const organism: Organism = {
      id: world.next_entity_id++,
      x: randomPosition(width),
      y: randomPosition(height),
      angle: Math.random() * Math.PI * 2,
      energy: 100,
      age: 0,
      generation: 0,
      size: definition.initial_size,
      species,
      genome: createGenome(definition.genome)
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

function findNearestPrey(
  organism: Organism,
  organisms: Organism[]
): Organism | null {
  let nearest_prey: Organism | null = null
  let closest_distance = organism.genome.vision

  for (const candidate of organisms) {
    if (
      candidate.id === organism.id ||
      candidate.energy <= 0 ||
      candidate.species === organism.species
    ) {
      continue
    }

    const distance = distanceBetween(
      organism.x,
      organism.y,
      candidate.x,
      candidate.y
    )

    if (distance < closest_distance) {
      closest_distance = distance
      nearest_prey = candidate
    }
  }

  return nearest_prey
}

function updateOrganism(
  organism: Organism,
  food: Food[],
  organisms: Organism[],
  delta_time: number,
  world: World
): {
  organism: Organism
  consumed_food_id: number | null
  consumed_organism_id: number | null
} {
  const definition = SPECIES[organism.species]

  const nearest_food =
    definition.diet === 'food' || definition.diet === 'both'
      ? findNearestFood(organism, food)
      : null

  const nearest_prey =
    definition.diet === 'organisms' || definition.diet === 'both'
      ? findNearestPrey(organism, organisms)
      : null

  let target_food: Food | null = nearest_food
  let target_prey: Organism | null = null

  if (nearest_prey) {
    if (
      !nearest_food ||
      distanceBetween(
        organism.x,
        organism.y,
        nearest_prey.x,
        nearest_prey.y
      ) * (1 - definition.aggression * 0.5) <
        distanceBetween(
          organism.x,
          organism.y,
          nearest_food.x,
          nearest_food.y
        )
    ) {
      target_food = null
      target_prey = nearest_prey
    }
  }

  const target = target_prey ?? target_food

  let angle = organism.angle

  if (target) {
    const target_angle = Math.atan2(
      target.y - organism.y,
      target.x - organism.x
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

  let size = organism.size
  let consumed_food_id: number | null = null
  let consumed_organism_id: number | null = null

  if (target_food) {
    const distance_to_food = distanceBetween(
      x,
      y,
      target_food.x,
      target_food.y
    )

    if (distance_to_food <= EATING_DISTANCE + size) {
      energy += target_food.energy
      size = Math.min(MAX_SIZE, size + target_food.energy * 0.003)
      consumed_food_id = target_food.id
    }
  }

  if (target_prey) {
    const distance_to_prey = distanceBetween(
      x,
      y,
      target_prey.x,
      target_prey.y
    )

    if (distance_to_prey <= EATING_DISTANCE + size + target_prey.size) {
      const energy_gain = target_prey.energy * 0.65 + target_prey.size * 5

      energy += energy_gain
      size = Math.min(MAX_SIZE, size + energy_gain * 0.003)
      consumed_organism_id = target_prey.id
    }
  }

  energy = Math.min(energy, MAX_ENERGY)

  return {
    organism: {
      ...organism,
      x,
      y,
      angle,
      energy: Math.max(0, energy),
      size,
      age: organism.age + delta_time
    },
    consumed_food_id,
    consumed_organism_id
  }
}

export function advanceWorld(
  world: World,
  delta_time: number
): World {
  const remaining_food = [...world.food]
  const surviving_organisms: Organism[] = []
  const consumed_organism_ids = new Set<number>()

  let next_entity_id = world.next_entity_id

  for (const organism of world.organisms) {
    if (consumed_organism_ids.has(organism.id)) {
      continue
    }

    if (organism.energy <= 0) {
      surviving_organisms.push(organism)
      continue
    }

    const available_organisms = world.organisms.filter(
      (candidate) =>
        candidate.energy > 0 &&
        !consumed_organism_ids.has(candidate.id)
    )

    const result = updateOrganism(
      organism,
      remaining_food,
      available_organisms,
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

    if (result.consumed_organism_id !== null) {
      consumed_organism_ids.add(result.consumed_organism_id)

      const previous_prey_index = surviving_organisms.findIndex(
        (candidate) => candidate.id === result.consumed_organism_id
      )

      if (previous_prey_index !== -1) {
        surviving_organisms.splice(previous_prey_index, 1)
      }
    }

    surviving_organisms.push(result.organism)
  }

  const initial_population = surviving_organisms.length

  for (let i = 0; i < initial_population; i++) {
    const living_population = surviving_organisms.filter(
      (organism) => organism.energy > 0
    ).length

    if (living_population >= MAX_POPULATION) {
      break
    }

    const parent = surviving_organisms[i]

    if (
      !parent ||
      parent.energy <= 0 ||
      parent.energy < REPRODUCTION_RULES[parent.species]
    ) {
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
      size: parent.size,
      species: parent.species,
      genome: mutateGenome(parent.genome)
    }

    surviving_organisms[i] = {
      ...parent,
      energy: REPRODUCTION_ENERGY
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
