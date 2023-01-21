import { describe, it } from 'vitest'
import { getNextPlayerTurn } from '../modules/getNextPlayerTurn'

describe.only('defaults', () => {
  const players1 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: true },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false },
  }

  const players2 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: true },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false },
  }

  const players3 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: true },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false },
  }

  const players4 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true },
  }

  const players5 = {
    playerOne: { userName: 'frudd', roundPass: true, score: 0, playerTurn: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: true },
  }

  const players6 = {
    playerOne: { userName: 'frudd', roundPass: true, score: 0, playerTurn: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: true },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: false },
    playerFour: { userName: 'Olof', roundPass: true, score: 0, playerTurn: false },
  }

  const players7 = {
    playerOne: { userName: 'frudd', roundPass: true, score: 0, playerTurn: false },
    playerTwo: { userName: 'Nani', roundPass: false, score: 0, playerTurn: false },
    playerThree: { userName: 'Jens', roundPass: false, score: 0, playerTurn: true },
    playerFour: { userName: 'Olof', roundPass: true, score: 0, playerTurn: false },
  }

  const players8 = {
    playerOne: { userName: 'frudd', roundPass: false, score: 0, playerTurn: true },
    playerTwo: { userName: 'Nani', roundPass: true, score: 0, playerTurn: false },
    playerThree: { userName: 'Jens', roundPass: true, score: 0, playerTurn: false },
    playerFour: { userName: 'Olof', roundPass: false, score: 0, playerTurn: false },
  }

  it.concurrent('returns next player correctly', ({ expect }) => {
    expect(getNextPlayerTurn(players1)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players2)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players3)).toMatchInlineSnapshot('"playerFour"')
    expect(getNextPlayerTurn(players4)).toMatchInlineSnapshot('"playerOne"')
    expect(getNextPlayerTurn(players5)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players6)).toMatchInlineSnapshot('"playerThree"')
    expect(getNextPlayerTurn(players7)).toMatchInlineSnapshot('"playerTwo"')
    expect(getNextPlayerTurn(players8)).toMatchInlineSnapshot('"playerFour"')
  })
})
