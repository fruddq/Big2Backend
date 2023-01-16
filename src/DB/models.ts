import { DataTypes, Model, Sequelize } from 'sequelize'

class TableUser extends Model {
  readonly changeUserInfoID!: string
  readonly email!: string
  readonly joinedTable!: string
  readonly lowerCaseUserName!: string
  readonly ownedTable!: string
  readonly password!: string
  readonly playerID!: string
  readonly userName!: string

  // created and updated is added from sequelize
  readonly createdAt!: string
  readonly updatedAt!: string
}

export class Models {
  // Should be a loop with the right types after game completion
  static initDB = (DB: Sequelize) => ({
    User: Models.tables.User(DB),
    GameTables: Models.tables.GameTables(DB),
  })

  // want the KEY(User in this case) and the value to return to API
  static tables = {
    User: (sequelize: Sequelize) => {
      TableUser.init(
        {
          userName: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          lowerCaseUserName: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          //For now the game will accept changing password just with correct username and email,
          //after it should send confirmation email with a link that checks changeUserInfoID to database for changing name and password.
          //Changing email should not be possible to keep this game simple
          changeUserInfoID: {
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
        },
        { sequelize },
      )

      return TableUser
    },

    GameTables: (DB: Sequelize) =>
      DB.define('GameTable', {
        userName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lowerCaseUserName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        //For now the game will accept changing password just with correct username and email,
        //after it should send confirmation email with a link that checks changeUserInfoID to database for changing name, password,email.
        changeUserInfoID: {
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
