
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

const DECOMPOSER_MIN_ENERGY = 30
const DECOMPOSER_REPRODUCTION_COST = 15
const DECOMPOSER_OFFSPRING_ENERGY = 30
const DECOMPOSER_REPRODUCTION_COOLDOWN = 5

const MEALS_PER_WASTE = 5
const WASTE_ENERGY = 20

const REPRODUCTION_RULES: Record<SpeciesType, number> = {
  herbivore: 100,
  omnivore: 170,
  carnivore: 200,
  predator: 200,
  decomposer: 30,
  decomposer_hunter: 130
}

const INITIAL_SPECIES: SpeciesType[] = [
    'herbivore',
    'herbivore',
    'herbivore',
    'herbivore',
    'herbivore',
    'herbivore',
    'herbivore',
    
    'carnivore',
    'carnivore',
    
    'omnivore',
    'omnivore',
    'omnivore',
    
    'predator',
    
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    'decomposer',
    
    'decomposer_hunter',
    'decomposer_hunter',
    'decomposer_hunter'
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
      genome: createGenome(definition.genome),
      reproduction_cooldown: 0,
      meals_since_waste: 0
    }

    world.organisms.push(organism)
  }

  for (let i = 0; i < 50; i++) {
    const food: Food = {
      id: world.next_entity_id++,
      x: randomPosition(width),
      y: randomPosition(height),
      energy: 25,
      kind: 'food'
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
    if (item.kind === 'waste') {
      continue
    }

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

function findNearestWaste(
  organism: Organism,
  food: Food[]
): Food | null {
  if (organism.species !== 'decomposer') {
    return null
  }

  let nearest_waste: Food | null = null
  let closest_distance = organism.genome.vision

  for (const item of food) {
    if (item.kind !== 'waste') {
      continue
    }

    const distance = distanceBetween(
      organism.x,
      organism.y,
      item.x,
      item.y
    )

    if (distance < closest_distance) {
      closest_distance = distance
      nearest_waste = item
    }
  }

  return nearest_waste
}


function findNearestPrey(
    organism: Organism,
    organisms: Organism[]
  ): Organism | null {
    if (organism.species === 'herbivore') {
      return null
    }
  
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
  
      if (
        organism.species === 'decomposer_hunter' &&
        candidate.species !== 'decomposer'
      ) {
        continue
      }
  
      if (
        (organism.species === 'carnivore' ||
          organism.species === 'predator' ||
          organism.species === 'omnivore') &&
        candidate.species === 'decomposer'
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
  

function findNearestCorpse(
  organism: Organism,
  organisms: Organism[]
): Organism | null {
  let nearest_corpse: Organism | null = null
  let closest_distance = organism.genome.vision

  for (const candidate of organisms) {
    if (
      candidate.id === organism.id ||
      candidate.energy > 0
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
      nearest_corpse = candidate
    }
  }

  return nearest_corpse
}

function findNearestDecomposerPartner(
  organism: Organism,
  organisms: Organism[]
): Organism | null {
  if (
    organism.species !== 'decomposer' ||
    organism.energy < DECOMPOSER_MIN_ENERGY ||
    (organism.reproduction_cooldown ?? 0) > 0
  ) {
    return null
  }

  let nearest_partner: Organism | null = null
  let closest_distance = organism.genome.vision

  for (const candidate of organisms) {
    if (
      candidate.id === organism.id ||
      candidate.species !== 'decomposer' ||
      candidate.energy < DECOMPOSER_MIN_ENERGY ||
      (candidate.reproduction_cooldown ?? 0) > 0
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
      nearest_partner = candidate
    }
  }

  return nearest_partner
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
  waste_count: number
} {
  const definition = SPECIES[organism.species]

  const nearest_food =
    definition.diet === 'food' || definition.diet === 'both'
      ? findNearestFood(organism, food)
      : null

  const nearest_waste = findNearestWaste(organism, food)

  const nearest_prey =
    definition.diet === 'organisms' ||
    definition.diet === 'both' ||
    definition.diet === 'decomposers'
      ? findNearestPrey(organism, organisms)
      : null

  const nearest_corpse =
    definition.diet === 'dead'
      ? findNearestCorpse(organism, organisms)
      : null

  const nearest_partner = findNearestDecomposerPartner(
    organism,
    organisms
  )

  let target_food: Food | null = nearest_food
  let target_waste: Food | null = nearest_waste
  let target_prey: Organism | null = null
  let target_corpse: Organism | null = nearest_corpse
  let target_partner: Organism | null = nearest_partner

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

  const target =
    target_partner ??
    target_prey ??
    target_corpse ??
    target_waste ??
    target_food

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

  if (target_waste) {
    const distance_to_waste = distanceBetween(
      x,
      y,
      target_waste.x,
      target_waste.y
    )

    if (distance_to_waste <= EATING_DISTANCE + size) {
      energy += target_waste.energy
      size = Math.min(MAX_SIZE, size + target_waste.energy * 0.002)
      consumed_food_id = target_waste.id
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

  if (target_corpse) {
    const distance_to_corpse = distanceBetween(
      x,
      y,
      target_corpse.x,
      target_corpse.y
    )

    if (distance_to_corpse <= EATING_DISTANCE + size + target_corpse.size) {
      const energy_gain = 25 + target_corpse.size * 8

      energy += energy_gain
      size = Math.min(MAX_SIZE, size + energy_gain * 0.0015)
      consumed_organism_id = target_corpse.id
    }
  }

  energy = Math.min(energy, MAX_ENERGY)

  const meals_eaten =
    Number(consumed_food_id !== null) +
    Number(consumed_organism_id !== null)

  const total_meals =
    (organism.meals_since_waste ?? 0) + meals_eaten

  const waste_count = Math.floor(total_meals / MEALS_PER_WASTE)
  const meals_since_waste = total_meals % MEALS_PER_WASTE

  return {
    organism: {
      ...organism,
      x,
      y,
      angle,
      energy: Math.max(0, energy),
      size,
      age: organism.age + delta_time,
      reproduction_cooldown: Math.max(
        0,
        (organism.reproduction_cooldown ?? 0) - delta_time
      ),
      meals_since_waste
    },
    consumed_food_id,
    consumed_organism_id,
    waste_count
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

    for (let i = 0; i < result.waste_count; i++) {
      remaining_food.push({
        id: next_entity_id++,
        x: result.organism.x + (Math.random() * 8 - 4),
        y: result.organism.y + (Math.random() * 8 - 4),
        energy: WASTE_ENERGY,
        kind: 'waste'
      })
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
      parent.species === 'decomposer' ||
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
      genome: mutateGenome(parent.genome),
      reproduction_cooldown: 0,
      meals_since_waste: 0
    }

    surviving_organisms[i] = {
      ...parent,
      energy: REPRODUCTION_ENERGY
    }

    surviving_organisms.push(offspring)
  }

  const decomposers = surviving_organisms.filter(
    (organism) =>
      organism.species === 'decomposer' &&
      organism.energy >= DECOMPOSER_MIN_ENERGY &&
      (organism.reproduction_cooldown ?? 0) <= 0
  )

  const reproduced_decomposers = new Set<number>()

  for (const first of decomposers) {
    const living_population = surviving_organisms.filter(
      (organism) => organism.energy > 0
    ).length

    if (living_population >= MAX_POPULATION) {
      break
    }

    if (reproduced_decomposers.has(first.id)) {
      continue
    }

    const second = decomposers.find((candidate) => {
      if (
        candidate.id === first.id ||
        reproduced_decomposers.has(candidate.id)
      ) {
        return false
      }

      const current_first = surviving_organisms.find(
        (organism) => organism.id === first.id
      )

      const current_second = surviving_organisms.find(
        (organism) => organism.id === candidate.id
      )

      if (
        !current_first ||
        !current_second ||
        current_first.energy < DECOMPOSER_MIN_ENERGY ||
        current_second.energy < DECOMPOSER_MIN_ENERGY ||
        (current_first.reproduction_cooldown ?? 0) > 0 ||
        (current_second.reproduction_cooldown ?? 0) > 0
      ) {
        return false
      }

      return distanceBetween(
        current_first.x,
        current_first.y,
        current_second.x,
        current_second.y
      ) <= current_first.size + current_second.size
    })

    if (!second) {
      continue
    }

    const first_index = surviving_organisms.findIndex(
      (organism) => organism.id === first.id
    )

    const second_index = surviving_organisms.findIndex(
      (organism) => organism.id === second.id
    )

    if (first_index === -1 || second_index === -1) {
      continue
    }

    const current_first = surviving_organisms[first_index]
    const current_second = surviving_organisms[second_index]

    if (!current_first || !current_second) {
      continue
    }

    surviving_organisms[first_index] = {
      ...current_first,
      energy: current_first.energy - DECOMPOSER_REPRODUCTION_COST,
      reproduction_cooldown: DECOMPOSER_REPRODUCTION_COOLDOWN
    }

    surviving_organisms[second_index] = {
      ...current_second,
      energy: current_second.energy - DECOMPOSER_REPRODUCTION_COST,
      reproduction_cooldown: DECOMPOSER_REPRODUCTION_COOLDOWN
    }

    const offspring_angle = Math.random() * Math.PI * 2
    const offspring_distance = current_first.size + current_second.size + 4

    const offspring: Organism = {
      id: next_entity_id++,
      x: Math.max(
        0,
        Math.min(
          world.width,
          (current_first.x + current_second.x) / 2 +
            Math.cos(offspring_angle) * offspring_distance
        )
      ),
      y: Math.max(
        0,
        Math.min(
          world.height,
          (current_first.y + current_second.y) / 2 +
            Math.sin(offspring_angle) * offspring_distance
        )
      ),
      angle: Math.random() * Math.PI * 2,
      energy: DECOMPOSER_OFFSPRING_ENERGY,
      age: 0,
      generation: Math.max(
        current_first.generation,
        current_second.generation
      ) + 1,
      size: (current_first.size + current_second.size) / 2,
      species: 'decomposer',
      genome: mutateGenome(current_first.genome),
      reproduction_cooldown: DECOMPOSER_REPRODUCTION_COOLDOWN,
      meals_since_waste: 0
    }

    surviving_organisms.push(offspring)

    reproduced_decomposers.add(first.id)
    reproduced_decomposers.add(second.id)
  }

  let food_spawn_timer = world.food_spawn_timer

  const normal_food_count = remaining_food.filter(
    (item) => item.kind !== 'waste'
  ).length

  if (normal_food_count < MAX_FOOD) {
    food_spawn_timer += delta_time

    if (food_spawn_timer >= FOOD_SPAWN_INTERVAL) {
      const amount = Math.min(
        FOOD_SPAWN_AMOUNT,
        MAX_FOOD - normal_food_count
      )

      for (let i = 0; i < amount; i++) {
        remaining_food.push({
          id: next_entity_id++,
          x: randomPosition(world.width),
          y: randomPosition(world.height),
          energy: 25,
          kind: 'food'
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
