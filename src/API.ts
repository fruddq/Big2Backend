import { Sequelize, Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Models as ModelsDB, playedCards, PlayerKey, TableGames } from './DB/models.js'
import { validateUser } from './modules/validateUser.js'
import { isTest } from './config.js'
import { Engine } from './modules/Engine.js'
import { isStartingPlayer } from './modules/isStartingPlayer.js'
import type { PlayerCards } from './modules/PlayerCards.js'
import { getTotalValue } from './modules/getTotalValue.js'
import { validatePointMultiplier } from './modules/validatePointMultiplier.js'
import { getNextPlayerTurn } from './modules/getNextPlayerTurn.js'
import { removePlayedCards } from './modules/removePlayedCards.js'
import { hasCards } from './modules/hasCards.js'
import { getPlayer } from './modules/getPlayer.js'
import { getPlayerKey } from './modules/getPlayerKey.js'

// @TODO add cache based token
export class API {
  DB: Sequelize
  ajv = new Ajv()
  models: ReturnType<typeof ModelsDB['initDB']>

  // this was made like this because it will not be used in constructor
  // the reason it was made was so it could be spied upon in tests
  validators = {
    user: validateUser,
  }

  constructor() {
    // @TODO Change this information depending on test or production
    this.DB = new Sequelize('default_database', 'username', 'password', {
      host: 'localhost',
      dialect: 'postgres',
    })

    addFormats(this.ajv)

    this.models = ModelsDB.initDB(this.DB)
  }

  async initDB() {
    await this.DB.authenticate()
    // True should be isTest
    await this.DB.sync({ force: true })
    return this
  }

  // also delete users that havent logged in in 100 days
  // @TODO LASTCARD
  // asks player how many cards they have left
  // If they have 1 card
  // return true, else return false

