export interface Food {
    id: number
    x: number
    y: number
    energy: number
    kind?: 'food' | 'waste'
  }