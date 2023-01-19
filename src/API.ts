import { Sequelize, Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Models as ModelsDB } from './DB/models.js'
import { validateUser } from './modules/validateUser.js'
import { isTest } from './config.js'
import { Engine } from './modules/Engine.js'
import { isStartingPlayer } from './modules/isStartingPlayer.js'

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
  // dont allow same emails

  async createUser({
    userName,
    password,
    email,
  }: { readonly userName: string; readonly password: string; readonly email: string }) {
    this.validators.user({ userName, password, email }, this.ajv)

    const existingUser = await this.models.Users.findOne({
      where: { userName: { [Op.iLike]: userName } },
    })

    if (existingUser) {
      throw new Error('User with that name already exists')
    }

    await this.models.Users.create({
      userName,
      password,
      email,
      playerID: uuidv4(),
    })
  }

  async createGame({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const gameExists = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (gameExists) {
      throw new Error('Game name already exists')
    }

    // const usersInTable: string[] = [userName]

    await this.models.Games.create({
      gameName,
      gameOwner: userName,
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
    inputNumber,
    userName,
    gameName,
  }: { readonly inputNumber: number; readonly userName: string; readonly gameName: string }) {
    if (inputNumber < 1 || inputNumber > 4) {
      throw new Error('Invalid input number. Please enter a number between 1-4.')
    }

    const playerFieldMap: { [key: number]: string } = {
      1: 'playerOne',
      2: 'playerTwo',
      3: 'playerThree',
      4: 'playerFour',
    }
    const playerField = `players.${playerFieldMap[inputNumber]}`

    const game = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })
    if (!game) {
      throw new Error('Game not found, should not happen')
    }

    const players = game.dataValues.players
    const seat = playerFieldMap[inputNumber]
    if (seat) {
      if (players[seat].userName !== '') {
        throw new Error('Seat taken, choose another position')
      }
    }

    await game.set(`${playerField}.userName`, userName).save()
  }

  // @TODO find the player who holds 3 of diamonds and set property playerTurn = true
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

    const {
      playerOne: playerOneCards,
      playerTwo: playerTwoCards,
      playerThree: playerThreeCards,
      playerFour: playerFourCards,
    } = engine.playersCards

    await game.set('players.playerOne.cards', playerOneCards).save()
    await game.set('players.playerTwo.cards', playerTwoCards).save()
    await game.set('players.playerThree.cards', playerThreeCards).save()
    await game.set('players.playerFour.cards', playerFourCards).save()

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
}

const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
const user2 = { userName: 'Nani', password: 'password', email: 'jonas@example.com' }
const user3 = { userName: 'Jens', password: 'password', email: 'jonas@example.com' }
const user4 = { userName: 'Olof', password: 'password', email: 'jonas@example.com' }
// const user5 = { userName: 'Jonas', password: 'password', email: 'jonas@example.com' }

const api = new API()
await api.initDB()
await api.createUser(user1)
await api.createUser(user2)
await api.createGame({ userName: user1.userName, gameName: 'BorisGame' })

await api.joinGame({ userName: user2.userName, gameName: 'BorisGame' })
await api.joinGame({ userName: user3.userName, gameName: 'BorisGame' })
await api.joinGame({ userName: user4.userName, gameName: 'BorisGame' })

await api.assignPlayer({ inputNumber: 1, userName: user1.userName, gameName: 'BorisGame' })
await api.assignPlayer({ inputNumber: 2, userName: user2.userName, gameName: 'BorisGame' })
await api.assignPlayer({ inputNumber: 3, userName: user3.userName, gameName: 'BorisGame' })
await api.assignPlayer({ inputNumber: 4, userName: user4.userName, gameName: 'BorisGame' })
await api.startGame('BorisGame')
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

// This is my function:

//   async startGame(gameName: string) {
//     const game = await this.models.Games.findOne({
//       where: { gameName: { [Op.iLike]: gameName } },
//     })

//     if (!game) {
//       throw new Error('Game not found, should not happen')
//     }

//     const { players }: { players: typeof game } = game.dataValues

//     for (const player of Object.values(players)) {
//       if (player.userName === '') {
//         throw new Error('Game cannot start until all seats are filled')
//       }
//     }

//     const engine = new Engine()

//     const {
//       playerOne: playerOneCards,
//       playerTwo: playerTwoCards,
//       playerThree: playerThreeCards,
//       playerFour: playerFourCards,
//     } = engine.playersCards

//     console.log(game.dataValues)
//   }

// I want a sequelize query to update all cards properties where gameName matches. This is from my DB:
// {
//   id: 1,
//   gameName: 'BorisGame',
//   gameOwner: 'frudd',
//   usersInTable: [ 'frudd', 'Nani', 'Jens', 'Olof' ],
//   cardsThisRound: [],
//   players: {
//     playerOne: { userName: 'frudd', cards: [], roundPass: false, score: 0 },
//     playerTwo: { userName: 'Nani', cards: [], roundPass: false, score: 0 },
//     playerThree: { userName: 'Jens', cards: [], roundPass: false, score: 0 },
//     playerFour: { userName: 'Olof', cards: [], roundPass: false, score: 0 }
//   },
//   createdAt: 2023-01-19T00:54:42.463Z,
//   updatedAt: 2023-01-19T00:54:42.537Z
// }