  async createUser({
    userName,
    password,
    email,
  }: { readonly userName: string; readonly password: string; readonly email: string }) {
    this.validators.user({ userName, password, email }, this.ajv)

    const existingUser = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })

    const existingEmail = await this.models.Users.findOne({
      where: { email: { [Op.iLike]: email } },
    })

    if (existingUser) {
      throw new Error('User with that name already exists')
    }

    if (existingEmail) {
      throw new Error('User with that email already exists')
    }

    await this.models.Users.create({
      userName,
      password,
      email,
      playerID: uuidv4(),
    })
  }

  async login() {}

  // player needs to login
  // @TODO player should not be able to create more than one table
  // add delete game
  async createGame({
    userName,
    gameName,
    pointMultiplier,
  }: { readonly userName: string; readonly gameName: string; readonly pointMultiplier: number }) {
    const gameExists = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })
    if (!validatePointMultiplier(pointMultiplier)) {
      throw new Error('pointMultiplier must be positive number and dividable by 10')
    }

    if (gameExists) {
      throw new Error('Game name already exists')
    }

    await this.models.Games.create({
      gameName,
      gameOwner: userName,
      pointMultiplier,
    })

    await this.models.Users.update(
      {
        ownedTable: gameName,
        joinedTable: gameName,
      },
      {
        where: { userName: { [Op.iLike]: userName } },
      },
    )
  }

  // If players are already in game, frontend should redirect a player to the game
  // Player cannot access another page on app if inside a game, have to leave game first

  async joinGame({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })
    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const user = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })

    if (!user) {
      throw new Error('User not found, should not happen')
    }

    if (user.dataValues.joinedTable === gameName) {
      throw new Error('User already in game')
    }

    await user.update({
      joinedTable: gameName,
    })
  }

  async assignPlayer({
    seatNumber,
    userName,
    gameName,
  }: { readonly seatNumber: 1 | 2 | 3 | 4; readonly userName: string; readonly gameName: string }) {
    const playerFieldMap: { [key: number]: PlayerKey } = {
      1: 'playerOne',
      2: 'playerTwo',
      3: 'playerThree',
      4: 'playerFour',
    }
    const playerField = `players.${playerFieldMap[seatNumber]}`

    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })
    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const players = game.dataValues.players
    const seat = playerFieldMap[seatNumber]
    if (seat) {
      if (players[seat].userName !== '') {
        throw new Error('Seat taken, choose another position')
      }
    }

    await game.set(`${playerField}.userName`, userName).save()
  }

  // @TODO
  // start game needs to default all the values of the game thats affected.
  // cards dont need to be dafaulted as it replaces all players cards in their seats
  // Need to default playersWon
  // Need to check if gamestarted !== false else throe error game has already started
  async startGame(gameName: string) {
    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const { players } = game.dataValues as TableGames

    for (const player of Object.values(players)) {
      if (player.userName === '') {
        throw new Error('Wait until all seats are filled')
      }
    }

    const engine = new Engine()

    const { playerOneCards, playerTwoCards, playerThreeCards, playerFourCards } = engine.playersCards

    const playersArray = Object.values(players)

    const playerOne = playersArray[0]!.userName
    const playerTwo = playersArray[1]!.userName
    const playerThree = playersArray[2]!.userName
    const playerFour = playersArray[3]!.userName

    await this.models.Users.update({ cards: playerOneCards }, { where: { userName: { [Op.eq]: playerOne } } })
    await this.models.Users.update({ cards: playerTwoCards }, { where: { userName: { [Op.eq]: playerTwo } } })
    await this.models.Users.update({ cards: playerThreeCards }, { where: { userName: { [Op.eq]: playerThree } } })
    await this.models.Users.update({ cards: playerFourCards }, { where: { userName: { [Op.eq]: playerFour } } })

    await game.set('gameStarted', true).save()

    if (isStartingPlayer(playerOneCards)) {
      await game.set('players.playerOne.playerTurn', true).save()
    }
    if (isStartingPlayer(playerTwoCards)) {
      await game.set('players.playerTwo.playerTurn', true).save()
    }
    if (isStartingPlayer(playerThreeCards)) {
      await game.set('players.playerThree.playerTurn', true).save()
    }
    if (isStartingPlayer(playerFourCards)) {
      await game.set('players.playerFour.playerTurn', true).save()
    }
  }

  // play cards function
  // check if the play is valid? Frontend ?

  // then frontend can check if playerWon = 3 then game is over
  // then it knows to block all buttons
  // and also render a new button to play another round
  // also update gamestarted to false. this will make it easier for leave seat
  //

  // There might be a bug when a player tries to play two of the same cards through a manual post request
  async playCards({
    cards,
    gameName,
    userName,
  }: { readonly cards: PlayerCards; readonly gameName: string; readonly userName: string }) {
    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const gameValues = game.dataValues as TableGames
    const { pointMultiplier, winnerNumber, players, playedCards, isFirstPlay, gameStarted } = gameValues

    if (!gameStarted) {
      throw new Error('Game not started')
    }

    const player = getPlayer(gameValues, userName)

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (!player.playerTurn) {
      throw new Error('Not players turn')
    }

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (player.roundPass) {
      throw new Error('Player has already passed this round')
    }

    const valuePlayedCards = getTotalValue(cards)
    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (!valuePlayedCards) {
      throw new Error('Invalid play, against the rules')
    }

    // @TODO CHECK THIS IN FRONTEND AS WELL!

    if (!isStartingPlayer(cards) && isFirstPlay) {
      throw new Error('First play must contain three of diamonds')
    }

    const user = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })

    if (!user) {
      throw new Error('User not found, should not happen')
    }

    const { cards: allPlayerCards } = user?.dataValues as { cards: PlayerCards }

    if (!hasCards(allPlayerCards, cards)) {
      throw new Error('You do not have these cards, stop hacking bro')
    }

    const latestPlayedCards = playedCards[playedCards.length - 1] as playedCards

    if (playedCards?.length > 0) {
      if (latestPlayedCards && getTotalValue(latestPlayedCards.cards) > valuePlayedCards) {
        throw new Error('Invalid play, cards on table has higher value than played cards')
      }
    }

    let bigTwoChop = false
    let fourOfAKindChop = false
    if (valuePlayedCards > 702 && valuePlayedCards < 716 && cards.length === 4) {
      fourOfAKindChop = true
    }

    if (
      latestPlayedCards &&
      latestPlayedCards.cards.length === 1 &&
      latestPlayedCards.cards[0]?.value === 2 &&
      fourOfAKindChop
    ) {
      bigTwoChop = true
    }

    if (
      !bigTwoChop &&
      playedCards?.length > 0 &&
      playedCards[playedCards.length - 1]?.cards &&
      playedCards[playedCards.length - 1]?.cards.length !== cards.length
    ) {
      throw new Error('Invalid play, must have same number of cards as last played cards')
    }

    if (allPlayerCards.length === cards.length && cards[0]!.value === 2 && cards.length < 4 && valuePlayedCards) {
      throw new Error('Invalid play, can not win with single, pair or tripple 2')
    }

    if (isFirstPlay) {
      await game.update({
        isFirstPlay: false,
      })
    }

    const newPlayedCards = [...playedCards]
    newPlayedCards.push({ userName, cards })
    await game.update({
      playedCards: newPlayedCards,
    })

    await user.update({
      cards: removePlayedCards(allPlayerCards, cards),
    })

    const playerKey = getPlayerKey(gameValues, player)

    const nextPlayerKey = getNextPlayerTurn(gameValues.players)
    await game.update({
      [`players.${nextPlayerKey}.playerTurn`]: true,
      [`players.${playerKey}.playerTurn`]: false,
    })

    const currentScore = gameValues.players[playerKey].score

    if (user.dataValues.cards.length === 0) {
      await game.update({
        [`players.${playerKey}.score`]: currentScore + pointMultiplier / winnerNumber,
        [`players.${playerKey}.won`]: true,
        winnerNumber: winnerNumber + 1,
      })

      if (winnerNumber > 2) {
        await game.update({
          [`players.${playerKey}.score`]: currentScore - pointMultiplier / 2,
          [`players.${playerKey}.won`]: true,
        })
        // @TODO check that getlooserkey happens after playerwon sets to true for third player
        const looserKey = Object.keys(players).find((key) => players[key as PlayerKey].won === false) as PlayerKey
        const looserScore = gameValues.players[looserKey].score
        await game.update({
          [`players.${looserKey}.score`]: looserScore - pointMultiplier,
          gameStarted: false,
        })
      }
    }

    // CHOP
    if (bigTwoChop || fourOfAKindChop) {
      for (let i = 1; i < playedCards.length; i++) {
        const previousPlayedCards = playedCards[playedCards.length - i]

        if (previousPlayedCards) {
          const { userName: previousPlayedCardsUserName } = previousPlayedCards
          const previousPlayedCardsPlayer = getPlayer(gameValues, previousPlayedCardsUserName)
          const previousPlayedCardsKey = getPlayerKey(gameValues, previousPlayedCardsPlayer)
          const previousPlayerScore = gameValues.players[previousPlayedCardsKey].score

          if (previousPlayedCards?.cards[0]?.value === 2 && bigTwoChop) {
            if (
              !gameValues.players[previousPlayedCardsKey].won &&
              gameValues.players[previousPlayedCardsKey].userName !== userName
            ) {
              await game.update({
                [`players.${playerKey}.score`]: currentScore + 100,
                [`players.${previousPlayedCardsKey}.score`]: previousPlayerScore - 100,
              })
            }
          }

          const valuePreviousPlayedCards = getTotalValue(previousPlayedCards.cards)

          if (
            i === 1 &&
            valuePlayedCards > valuePreviousPlayedCards &&
            valuePreviousPlayedCards > 702 &&
            valuePreviousPlayedCards < 716 &&
            !gameValues.players[previousPlayedCardsKey].won &&
            latestPlayedCards.cards.length === 4
          ) {
            await game.update({
              [`players.${playerKey}.score`]: currentScore + 200,
              [`players.${previousPlayedCardsKey}.score`]: previousPlayerScore - 200,
            })
          }

          if (
            valuePlayedCards > valuePreviousPlayedCards &&
            valuePlayedCards > 804 &&
            valuePlayedCards < 1215 &&
            !gameValues.players[previousPlayedCardsKey].won &&
            previousPlayedCards.cards.length === 5 &&
            gameValues.players[previousPlayedCardsKey].userName !== userName
          ) {
            await game.update({
              [`players.${playerKey}.score`]: currentScore + 100,
              [`players.${previousPlayedCardsKey}.score`]: previousPlayerScore - 100,
            })
          }
        }
      }
    }

    // @TODO ensure that if the players last cards are single two he will automatically loose

    return cards
  }

  // after 1.5 min frontend should make a pass request
  async passRound({ gameName, userName }: { readonly gameName: string; readonly userName: string }) {
    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })
    if (!game) {
      throw new Error('Game not found, should not happen')
    }
    const gameValues = game.dataValues as TableGames
    const player = getPlayer(gameValues, userName)
    const { isFirstPlay, players, gameStarted } = gameValues

    if (!gameStarted) {
      throw new Error('Game not started')
    }

    if (!player.playerTurn) {
      throw new Error('Not players turn')
    }

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (player.roundPass) {
      throw new Error('Player has already passed this round')
    }

    if (isFirstPlay) {
      throw new Error('Cannot pass on first round')
    }

    const playerKey = getPlayerKey(gameValues, player)
    const nextPlayerKey = getNextPlayerTurn(players)
    await game.update({
      [`players.${playerKey}.playerTurn`]: false,
      [`players.${playerKey}.roundPass`]: true,
      [`players.${nextPlayerKey}.playerTurn`]: true,
    })

    const passedPlayers = Object.values(players).filter((player) => player.roundPass === true)
    const wonPlayers = Object.values(players).filter((player) => player.won === true)
    if (passedPlayers.length + wonPlayers.length === 3) {
      await game.update({
        ['players.playerOne.roundPass']: false,
        ['players.playerTwo.roundPass']: false,
        ['players.playerThree.roundPass']: false,
        ['players.playerFour.roundPass']: false,
        playedCards: [],
      })
    }
  }

  // leave seatFN,
  // set seat to empty
  // Check gamestarted when leaving seat,
  // if game not started:
  // if game started and user leaves:
  async leaveSeat({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const user = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })

    if (!user) {
      throw new Error('Cant find player, should not happen')
    }

    if (user.dataValues.joinedTable !== gameName) {
      throw new Error('User not in this game')
    }

    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const gameValues = game.dataValues as TableGames
    const { gameStarted } = gameValues

    if (gameStarted) {
      throw new Error('Cannot leave until game is over')
    }

    const player = getPlayer(gameValues, userName)
    const playerKey = getPlayerKey(gameValues, player)

    await game.update({
      [`players.${playerKey}.userName`]: '',
    })
  }

  // need authentication
  async getCards({ userName }: { readonly userName: string }) {
    const result = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })
    if (!result) {
      throw new Error('Cant find player, should not happen')
    }
    return result.dataValues.cards
  }

  async leaveGame({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const user = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })

    if (!user) {
      throw new Error('Cant find player, should not happen')
    }

    if (user.dataValues.joinedTable !== gameName) {
      throw new Error('User not in this game')
    }

    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const gameValues = game.dataValues as TableGames
    // const { gameStarted } = gameValues

    // if (gameStarted) {
    //   throw new Error('Cannot leave until game is over')
    // }

    // const player = getPlayer(gameValues, userName)
    // const playerKey = getPlayerKey(gameValues, player)

    // await game.update({
    //   [`players.${playerKey}.userName`]: '',
    // })
    console.log(user.dataValues)
    console.log(game.dataValues)
  }
  // @TODO leaveGame
  // @TODO removeGame
}

