import { describe, it } from 'vitest'
import { getNextPlayerTurn } from '../modules/getNextPlayerTurn'

describe.only('defaults', () => {
  const players1 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: true, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }

  const players2 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: true, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }

  const players3 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: true, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }

  const players4 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players5 = {
    playerOne: { userName: 'frudd', roundPass: true, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players6 = {
    playerOne: { userName: 'frudd', roundPass: true, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: true, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: true, score: 0, playerTurn: false, won: false },
  }

  const players7 = {
    playerOne: { userName: 'frudd', roundPass: true, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: true, won: false },
    playerFour: { userName: 'Olof', roundPass: true, score: 0, playerTurn: false, won: false },
  }

  const players8 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: true, won: false },
    playerTwo: { userName: 'Nani', roundPass: true, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: true, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }

  const players9 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players10 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: true, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }

  const players11 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: true, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }

  const players12 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: true },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players13 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: true },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players14 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: true, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players15 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: true },
    playerTwo: { userName: 'Nani', roundPass: true, score: 0, playerTurn: false, won: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players16 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false, won: false },
    playerTwo: { userName: 'Nani', roundPass: true, score: 0, playerTurn: false, won: true },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: true },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true, won: false },
  }

  const players17 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: true, won: false },
    playerTwo: { userName: 'Nani', roundPass: true, score: 0, playerTurn: false, won: true },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false, won: true },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false, won: false },
  }
  // @TODO describe each expect and what it is testing
  it.concurrent('returns next player correctly', ({ expect }) => {
    expect(getNextPlayerTurn(players1)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players2)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players3)).toMatchInlineSnapshot('"playerFour"')
    expect(getNextPlayerTurn(players4)).toMatchInlineSnapshot('"playerOne"')
    expect(getNextPlayerTurn(players5)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players6)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players7)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players8)).toMatchInlineSnapshot('"playerFour"')
    expect(getNextPlayerTurn(players9)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players10)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players11)).toMatchInlineSnapshot('"playerFour"')
    expect(getNextPlayerTurn(players12)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players13)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players14)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players15)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players16)).toMatchInlineSnapshot('"playerOne"')
    expect(getNextPlayerTurn(players17)).toMatchInlineSnapshot('"playerFour"')
  })
  console.log(getNextPlayerTurn(players10))
})
