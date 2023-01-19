import type { PlayerCards } from './PlayerCards'
import lodash from 'lodash'

export const isStartingPlayer = (playerCards: PlayerCards) => {
  return lodash.find(playerCards, (card) => card.value === 3 && card.suit === 1) !== undefined
}
