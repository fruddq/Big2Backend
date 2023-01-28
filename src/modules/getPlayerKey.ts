import type { Player, PlayerKey, TableGames } from '../DB/models'

export const getPlayerKey = (game: TableGames, player: Player): PlayerKey => {
  const result = Object.keys(game.players).find((key) => game.players[key as PlayerKey] === player) as PlayerKey
  if (!result) {
    throw new Error('Player key not found, should not happen')
  }
  return result
}
