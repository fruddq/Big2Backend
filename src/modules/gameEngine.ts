import { Card, defaults, PlayerCards } from './PlayerCards.js'

export class Engine {
  playersCards: {
    playerOne: PlayerCards
    playerTwo: PlayerCards
    playerThree: PlayerCards
    playerFour: PlayerCards
  }

  /**
   * Engine for Big2
   * @returns {object}
   */
  constructor() {
    const deck = this.createDeck()
    const shuffledDeck = this.shuffleDeck(deck)
    const playerCards = this.dealCards(shuffledDeck)

    this.playersCards = playerCards
  }

  createDeck(): PlayerCards {
    return defaults.values.flatMap((value) => defaults.suits.map((suit) => ({ value, suit })))
  }

  shuffleDeck(deck: PlayerCards): PlayerCards {
    const shuffledDeck = [...deck]
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledDeck[i]!, shuffledDeck[j]!] = [shuffledDeck[j]!, shuffledDeck[i]!]
    }
    return shuffledDeck
  }

  dealCards(deck: PlayerCards) {
    const deckCopy = [...deck]
    const playerOne: PlayerCards = deckCopy.slice(0, 13)
    const playerTwo: PlayerCards = deckCopy.slice(13, 26)
    const playerThree: PlayerCards = deckCopy.slice(26, 39)
    const playerFour: PlayerCards = deckCopy.slice(39)
    return { playerOne, playerTwo, playerThree, playerFour }
  }
}

const engine = new Engine()

console.log(engine.playersCards)
