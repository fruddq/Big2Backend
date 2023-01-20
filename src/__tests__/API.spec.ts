import { Op } from 'sequelize'
import { describe, expect, it, vi } from 'vitest'
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
          "cards": [],
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
          "gameStarted": false,
          "id": 1,
          "players": {
            "playerFour": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerOne": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerThree": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerTwo": {
              "playerTurn": false,
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
          "cards": [],
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
          "gameStarted": false,
          "id": 1,
          "players": {
            "playerFour": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerOne": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerThree": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "",
            },
            "playerTwo": {
              "playerTurn": false,
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
    const user1 = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }
    const user2 = { userName: 'Nani', password: 'password', email: 'jonas@example.com' }
    const user3 = { userName: 'Jens', password: 'password', email: 'jonas@example.com' }
    const user4 = { userName: 'Olof', password: 'password', email: 'jonas@example.com' }
    const user5 = { userName: 'Jonas', password: 'password', email: 'jonas@example.com' }
    it('assigns player to correct seat', async () => {
      const api = await tester.setupDB()

      await api.createUser(user1)
      await api.createUser(user2)
      await api.createUser(user3)
      await api.createUser(user4)
      await api.createUser(user5)

      await api.createGame({ userName: user1.userName, gameName: 'validGameName' })

      await api.joinGame({ userName: user2.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user3.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user4.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user5.userName, gameName: 'validGameName' })

      await api.assignPlayer({ inputNumber: 1, userName: user1.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 2, userName: user2.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 3, userName: user3.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 4, userName: user4.userName, gameName: 'validGameName' })

      const game = await api.models.Games.findOne({
        where: { gameName: { [Op.iLike]: 'validGameName' } },
      })

      if (!game) {
        throw new Error('Game not found, should not happen')
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
          "gameStarted": false,
          "id": 1,
          "players": {
            "playerFour": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "Olof",
            },
            "playerOne": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "frudd",
            },
            "playerThree": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "Jens",
            },
            "playerTwo": {
              "playerTurn": false,
              "roundPass": false,
              "score": 0,
              "userName": "Nani",
            },
          },
          "usersInTable": [
            "frudd",
            "Nani",
            "Jens",
            "Olof",
            "Jonas",
          ],
        }
      `)
    })
    it('throws when trying to choose a taken seat', async ({ expect }) => {
      const api = await tester.setupDB()

      await api.createUser(user1)
      await api.createUser(user2)
      await api.createUser(user3)
      await api.createUser(user4)
      await api.createUser(user5)

      await api.createGame({ userName: user1.userName, gameName: 'validGameName' })

      await api.joinGame({ userName: user2.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user3.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user4.userName, gameName: 'validGameName' })
      await api.joinGame({ userName: user5.userName, gameName: 'validGameName' })

      await api.assignPlayer({ inputNumber: 1, userName: user1.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 2, userName: user2.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 3, userName: user3.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 4, userName: user4.userName, gameName: 'validGameName' })
      await expect(
        api.assignPlayer({ inputNumber: 4, userName: user5.userName, gameName: 'validGameName' }),
      ).rejects.toThrowErrorMatchingInlineSnapshot('"Seat taken, choose another position"')
    })

    it('throws when trying to sit in a position that doesnt exist', async ({ expect }) => {
      const api = await tester.setupDB()

      await api.createUser(user1)
      await api.createGame({ userName: user1.userName, gameName: 'validGameName' })
      await api.assignPlayer({ inputNumber: 1, userName: user1.userName, gameName: 'validGameName' })
      ;[-1000000, 0, 5, 10, 10000].forEach(async (number) => {
        await expect(
          api.assignPlayer({ inputNumber: number, userName: user1.userName, gameName: 'validGameName' }),
        ).rejects.toThrowErrorMatchingInlineSnapshot('"Invalid input number. Please enter a number between 1-4."')
      })
    })
  })
}, 1000)

// @TODO add test case for lower case