const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
const user2 = { userName: 'Nani', password: 'password', email: 'jonas1@example.com' }
const user3 = { userName: 'Jens', password: 'password', email: 'jonas2@example.com' }
const user4 = { userName: 'Olof', password: 'password', email: 'jonas3@example.com' }
const user5 = { userName: 'Jonas', password: 'password', email: 'jonas@example.com' }

const api = new API()
await api.initDB()

await api.createUser(user1)
await api.createUser(user2)
await api.createUser(user3)
await api.createUser(user4)
await api.createUser(user5)
await api.createGame({ userName: user1.userName, gameName: 'BorisGame', pointMultiplier: 10 })

await api.joinGame({ userName: user2.userName, gameName: 'BorisGame' })
await api.joinGame({ userName: user3.userName, gameName: 'BorisGame' })
await api.joinGame({ userName: user4.userName, gameName: 'BorisGame' })
await api.joinGame({ userName: user5.userName, gameName: 'BorisGame' })

await api.assignPlayer({ seatNumber: 1, userName: user1.userName, gameName: 'BorisGame' })
await api.assignPlayer({ seatNumber: 2, userName: user2.userName, gameName: 'BorisGame' })
await api.assignPlayer({ seatNumber: 3, userName: user3.userName, gameName: 'BorisGame' })
await api.assignPlayer({ seatNumber: 4, userName: user4.userName, gameName: 'BorisGame' })

