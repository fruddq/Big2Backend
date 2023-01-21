import type { Player } from '../DB/models'

interface PlayerExtension {
  [key: string]: Player
}

export const getNextPlayerTurn = (players: PlayerExtension) => {
  const currentPlayer = Object.keys(players).find((key) => !players[key]!.roundPass && players[key]!.playerTurn)
  if (!currentPlayer) {
    return Object.keys(players).find((key) => players[key]!.roundPass === false)
  }
  let nextPlayerIndex = (Object.keys(players).indexOf(currentPlayer) + 1) % Object.keys(players).length
  let nextPlayer = Object.keys(players)[nextPlayerIndex]

  while (nextPlayer && players[nextPlayer]?.roundPass) {
    nextPlayerIndex = (nextPlayerIndex + 1) % Object.keys(players).length
    nextPlayer = Object.keys(players)[nextPlayerIndex]
  }
  return nextPlayer
}
