import type { Player, TableGames } from '../DB/models'

export const getPlayer = (game: TableGames, userName: string): Player => {
  const result = (Object.values(game.players) as Player[]).find((player) => player.userName === userName)
  if (!result) {
    throw new Error('Player not in game')
  }

  return result
}
