import type { Player, PlayerKey, TableGames } from '../DB/models'

export const getPlayerKey = (game: TableGames, player: Player): PlayerKey | undefined => {
  return Object.keys(game.players).find((key) => game.players[key as PlayerKey] === player) as PlayerKey
}
