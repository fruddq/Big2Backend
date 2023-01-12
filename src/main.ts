import express from "express"
import { Sequelize, DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"

const app = express()

const sequelize = new Sequelize("default_database", "username", "password", {
  host: "localhost",
  dialect: "postgres",
})

class API {
  static async createUser() {
    try {
      await sequelize.authenticate()

      const User = sequelize.define("User", {
        Username: {
          type: DataTypes.STRING,
          allowNull: true,
        },
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
      })
      await sequelize.sync({ force: true })
      await User.create({ Username: "Jane", playerID: uuidv4() })
    } catch (err) {
      console.error(err)
    }
  }

  static async createTable() {
    try {
      const GameTable = sequelize.define("GameTable", {
        tableName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tableID: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tableOwner: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      })

      // @TODO Ensure that data cannot be overwritten in DB,
      // otherwise tables with same name or ID will update/overwrite.

      // const rowFound = await GameTable.findOne({ where: { tableID: "123" } })
      // if (rowFound) {
      //   await GameTable.create({ tableName: "Jane", tableID: "123", tableOwner: "Frudd" })
      // }
    } catch (err) {
      console.error(err)
    }
  }
}

await API.createUser()
// const firstTable = await Table.create({ tableName: "Frudds table", tableID: "1234" })
console.log(21212312334)

app.get("/v1/tables/:tableID", function (_req, res) {
  console.log(_req.params)

  res.send({
    availableTables: [1, 2, 3, 4],
  })
})

// figure out how to save stuff in db
// how to get stuff, get in frontend throuugh fetch from this DB.
// vitestnpm

app.listen(7000)
