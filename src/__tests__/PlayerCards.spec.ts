import { describe, it } from 'vitest'
import { Card, defaults, PlayerCards } from '../modules/PlayerCards'

describe.concurrent('defaults', () => {
  it.concurrent('should have valid values', ({ expect }) => {
    expect(defaults.values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  })

  it.concurrent('should have valid suits', ({ expect }) => {
    expect(defaults.suits).toEqual([1, 2, 3, 5])
  })
})

describe.concurrent('Card type', () => {
  it.concurrent('should have a value property', ({ expect }) => {
    const card: Card = { value: 1, suit: 1 }
    expect(card).toHaveProperty('value')
  })

  it.concurrent('should have a suit property', ({ expect }) => {
    const card: Card = { value: 1, suit: 1 }
    expect(card).toHaveProperty('suit')
  })

  it.concurrent('value should be a valid value', ({ expect }) => {
    const card: Card = { value: 11, suit: 1 }
    expect(defaults.values).toContain(card.value)
  })

  it.concurrent('suit should be a valid suit', ({ expect }) => {
    const card: Card = { value: 1, suit: 5 }
    expect(defaults.suits).toContain(card.suit)
  })

  it.concurrent('should not accept an invalid value', ({ expect }) => {
    const card: Card = { value: 14, suit: 1 }
    expect(defaults.values).not.toContain(card.value)
  })

  it.concurrent('should not accept an invalid suit', ({ expect }) => {
    const card: Card = { value: 1, suit: 4 }
    expect(defaults.suits).not.toContain(card.suit)
  })
})

describe.concurrent('PlayerCards type', () => {
  it.concurrent('should be an array', ({ expect }) => {
    const cards: PlayerCards = []
    expect(Array.isArray(cards)).toBe(true)
  })

  it.concurrent('should contain only valid Card objects', ({ expect }) => {
    const cards: PlayerCards = [
      { value: 1, suit: 1 },
      { value: 11, suit: 2 },
      { value: 13, suit: 5 },
    ]
    for (const card of cards) {
      expect(defaults.values).toContain(card.value)
      expect(defaults.suits).toContain(card.suit)
    }
  })

  it.concurrent('should not accept an array containing an invalid Card object', ({ expect }) => {
    const cards: PlayerCards = [
      { value: 1, suit: 1 },
      { value: 11, suit: 2 },
      { value: 13, suit: 5 },
      { value: 15, suit: 4 }, // invalid value
      { value: 1, suit: 6 }, // invalid suit
    ]
    expect(() => {
      for (const card of cards) {
        expect(defaults.values).toContain(card.value)
        expect(defaults.suits).toContain(card.suit)
      }
    }).toThrow()
  })
})
