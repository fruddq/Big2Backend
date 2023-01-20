import { Sequelize, Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Models as ModelsDB, Player } from './DB/models.js'
import { validateUser } from './modules/validateUser.js'
import { isTest } from './config.js'
import { Engine } from './modules/Engine.js'
import { isStartingPlayer } from './modules/isStartingPlayer.js'
import type { PlayerCards } from './modules/PlayerCards.js'
import { getTotalValue } from './modules/getTotalValue.js'

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

  // @TODO When project is finished, ensure anonymous is allowed,
  // clear them every night and warn in frontend before, what happens if they do not register
  // also delete users that havent logged in in 100 days
  // Add a button that asks player how many cards they have left
  // If they have 1 card

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

    if (gameExists) {
      throw new Error('Game name already exists')
    }

    await this.models.Games.create({
      gameName,
      gameOwner: userName,
      pointMultiplier,
    })

    await this.models.Games.update(
      { usersInTable: Sequelize.fn('array_append', Sequelize.col('usersInTable'), userName) },
      { where: { gameName: { [Op.iLike]: gameName } } },
    )

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
    if (game.dataValues.usersInTable.includes(userName)) {
      throw new Error('User already in game')
    }

    await this.models.Users.update(
      {
        joinedTable: gameName,
      },
      {
        where: { userName: { [Op.iLike]: userName } },
      },
    )

    await this.models.Games.update(
      { usersInTable: Sequelize.fn('array_append', Sequelize.col('usersInTable'), userName) },
      { where: { gameName: { [Op.iLike]: gameName } } },
    )
  }

  async assignPlayer({
    seatNumber,
    userName,
    gameName,
  }: { readonly seatNumber: number; readonly userName: string; readonly gameName: string }) {
    if (seatNumber < 1 || seatNumber > 4) {
      throw new Error('Invalid input number. Please enter a number between 1-4.')
    }

    const playerFieldMap: { [key: number]: string } = {
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

  // start game needs to default all the values of the game thats affected.
  // cards dont need to be dafaulted as it replaces all players cards in their seats
  // Need to default playersWon

  async startGame(gameName: string) {
    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const { players }: { players: typeof game } = game.dataValues

    for (const player of Object.values(players)) {
      if (player.userName === '') {
        throw new Error('Wait until all seats are filled')
      }
    }

    const engine = new Engine()

    const { playerOneCards, playerTwoCards, playerThreeCards, playerFourCards } = engine.playersCards

    const [{ userName: playerOne }, { userName: playerTwo }, { userName: playerThree }, { userName: playerFour }] =
      Object.values(players)

    await this.models.Users.update({ cards: playerOneCards }, { where: { userName: { [Op.eq]: playerOne } } })
    await this.models.Users.update({ cards: playerTwoCards }, { where: { userName: { [Op.eq]: playerTwo } } })
    await this.models.Users.update({ cards: playerThreeCards }, { where: { userName: { [Op.eq]: playerThree } } })
    await this.models.Users.update({ cards: playerFourCards }, { where: { userName: { [Op.eq]: playerFour } } })

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

    // testing
    // const p1 = await this.models.Users.findOne({
    //   where: { userName: { [Op.iLike]: playerOne } },
    // })
    // const p2 = await this.models.Users.findOne({
    //   where: { userName: { [Op.iLike]: playerTwo } },
    // })
    // const p3 = await this.models.Users.findOne({
    //   where: { userName: { [Op.iLike]: playerThree } },
    // })
    // const p4 = await this.models.Users.findOne({
    //   where: { userName: { [Op.iLike]: playerFour } },
    // })

    // console.log(p1?.dataValues)
    // stop testing
  }
  // play cards function
  // check if the play is valid? Frontend ?
  // should update cardsThisround property of game with played cards
  // Should remove the cards played from the array players card array

  // assign a property playersWon with default value 0 to the game
  // after each play check if array is empty, then the player has won,
  // get the playerWon value
  // Update score by adding playerScore[playersWon]; const placeScores = [10, 5, -5, -10];
  // add 1 to playerScore, update the playerWon value in DB
  // should use the pointsvalue in gameDB to calc player sores

  // should check when playerWon = 2 then the game is over cuz 3 ppl have no cards left
  // then it should update the final score -10 to the looser
  // it should also update playerWon to 3
  // then frontend can check if playerWon = 3 then game is over
  // then it knows to block all buttons
  // and also render a new button to play another round
  // also update gamestarted to false. this will make it easier for leave seat
  //

  // should make playerturn false and nextplayerturn true, will have to check if roundpass

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

    const player = (Object.values(game?.dataValues.players) as Player[]).find((player) => player.userName === userName)

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (!player) {
      throw new Error('Player not in current game')
    }

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (!player.playerTurn) {
      throw new Error('Not players turn')
    }

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (player.roundPass) {
      throw new Error('Player has already passed this round')
    }

    const valueOfPlayCards = getTotalValue(cards)
    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (!valueOfPlayCards) {
      throw new Error('Invalid play')
    }

    // @TODO CHECK THIS IN FRONTEND AS WELL!
    if (!isStartingPlayer(cards)) {
      throw new Error('First play must contain three of diamonds')
    }

    // first play must contain three of diamonds
    // that means the game must save a property called firstPlay in game
    // this will be a boolean starting as false
    // at start of game this will be set as true
    // after firstplay this will be changed back to false
    console.log(game?.dataValues.players)
    console.log(player)

    return cards
  }

  // leave seatFN,
  // set seat to empty
  // Check gamestarted when leaving seat,
  // if game not started:
  // if game started and user leaves:
  // set cards to empty,
  // enable a way to calc score and think about how players will continue

  // pass function
  // should update property roundPass to true
  // should check if three ppl have passed
  // should also check whos turn its next and set it to true
  // param is playernumber as a string for instance 'playerOne'
  // cannot pass if firstplay = true
  // after 1.5 min frontend should make a pass request

  // getCards should just return the players cards so that they can be rendered
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
}

// const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
// const user2 = { userName: 'Nani', password: 'password', email: 'jonas1@example.com' }
// const user3 = { userName: 'Jens', password: 'password', email: 'jonas2@example.com' }
// const user4 = { userName: 'Olof', password: 'password', email: 'jonas3@example.com' }
// // // const user5 = { userName: 'Jonas', password: 'password', email: 'jonas@example.com' }

// const api = new API()
// await api.initDB()

// await api.createUser(user1)
// await api.createUser(user2)
// await api.createUser(user3)
// await api.createUser(user4)
// await api.createGame({ userName: user1.userName, gameName: 'BorisGame', pointMultiplier: 10 })

// await api.joinGame({ userName: user2.userName, gameName: 'BorisGame' })
// await api.joinGame({ userName: user3.userName, gameName: 'BorisGame' })
// await api.joinGame({ userName: user4.userName, gameName: 'BorisGame' })

// await api.assignPlayer({ seatNumber: 1, userName: user1.userName, gameName: 'BorisGame' })
// await api.assignPlayer({ seatNumber: 2, userName: user2.userName, gameName: 'BorisGame' })
// await api.assignPlayer({ seatNumber: 3, userName: user3.userName, gameName: 'BorisGame' })
// await api.assignPlayer({ seatNumber: 4, userName: user4.userName, gameName: 'BorisGame' })

// await api.startGame('BorisGame')

// const testCards = await api.getCards({ userName: 'frudd' })

// console.log(testCards)
// await api.playCards({
//   cards: [testCards[8], testCards[1]],
//   gameName: 'BorisGame',
//   userName: user1.userName,
// })

// await api.playCards()

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
