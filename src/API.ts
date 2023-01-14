import { Sequelize } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Models as ModelsDB } from './DB/models'

export class API {
  DB: Sequelize
  ajv: Ajv
  models: ReturnType<typeof ModelsDB['initDB']>

  constructor() {
    this.DB = new Sequelize('default_database', 'username', 'password', {
      host: 'localhost',
      dialect: 'postgres',
    })

    this.ajv = new Ajv()
    addFormats(this.ajv)

    this.models = ModelsDB.initDB(this.DB)
  }

  async initDB() {
    await this.DB.authenticate()
    await this.DB.sync({ force: true })
    return this
  }

  validateUser({
    userName,
    password,
    email,
  }: { readonly userName: string; readonly password: string; readonly email: string }) {
    // @TODO: Check why import/export not work for schemas
    const emailSchema = {
      type: 'string',
      format: 'email',
      required: ['email'],
    }

    const userNameSchema = {
      type: 'string',
      minLength: 3,
      maxLength: 12,
      pattern: '^[a-zA-Z0-9]+$',
      required: ['userName'],
    }

    const passwordSchema = {
      type: 'string',
      format: 'password',
      required: ['password'],
    }

    const validUsername = this.ajv.validate(userNameSchema, userName)
    if (!validUsername) {
      throw new Error(
        'Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters',
      )
    }

    //May not be required to validate password, check password specification openApi 3.0.0 specification
    const validPassword = this.ajv.validate(passwordSchema, password)
    if (!validPassword) {
      throw new Error('Password is not valid')
    }

    const validEmail = this.ajv.validate(emailSchema, email)
    if (!validEmail) {
      throw new Error('Email is not valid')
    }
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
    this.validateUser({ userName, password, email })

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
