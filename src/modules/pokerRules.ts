import type { ValidValue, ValidSuit } from './PlayerCards.js'

export const checkPair = (valuesArray: ValidValue[]) => valuesArray.length === 2 && valuesArray[0] === valuesArray[1]

export const checktripple = (valuesArray: ValidValue[]) =>
  valuesArray.length === 3 && valuesArray[0] === valuesArray[1] && valuesArray[1] === valuesArray[2]

export const getStraightValue = (valuesArray: ValidValue[], suitsArray: ValidSuit[]) => {
  let suitOfHighestCard = suitsArray[valuesArray.indexOf(Math.max(...valuesArray))]

  const valuesArrayCopy = [...valuesArray]
  if (
    valuesArray[0] === 1 &&
    valuesArray[1] === 10 &&
    valuesArray[2] === 11 &&
    valuesArray[3] === 12 &&
    valuesArray[4] === 13
  ) {
    valuesArrayCopy[0] = 14
    ;[suitOfHighestCard] = suitsArray
    valuesArrayCopy.sort((a, b) => a - b)
  }

  const straight = valuesArrayCopy.every((value, index) => {
    return index < 4 ? valuesArrayCopy[index + 1]! - value === 1 : true
  })

  return straight ? valuesArrayCopy[4]! * 5 + suitOfHighestCard! : 0
}

export const getFlushValue = (valuesArray: ValidValue[], suitsArray: ValidSuit[]) => {
  if (valuesArray.length !== 5 || suitsArray.length !== 5) {
    return 0
  }

  const flush = suitsArray.every((suit) => suit === suitsArray[0])

  if (flush) {
    if (valuesArray.includes(2)) {
      return suitsArray[0]! * 100 + 15
    }
    if (valuesArray.includes(1)) {
      return suitsArray[0]! * 100 + 14
    }
    return suitsArray[0]! * 100 + Math.max(...valuesArray)
  }
  return 0
}

export const getFullHouseValue = (valuesArray: ValidValue[]) => {
  if (valuesArray.length !== 5) {
    return 0
  }

  if (valuesArray[0] === valuesArray[1] && valuesArray[1] === valuesArray[2] && valuesArray[3] === valuesArray[4]) {
    if (valuesArray[0] === 1) {
      return 614
    }
    if (valuesArray[0] === 2) {
      return 615
    }
    return valuesArray[0]! + 600
  }

  if (valuesArray[0] === valuesArray[1] && valuesArray[2] === valuesArray[3] && valuesArray[3] === valuesArray[4]) {
    if (valuesArray[4] === 2) {
      return 615
    }
    return valuesArray[4]! + 600
  }
  return 0
}

export const getFourOfAKindValue = (valuesArray: ValidValue[]) => {
  if (valuesArray.length < 4 || valuesArray.length > 5) {
    return 0
  }

  if (valuesArray[0] === valuesArray[1] && valuesArray[1] === valuesArray[2] && valuesArray[2] === valuesArray[3]) {
    if (valuesArray[0] === 1) {
      return 714
    }
    if (valuesArray[0] === 2) {
      return 715
    }
    return valuesArray[0]! + 700
  }

  if (valuesArray[1] === valuesArray[2] && valuesArray[2] === valuesArray[3] && valuesArray[3] === valuesArray[4]) {
    if (valuesArray[4] === 2) {
      return 715
    }
    return valuesArray[4]! + 700
  }

  return 0
}
