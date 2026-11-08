
import type { Organism } from '../entities/organism'
import type { Food } from '../entities/food'

export interface World {
  width: number
  height: number
  tick: number
  organisms: Organism[]
  food: Food[]
  next_entity_id: number
}

export function createWorld(
  width: number,
  height: number
): World {
  return {
    width,
    height,
    tick: 0,
    organisms: [],
    food: [],
    next_entity_id: 1
  }
}
