import type { Player, TableGames } from '../DB/models'

export const getPlayer = (game: TableGames, userName: string): Player | undefined => {
  return (Object.values(game.players) as Player[]).find((player) => player.userName === userName)
}
