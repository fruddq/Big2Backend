import { DataTypes, Model, Sequelize } from 'sequelize'
import type { PlayerCards } from '../modules/PlayerCards'

class TableUser extends Model {
  email!: string
  joinedTable!: string
  ownedTable!: string
  password!: string
  readonly playerID!: string
  userName!: string
  cards!: PlayerCards

  // created and updated is added from sequelize
  readonly createdAt!: string
  readonly updatedAt!: string
}

export interface Player {
  userName: string
  roundPass: boolean
  score: number
  playerTurn: boolean
  won: boolean
}

export interface playedCards {
  userName: string
  cards: PlayerCards
}

export class TableGames extends Model {
  readonly gameName!: string
  readonly gameOwner!: string
  // usersInTable!: string[]
  playedCards!: playedCards[]
  players!: {
    playerOne: Player
    playerTwo: Player
    playerThree: Player
    playerFour: Player
  }
  gameStarted!: boolean
  pointMultiplier!: number
  isFirstPlay!: boolean
  winnerNumber!: number
  // created and updated is added from sequelize
  readonly createdAt!: string
  readonly updatedAt!: string
}

export type PlayerKey = 'playerOne' | 'playerTwo' | 'playerThree' | 'playerFour'

export class Models {
  // Should be a loop with the right types after game completion
  static initDB = (DB: Sequelize) => ({
    Users: Models.tables.Users(DB),
    Games: Models.tables.Games(DB),
  })

  // want the KEY(User in this case) and the value to return to API
  static tables = {
    Users: (sequelize: Sequelize) => {
      TableUser.init(
        {
          userName: {
            type: DataTypes.STRING,
            allowNull: false,
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
          cards: {
            type: DataTypes.JSON,
            defaultValue: [],
            allowNull: false,
          },
        },
        { sequelize },
      )

      return TableUser
    },

    Games: (sequelize: Sequelize) => {
      TableGames.init(
        {
          gameName: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          gameOwner: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          // usersInTable: {
          //   type: DataTypes.ARRAY(DataTypes.STRING),
          //   defaultValue: [],
          // },
          // will be an array of cards and not strings
          playedCards: {
            type: DataTypes.JSON,
            defaultValue: [],
          },
          players: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
              playerOne: {
                userName: '',
                roundPass: false,
                score: 0,
                playerTurn: false,
                won: false,
              },
              playerTwo: {
                userName: '',
                roundPass: false,
                score: 0,
                playerTurn: false,
                won: false,
              },
              playerThree: {
                userName: '',
                roundPass: false,
                score: 0,
                playerTurn: false,
                won: false,
              },
              playerFour: {
                userName: '',
                roundPass: false,
                score: 0,
                playerTurn: false,
                won: false,
              },
            },
          },
          gameStarted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          },
          pointMultiplier: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          isFirstPlay: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
          },
          winnerNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
          },
        },
        { sequelize },
      )

      return TableGames
    },
  }
}
