import { Sequelize } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Models as ModelsDB } from './DB/models'
import { validateUser } from './modules/validateUser'
import { isTest } from './config'

// @TODO Models not found
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
    await this.DB.sync({ force: isTest })
    return this
  }

  // @TODO When project is finished, ensure anonymous is allowed,
  // clear them every night and warn in frontend before, what happens if they do not register
  // also delete users that havent logged in in 100 days

  // Create user
  // if user exist, do not allow, no duplicate users
  async createUser({
    userName,
    password,
    email,
  }: { readonly userName: string; readonly password: string; readonly email: string }) {
    this.validators.user({ userName, password, email }, this.ajv)

    const lowerCaseUserName = userName.toLowerCase() //checking db for lowercase will result in case sensetive username check, Frudd and frudd is counted as duplicate
    const existingUser = await this.models.User.findOne({ where: { lowerCaseUserName } })
    if (existingUser) {
      throw new Error('User with that name already exists')
    }

    await this.models.User.create({
      userName,
      lowerCaseUserName,
      password,
      email,
      playerID: uuidv4(),
      changeUserInfoID: uuidv4(),
    })
  }

  // static async createTable() {
  //   try {
  //     const GameTable = sequelize.define("GameTable", {
  //       tableName: {
  //         type: DataTypes.STRING,
  //         allowNull: false,
  //       },
  //       tableID: {
  //         type: DataTypes.STRING,
  //         allowNull: false,
  //       },
  //       tableOwner: {
  //         type: DataTypes.STRING,
  //         allowNull: false,
  //       },
  //     })
  //     // @TODO Ensure that data cannot be overwritten in DB,
  //     // otherwise tables with same name or ID will update/overwrite.

  //     // const rowFound = await GameTable.findOne({ where: { tableID: "123" } })
  //     // if (rowFound) {
  //     //   await GameTable.create({ tableName: "Jane", tableID: "123", tableOwner: "Frudd" })
  //     // }
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }
}
const api = new API()

await api.initDB()
await api.createUser({ userName: 'Frudd', password: 'fruddsPassword', email: 'frudd@gmail.com' })
