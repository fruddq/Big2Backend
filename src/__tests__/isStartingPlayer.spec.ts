import { describe, it } from 'vitest'
import { isStartingPlayer } from '../modules/isStartingPlayer'
import type { PlayerCards } from '../modules/PlayerCards'

describe.concurrent('isStartingPlayer', () => {
  it.concurrent('should return true if the player has a 3 of diamonds', ({ expect }) => {
    const playerCards = [
      { value: 3, suit: 1 },
      { value: 5, suit: 2 },
    ]
    expect(isStartingPlayer(playerCards)).toBe(true)
  })

  it.concurrent('should return false if the player does not have a 3 of diamonds', ({ expect }) => {
    const playerCards = [
      { value: 2, suit: 1 },
      { value: 5, suit: 2 },
    ]
    expect(isStartingPlayer(playerCards)).toBe(false)
  })

  it.concurrent('should return false if the player has no cards', ({ expect }) => {
    const playerCards: PlayerCards = []
    expect(isStartingPlayer(playerCards)).toBe(false)
  })
})
