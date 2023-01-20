import { beforeAll, describe, it } from 'vitest'
import { Engine } from '../modules/Engine.js'
import { defaults } from '../modules/PlayerCards.js'

describe.concurrent('Engine', () => {
  let engine: Engine

  beforeAll(() => {
    engine = new Engine()
  })

  it.concurrent('should instantiate the class correctly', ({ expect }) => {
    expect(engine).toBeInstanceOf(Engine)
  })

  it.concurrent('should correctly assign playerCards after instantiation', ({ expect }) => {
    expect(engine.playersCards).toBeDefined()
    expect(engine.playersCards.playerOneCards.length).toBe(13)
    expect(engine.playersCards.playerTwoCards.length).toBe(13)
    expect(engine.playersCards.playerThreeCards.length).toBe(13)
    expect(engine.playersCards.playerFourCards.length).toBe(13)
  })

  describe.concurrent('createDeck', () => {
    it.concurrent('should create a deck of 52 cards', ({ expect }) => {
      const deck = engine.createDeck()
      expect(deck.length).toBe(52)
    })

    it.concurrent('should contain valid card objects', ({ expect }) => {
      const deck = engine.createDeck()
      for (const card of deck) {
        expect(defaults.values).toContain(card.value)
        expect(defaults.suits).toContain(card.suit)
      }
    })
  })

  // @TODO change to infinite iterations
  describe.skip('shuffleDeck', () => {
    it('should shuffle the deck', ({ expect }) => {
      let cardsFromEngine = engine.playersCards
      let freshDeck = engine.createDeck()
      let shuffledDeck = [
        ...cardsFromEngine.playerOneCards,
        ...cardsFromEngine.playerTwoCards,
        ...cardsFromEngine.playerThreeCards,
        ...cardsFromEngine.playerFourCards,
      ]

      while (shuffledDeck === freshDeck) {
        cardsFromEngine = engine.playersCards
        freshDeck = engine.createDeck()
        shuffledDeck = [
          ...cardsFromEngine.playerOneCards,
          ...cardsFromEngine.playerTwoCards,
          ...cardsFromEngine.playerThreeCards,
          ...cardsFromEngine.playerFourCards,
        ]
      }

      expect(shuffledDeck).not.toEqual(freshDeck)
    })

    it.concurrent('should not change the length of the deck', ({ expect }) => {
      const deck = engine.createDeck()
      const shuffledDeck = engine.shuffleDeck(deck)
      expect(shuffledDeck.length).toBe(deck.length)
    })
  })

  describe.concurrent('dealCards', () => {
    it.concurrent('should deal 13 cards to each player', ({ expect }) => {
      const deck = engine.createDeck()
      const shuffledDeck = engine.shuffleDeck(deck)
      const playerCards = engine.dealCards(shuffledDeck)
      expect(playerCards.playerOneCards.length).toBe(13)
      expect(playerCards.playerTwoCards.length).toBe(13)
      expect(playerCards.playerThreeCards.length).toBe(13)
      expect(playerCards.playerFourCards.length).toBe(13)
    })

    it.concurrent('should not overlap cards between players', ({ expect }) => {
      const deck = engine.createDeck()
      const shuffledDeck = engine.shuffleDeck(deck)
      const playerCards = engine.dealCards(shuffledDeck)
      const allPlayerCards = [
        ...playerCards.playerOneCards,
        ...playerCards.playerTwoCards,
        ...playerCards.playerThreeCards,
        ...playerCards.playerFourCards,
      ]
      expect(allPlayerCards.length).toBe(52)
      expect(new Set(allPlayerCards).size).toBe(52)
    })

    it.concurrent('should not return the original deck', ({ expect }) => {
      const deck = engine.createDeck()
      const shuffledDeck = engine.shuffleDeck(deck)
      const playerCards = engine.dealCards(shuffledDeck)
      expect(shuffledDeck).not.toEqual(playerCards)
    })
  })
})
