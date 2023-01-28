import type { PlayerCards, ValidSuit, ValidValue } from './PlayerCards.js'
import {
  checkPair,
  checktripple,
  getFlushValue,
  getFourOfAKindValue,
  getFullHouseValue,
  getStraightValue,
} from './pokerRules.js'

// should only accept array of VALID cards and no duplucates of cards.
export const getTotalValue = (arrayOfCards: PlayerCards) => {
  if (arrayOfCards.length === 0) {
    return 0
  }

  const valuesArray: ValidValue[] = []
  const suitsArray: ValidSuit[] = []

  arrayOfCards.forEach((card) => {
    valuesArray.push(card.value)
    suitsArray.push(card.suit)
  })

  valuesArray.sort((a, b) => a - b)

  const totalValueOfSuits = suitsArray.reduce((accumulator, suit) => accumulator + suit)

  if (valuesArray.length === 1 || checkPair(valuesArray) === true || checktripple(valuesArray) === true) {
    if (valuesArray[0] !== 1 && valuesArray[0] !== 2) {
      return valuesArray[0]! * 10 + totalValueOfSuits
    }
    if (valuesArray[0] === 1) {
      return totalValueOfSuits + 200
    }
    if (valuesArray[0] === 2) {
      return totalValueOfSuits + 300
    }
  }

  let straightFlush = false

  if (getStraightValue(valuesArray, suitsArray) && getFlushValue(valuesArray, suitsArray)) {
    straightFlush = true
  }

  if (valuesArray.length === 5) {
    return straightFlush
      ? suitsArray[0]! * 100 + getStraightValue(valuesArray, suitsArray) + 700
      : getStraightValue(valuesArray, suitsArray) +
          getFlushValue(valuesArray, suitsArray) +
          getFullHouseValue(valuesArray) +
          getFourOfAKindValue(valuesArray)
  }

  // @TODO test this
  if (valuesArray.length === 4 && getFourOfAKindValue(valuesArray)) {
    return getFourOfAKindValue(valuesArray)
  }

  return 0
}

/// /////////// Card wieght//////////////
//                          Min  high
// singlePairTripplets	    31	 310  Highest card*10 + sum(suitvalues) (+200 if Ace, + 300 if Two)
// straight	                26   75  Highest card(accounted for ace) * 5 + suitof highest card
// flush	                108	 515 Suit of highest card*100 + highest card ( special rules for ace and two)
// fullHouse	            603	 615 triplearray[0]+600( will take the value that is triple)
// fourOfAKind	            703	 715 triplearray[0]+700
// straightFlush	        805  1214 Suit of highest card*100 + highest card + 700
/// /// Since length of cards must be true we only have to check difference in 5 card plays and singlePairTriplets seperatly////
