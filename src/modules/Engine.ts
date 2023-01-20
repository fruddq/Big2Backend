import { defaults, PlayerCards } from './PlayerCards.js'

export class Engine {
  playersCards: {
    playerOneCards: PlayerCards
    playerTwoCards: PlayerCards
    playerThreeCards: PlayerCards
    playerFourCards: PlayerCards
  }

  /**
   * Engine for Big2
   * @returns {object}
   */
  constructor() {
    const deck = this.createDeck()
    const shuffledDeck = this.shuffleDeck(deck)
    // const playerCards = this.dealCards(shuffledDeck)
    const playerCards = this.dealCards(deck)

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
    const playerOneCards: PlayerCards = deckCopy.slice(0, 13)
    const playerTwoCards: PlayerCards = deckCopy.slice(13, 26)
    const playerThreeCards: PlayerCards = deckCopy.slice(26, 39)
    const playerFourCards: PlayerCards = deckCopy.slice(39)
    return { playerOneCards, playerTwoCards, playerThreeCards, playerFourCards }
  }
}
