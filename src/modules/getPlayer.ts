import type { Player, TableGames } from '../DB/models'

export function getPlayer(game: TableGames, userName: string): Player | undefined {
  return (Object.values(game.players) as Player[]).find((player) => player.userName === userName)
}
