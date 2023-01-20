import { describe, it } from 'vitest'
import {
  checkPair,
  checktripple,
  getFlushValue,
  getFourOfAKindValue,
  getFullHouseValue,
  getStraightValue,
} from '../modules/pokerRules'

describe.concurrent('pokerRulesFunctions', () => {
  describe.concurrent('checkPair', () => {
    it.concurrent('returns true for pairs', ({ expect }) => {
      for (let i = 1; i < 14; i++) {
        expect(checkPair([i, i])).toBe(true)
      }
    })

    it.concurrent('returns false when there is no pair', ({ expect }) => {
      ;[[1], [1, 2], [2, 3], [1, 1, 1], [7, 7, 7, 7], [10, 10, 10, 10, 11], [10, 10, 10, 10, 11, 12]].forEach(
        (testValue) => {
          expect(checkPair(testValue)).toBe(false)
        },
      )
    })
  })

  describe.concurrent('checkTripple', () => {
    it.concurrent('returns true for tripples', ({ expect }) => {
      for (let i = 1; i < 14; i++) {
        expect(checktripple([i, i, i])).toBe(true)
      }
    })

    it.concurrent('returns false when there is no tripple', ({ expect }) => {
      ;[
        [1],
        [1, 1],
        [2, 3],
        [1, 1, 3],
        [7, 10, 13],
        [7, 7, 7, 7],
        [10, 10, 10, 10, 11],
        [10, 10, 10, 10, 11, 11],
      ].forEach((testValue) => {
        expect(checktripple(testValue)).toBe(false)
      })
    })
  })

  describe.concurrent('getStraightValue', () => {
    it.concurrent('returns correct straight value', ({ expect }) => {
      const suits = [1, 2, 3, 5]
      for (let i = 1; i < 10; i++) {
        const array = [i, i + 1, i + 2, i + 3, i + 4]
        suits.forEach((suit) => {
          expect(getStraightValue(array, [1, 3, 1, 2, suit])).toBe(array[4]! * 5 + suit)
        })
      }

      suits.forEach((suit) => {
        expect(getStraightValue([1, 10, 11, 12, 13], [suit, 1, 2, 3, 5])).toBe(70 + suit)
      })
    })

    it.concurrent('returns 0 when there is no straight', ({ expect }) => {
      ;[
        [1, 2, 3, 4, 6],
        [1, 1, 3, 4, 6],
        [2, 3, 5, 7, 8],
        [1, 1, 3, 8, 9],
        [7, 10, 11, 12, 13],
        [7, 7, 7, 7, 1],
        [10, 10, 10, 10, 13],
        [1, 10, 10, 10, 10],
      ].forEach((testArray) => {
        expect(getStraightValue(testArray, [1, 1, 1, 1, 5])).toBe(0)
      })
    })
  })

  describe.concurrent('getFlushValue', () => {
    it.concurrent('returns correct flush value', ({ expect }) => {
      ;[1, 2, 3, 5].forEach((suit) => {
        expect(getFlushValue([5, 10, 11, 12, 13], [suit, suit, suit, suit, suit])).toBe(suit * 100 + 13)

        expect(getFlushValue([1, 10, 11, 12, 13], [suit, suit, suit, suit, suit])).toBe(suit * 100 + 14)

        expect(getFlushValue([1, 2, 11, 12, 13], [suit, suit, suit, suit, suit])).toBe(suit * 100 + 15)
      })
    })

    it.concurrent('returns 0 when there is no flush', ({ expect }) => {
      ;[
        [1, 2, 3, 4, 5],
        [1, 1, 3, 4, 6],
        [2, 3, 5, 7, 8],
        [1, 1, 3, 8, 9],
        [7, 10, 11, 12, 13],
        [7, 7, 7, 7, 1],
        [10, 10, 10, 10, 13],
        [1, 10, 10, 10, 10],
      ].forEach((valuesArray) => {
        ;[
          [1, 1, 1, 1, 2],
          [1, 2, 2, 2, 2],
          [2, 2, 2, 2, 3],
          [3, 3, 3, 5, 5],
          [1, 3, 5, 5, 5],
          [3, 3, 5, 5, 5],
        ].forEach((suitsArray) => {
          expect(getFlushValue(valuesArray, suitsArray)).toBe(0)
        })
      })
    })
  })

  describe.concurrent('getFullHouseValue', () => {
    it.concurrent('returns correct full house value', ({ expect }) => {
      for (let i = 3; i < 13; i++) {
        expect(getFullHouseValue([i, i, i, i + 1, i + 1])).toBe(600 + i)
        expect(getFullHouseValue([i - 1, i - 1, i, i, i])).toBe(600 + i)
      }

      expect(getFullHouseValue([13, 13, 13, 2, 2])).toBe(613)
      expect(getFullHouseValue([1, 1, 1, 2, 2])).toBe(614)
      expect(getFullHouseValue([2, 2, 2, 1, 1])).toBe(615)
      expect(getFullHouseValue([1, 1, 2, 2, 2])).toBe(615)
    })

    it.concurrent('returns 0 when there is no fullHouse', ({ expect }) => {
      ;[
        [1, 1, 1, 4, 6],
        [1, 1, 3, 3, 6],
        [2, 2, 2, 2, 8],
        [1, 2, 8, 8, 8],
        [7, 10, 11, 12, 13],
        [7, 7, 7, 7, 1],
        [9, 10, 11, 12, 13],
        [1, 10, 10, 10, 10],
      ].forEach((testArray) => {
        expect(getFullHouseValue(testArray)).toBe(0)
      })
    })
  })

  describe.concurrent('getFourOfAKindValue', () => {
    it.concurrent('returns correct four of a kind value', ({ expect }) => {
      for (let i = 3; i < 13; i++) {
        expect(getFourOfAKindValue([i, i, i, i, i + 1])).toBe(700 + i)
        expect(getFourOfAKindValue([i - 1, i, i, i, i])).toBe(700 + i)
      }

      expect(getFourOfAKindValue([13, 13, 13, 13, 2])).toBe(713)
      expect(getFourOfAKindValue([1, 1, 1, 1, 2])).toBe(714)
      expect(getFourOfAKindValue([2, 2, 2, 2, 3])).toBe(715)
      expect(getFourOfAKindValue([1, 2, 2, 2, 2])).toBe(715)
    })

    it.concurrent('returns 0 when there is no four of a kind', ({ expect }) => {
      ;[
        [1, 1, 1, 4, 6],
        [1, 1, 3, 3, 6],
        [2, 2, 7, 8, 8],
        [1, 2, 8, 8, 8],
        [7, 10, 11, 12, 13],
        [7, 7, 7, 3, 1],
        [9, 10, 11, 12, 13],
        [1, 1, 10, 10, 10],
      ].forEach((testArray) => {
        expect(getFourOfAKindValue(testArray)).toBe(0)
      })
    })
  })
})
