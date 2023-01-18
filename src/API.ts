import { Sequelize, Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Models as ModelsDB } from './DB/models.js'
import { validateUser } from './modules/validateUser.js'
import { isTest } from './config.js'

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

  // @TODO maybe delete this function and just add the code to createUser
  async getUser(userName: string) {
    const lowerCaseUserName = userName.toLowerCase() //checking db for lowercase will result in case sensetive username check, Frudd and frudd is counted as duplicate
    const existingUser = await this.models.Users.findOne({ where: { lowerCaseUserName } })

    return existingUser
  }

  async createUser({
    userName,
    password,
    email,
  }: { readonly userName: string; readonly password: string; readonly email: string }) {
    this.validators.user({ userName, password, email }, this.ajv)

    const existingUser = await this.getUser(userName)
    if (existingUser) {
      throw new Error('User with that name already exists')
    }

    await this.models.Users.create({
      userName,
      lowerCaseUserName: userName.toLowerCase(),
      password,
      email,
      playerID: uuidv4(),
      changeUserInfoID: uuidv4(),
    })
  }

  // @TODO must also update User property joined/owned table
  async createGame({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const gameExists = await this.models.Games.findOne({
      where: { gameName: { [Op.iLike]: gameName } },
    })

    if (gameExists) {
      throw new Error('Game mame already exists')
    }

    const usersInTable: string[] = [userName]

    await this.models.Games.create({
      gameName,
      gameOwner: userName,
      usersInTable,
    })

    await this.models.Users.update(
      {
        ownedTable: gameName,
        joinedTable: gameName,
      },
      {
        where: { lowerCaseUserName: userName.toLowerCase() },
      },
    )
  }

  async joinGame({ userName, gameName }: { readonly userName: string; readonly gameName: string }) {
    const usersInTable: string[] = [userName]

    await this.models.Games.create({
      gameName,
      gameOwner: userName,
      usersInTable,
    })

    await this.models.Users.update(
      {
        ownedTable: gameName,
        joinedTable: gameName,
      },
      {
        where: { lowerCaseUserName: userName.toLowerCase() },
      },
    )
  }
}
