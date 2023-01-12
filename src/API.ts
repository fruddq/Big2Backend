import { Sequelize, DataTypes, ModelCtor, Model } from "sequelize"
import { v4 as uuidv4 } from "uuid"

export class API {
  DB: Sequelize

  models: {
    // any and any is what is going to be returned from the DB. Must change any when using Find().
    // example any = { readonly userName: string, readonly password: string }
    User: ModelCtor<Model<any, any>>
  }

  constructor() {
    this.DB = new Sequelize("default_database", "username", "password", {
      host: "localhost",
      dialect: "postgres",
    })

    this.models = {
      User: this.DB.define("User", {
        userName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        // PlayerID is not neccesary ATM, when allowing anonymous users this will be important
        playerID: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        ownedTable: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        joinedTable: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      }),
    }
  }

  async initDB() {
    await this.DB.authenticate()
    await this.DB.sync({ force: true })
    return this
  }

  // @TODO When project is finished, ensure anonymous is allowed,
  // clear them every night and warn in frontend before, what happens if they do not register
  // also delete users that havent logged in in 100 days

  // Create user
  // if user exist, do not allow

  // send in username and PW
  // then object with username, pw and pwid should be in DB
  // now get from DB and chkeck that it exists.
  async createUser({
    userName,
    password,
  }: {
    readonly userName: string
    readonly password: string
  }) {
    await this.models.User.create({ userName, password, playerID: uuidv4() })
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
} // await API.createUser()
// const api = new API()
// await api.initDB()
