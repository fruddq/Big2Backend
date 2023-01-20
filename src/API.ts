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

  // should recieve points param. points need to be saved in db
  async createGame({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const gameExists = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (gameExists) {
      throw new Error('Game name already exists')
    }

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
    seatNumber: inputNumber,
    userName,
    gameName,
  }: { readonly seatNumber: number; readonly userName: string; readonly gameName: string }) {
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

  // start game needs to default all the values of the game thats affected.
  // cards dont need to be dafaulted as it replaces all players cards in their seats

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

    // SLOWER CODE FOR 4-5 players, dont run loop

    // await Promise.all(
    //   playerUserNames.map((userName: string, i) =>
    //     this.models.Users.update(
    //       { cards: [playerOneCards, playerTwoCards, playerThreeCards, playerFourCards][i] },
    //       { where: { userName: { [Op.eq]: userName } } },
    //     ),
    //   ),
    // )

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
  // should update cardsThisround property of game with played cards, if tha play is valid
  // Should remove the cards played from the array

  // assign a property playersWon with default value 0 to the game
  // after each play check if array is empty, then the player has won,
  // get the playerWon value
  // Update score by adding playerScore[playerOne]; const placeScores = [10, 5, -5, -10];
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

  // getCards should just return the players cards so that they can be rendered
}

// const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
// const user2 = { userName: 'Nani', password: 'password', email: 'jonas@example.com' }
// const user3 = { userName: 'Jens', password: 'password', email: 'jonas@example.com' }
// const user4 = { userName: 'Olof', password: 'password', email: 'jonas@example.com' }
// // const user5 = { userName: 'Jonas', password: 'password', email: 'jonas@example.com' }

// // const api = new API()
// // await api.initDB()
// // await api.createUser(user1)
// // await api.createUser(user2)
// // await api.createUser(user3)
// // await api.createUser(user4)
// // await api.createGame({ userName: user1.userName, gameName: 'BorisGame' })

// // await api.joinGame({ userName: user2.userName, gameName: 'BorisGame' })
// // await api.joinGame({ userName: user3.userName, gameName: 'BorisGame' })
// // await api.joinGame({ userName: user4.userName, gameName: 'BorisGame' })

// // await api.assignPlayer({ seatNumber: 1, userName: user1.userName, gameName: 'BorisGame' })
// // await api.assignPlayer({ seatNumber: 2, userName: user2.userName, gameName: 'BorisGame' })
// // await api.assignPlayer({ seatNumber: 3, userName: user3.userName, gameName: 'BorisGame' })
// // await api.assignPlayer({ seatNumber: 4, userName: user4.userName, gameName: 'BorisGame' })
// // await api.startGame('BorisGame')

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