await api.startGame('BorisGame')

const testCards1 = await api.getCards({ userName: user1.userName })
const testCards2 = await api.getCards({ userName: user2.userName })
const testCards3 = await api.getCards({ userName: user3.userName })
const testCards4 = await api.getCards({ userName: user4.userName })

// console.log(testCards4)
await api.playCards({
  cards: [testCards1[8]],
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.playCards({
  cards: [testCards2[9]],
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.playCards({
  cards: [testCards3[0]],
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards4[12]],
  gameName: 'BorisGame',
  userName: user4.userName,
})

await api.playCards({
  cards: [testCards1[5]],
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.playCards({
  cards: [testCards2[3], testCards2[4], testCards2[5], testCards2[6]],
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.playCards({
  cards: [testCards3[2], testCards3[3], testCards3[4], testCards3[5]],
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards4[1], testCards4[2], testCards4[3], testCards4[4]],
  gameName: 'BorisGame',
  userName: user4.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards4[5], testCards4[0], testCards4[6], testCards4[7], testCards4[8]],
  gameName: 'BorisGame',
  userName: user4.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards4[11], testCards4[9], testCards4[10]],
  gameName: 'BorisGame',
  userName: user4.userName,
})

await api.playCards({
  cards: [testCards1[4], testCards1[6], testCards1[7]],
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards1[0], testCards1[1], testCards1[2], testCards1[3], testCards1[12]],
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards1[11], testCards1[9], testCards1[10]],
  gameName: 'BorisGame',
  userName: user1.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards2[0], testCards2[1], testCards2[2], testCards2[12], testCards2[11]],
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.passRound({
  gameName: 'BorisGame',
  userName: user3.userName,
})

await api.playCards({
  cards: [testCards2[10], testCards2[8], testCards2[7]],
  gameName: 'BorisGame',
  userName: user2.userName,
})

await api.leaveSeat({ userName: user4.userName, gameName: 'BorisGame' })

await api.assignPlayer({ seatNumber: 4, userName: user5.userName, gameName: 'BorisGame' })

await api.leaveGame({ userName: user4.userName, gameName: 'BorisGame' })

const game = await api.models.Games.findOne({
  where: { gameName: { [Op.iLike]: 'BorisGame' } },
})

// console.log(game!.dataValues)
// console.log(game!.dataValues.playedCards)

// console.log(testCards2)

// console.log(await api.getCards({ userName: user2.userName }))
// console.log(game1?.dataValues)
// @TODO Check for cascading linking database columns and cascade it:
// players: {
//   type: DataTypes.ARRAY(DataTypes.INTEGER),
//   allowNull: true,
//   defaultValue: [],
// },
//  players: {
//   type: DataTypes.INTEGER,
//   allowNull: true,
//   references: {
//     model: 'Player',
//     key: 'id',
//   },
//   onUpdate: 'CASCADE',
//   onDelete: 'SET NULL',
// },

// @TODO add websockets, https://socket.io/
// as soon as data in db is updated then frontend will render
