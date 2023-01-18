import { Op } from 'sequelize'
import { describe, it, vi } from 'vitest'
import { API as TheModule } from '../API'

describe('TheModule', async () => {
  const tester = {
    setupDB: async () => {
      const api = new TheModule()
      return await api.initDB()
    },
  }

  const user = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }

  describe('createUser', () => {
    it('creates a new user', async ({ expect }) => {
      const api = await tester.setupDB()
      await api.createUser(user)

      const userInDB = await api.models.Users.findOne({
        where: { userName: { [Op.iLike]: user.userName } },
      })

      if (!userInDB) {
        throw new Error('Should not happen')
      }
      const dataValuesOriginal = { ...userInDB.dataValues }
      const { createdAt, playerID, updatedAt, ...dataValues } = dataValuesOriginal

      expect(createdAt).toBeInstanceOf(Date)
      expect(playerID).toHaveLength(36)
      expect(updatedAt).toBeInstanceOf(Date)

      expect(dataValues).toMatchInlineSnapshot(`
        {
          "email": "frudd@example.com",
          "id": 1,
          "joinedTable": null,
          "ownedTable": null,
          "password": "password",
          "userName": "frudd",
        }
      `)
    })

    it('throws an error when username already exists', async ({ expect }) => {
      const api = await tester.setupDB()
      await api.createUser({ userName: 'testUser', password: 'password', email: 'frudd@example.com' })
      await expect(
        api.createUser({ userName: 'testUser', password: 'password', email: 'frudd@example.com' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot('"User with that name already exists"')
    })

    it('validateUser has been called upon with correct arguments and does not throw', async ({ expect }) => {
      const api = await tester.setupDB()
      const spy = vi.spyOn(api.validators, 'user')

      await expect(
        api.createUser({ userName: 'Jens', password: 'password', email: 'frudd@example.com' }),
      ).resolves.not.toThrow()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith({ userName: 'Jens', password: 'password', email: 'frudd@example.com' }, api.ajv)

      spy.mockClear()
    })

    // @TODO check password specification openApi 3.0.0 specification

    it('throws an error when passed an invalid username', async ({ expect }) => {
      const invalidUsername = { userName: 'fr', password: 'password', email: 'frudd@example.com' }
      const api = await tester.setupDB()
      await expect(api.createUser(invalidUsername)).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it('throws an error when passed an invalid email', async ({ expect }) => {
      const invalidEmail = { userName: 'Frederic', password: 'password', email: 'frudd' }
      const api = await tester.setupDB()
      await expect(api.createUser(invalidEmail)).rejects.toThrowErrorMatchingInlineSnapshot('"Email is not valid"')
    })

    it('throws an error when passed an invalid password', async ({ expect }) => {
      const invalidPassword = { userName: 'Frederic', password: '', email: 'frudd@gmail.com' }
      const api = await tester.setupDB()
      await expect(api.createUser(invalidPassword)).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Invalid password. Passworrd must contain at least five letters."',
      )
    })
  })

  describe('createGame', () => {
    it('creates a gameTable and updates user with new game info', async ({ expect }) => {
      const api = await tester.setupDB()
      const validGameName = 'validGameName'
      await api.createUser(user)
      await api.createGame({ userName: user.userName, gameName: validGameName })

      const gameInDB = await api.models.Games.findOne({
        where: { gameName: validGameName },
      })

      if (!gameInDB) {
        throw new Error('Should not happen')
      }

      const dataValuesOriginal = { ...gameInDB.dataValues }
      const { createdAt, updatedAt, ...dataValues } = dataValuesOriginal

      expect(createdAt).toBeInstanceOf(Date)
      expect(updatedAt).toBeInstanceOf(Date)
      expect(dataValues).toMatchInlineSnapshot(`
        {
          "cardsThisRound": [],
          "gameName": "validGameName",
          "gameOwner": "frudd",
          "id": 1,
          "players": {
            "playerFour": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerOne": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerThree": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerTwo": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
          },
          "usersInTable": [
            "frudd",
          ],
        }
      `)

      const userInDB = await api.models.Users.findOne({
        where: { userName: { [Op.iLike]: user.userName } },
      })

      if (!userInDB) {
        throw new Error('Should not happen')
      }
      const dataValuesOriginalUser = { ...userInDB.dataValues }
      const { createdAt: createdAtUser, playerID, updatedAt: updatedAtUser, ...dataValuesUser } = dataValuesOriginalUser

      expect(createdAtUser).toBeInstanceOf(Date)
      expect(playerID).toHaveLength(36)
      expect(updatedAtUser).toBeInstanceOf(Date)

      expect(dataValuesUser).toMatchInlineSnapshot(`
        {
          "email": "frudd@example.com",
          "id": 1,
          "joinedTable": "validGameName",
          "ownedTable": "validGameName",
          "password": "password",
          "userName": "frudd",
        }
      `)
    })

    it('Throws an error if gameName already exists', async ({ expect }) => {
      const api = await tester.setupDB()
      const validGameName = 'validGameName'
      await api.createUser(user)
      await api.createGame({ userName: user.userName, gameName: validGameName })

      await expect(
        api.createGame({ userName: 'anotherUser', gameName: validGameName }),
      ).rejects.toThrowErrorMatchingInlineSnapshot('"Game name already exists"')
    })
  })

  describe('joinGame and throws error if user already in game', async () => {
    it('adds user in game and throws error if user already in game', async ({ expect }) => {
      const api = await tester.setupDB()

      const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
      const user2 = { userName: 'Nani', password: 'password', email: 'jonas@example.com' }

      await api.createUser(user1)
      await api.createUser(user2)
      await api.createGame({ userName: user1.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user2.userName, gameName: 'validGameName' })

      const game = await api.models.Games.findOne({
        where: { gameName: { [Op.iLike]: 'validgAmeName' } },
      })

      if (!game) {
        throw new Error('Should not happen')
      }

      const dataValuesOriginal = { ...game.dataValues }
      const { createdAt, updatedAt, ...dataValues } = dataValuesOriginal
      expect(createdAt).toBeInstanceOf(Date)
      expect(updatedAt).toBeInstanceOf(Date)
      expect(dataValues).toMatchInlineSnapshot(`
        {
          "cardsThisRound": [],
          "gameName": "validGameName",
          "gameOwner": "frudd",
          "id": 1,
          "players": {
            "playerFour": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerOne": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerThree": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerTwo": {
              "cards": [],
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
          },
          "usersInTable": [
            "frudd",
            "Nani",
          ],
        }
      `)

      await expect(
        api.joinGame({ userName: user2.userName, gameName: 'validGameName' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot('"User already in game"')
    })
  })

  describe('assignPlayer', () => {
    it('does', async () => {
      const api = await tester.setupDB()

      const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
      const user2 = { userName: 'Nani', password: 'password', email: 'jonas@example.com' }

      await api.createUser(user1)
      await api.createUser(user2)
      await api.createGame({ userName: user1.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user2.userName, gameName: 'validGameName' })

      // const game = await this.models.Games.findOne({
      //   where: { gameName: { [Op.iLike]: 'Test' } },
      // })
      // console.log(game?.dataValues)
    })
  })
}, 1000)

// @TODO add test case for lower case
