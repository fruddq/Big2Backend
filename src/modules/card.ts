export class Card {
  value: number
  suit: number

  constructor(value: number, suit: number) {
    if (value < 1 || value > 13) {
      throw new Error('Value must be between 1-13')
    }

    if (suit < 1 || suit > 5 || suit === 4) {
      throw new Error('Suit must be must be 1,2,3,5')
    }

    this.value = value
    this.suit = suit
  }
}

export const defaults = {
  // 1 = ace ; 11 = jack ; 12 = queen 13 = King
  values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  // 1 = Diamonds ; 2 = Clubs, 3 = Hearts; 5 = Spades
  suits: [1, 2, 3, 5],
}
