import type { PlayerCards } from './PlayerCards'

export const removePlayedCards = (playerHand: PlayerCards, playedCards: PlayerCards) => {
  return playerHand.filter((card) => {
    return !playedCards.some((c) => c.value === card.value && c.suit === card.suit)
  })
}
