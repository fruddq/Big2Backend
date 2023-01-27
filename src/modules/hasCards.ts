import type { PlayerCards } from './PlayerCards'

export const hasCards = (playerHand: PlayerCards, playedCards: PlayerCards) => {
  return playedCards.every((card) =>
    playerHand.some((handCard) => card.value === handCard.value && card.suit === handCard.suit),
  )
}
