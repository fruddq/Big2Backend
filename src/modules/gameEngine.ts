import { Console } from 'console'
import type { Card, PlayerCards } from './PlayerCards'

export class Engine {
  players: {
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
    this.players = {
      playerOne: [],
      playerTwo: [],
      playerThree: [],
      playerFour: [],
    }
  }

  addCard(card: Card) {
    this.players.playerOne.push(card)
  }
}

const engine = new Engine()

console.log(engine)
