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
      const { changeUserInfoID, createdAt, playerID, updatedAt, ...dataValues } = dataValuesOriginal

      expect(changeUserInfoID).toHaveLength(36)
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

  describe('createGameTable', () => {
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
          "gameName": "validGameName",
          "gameOwner": "frudd",
          "id": 1,
          "players": {
            "playerFour": {
              "roundPass": false,
              "userName": "",
            },
            "playerOne": {
              "roundPass": false,
              "userName": "",
            },
            "playerThree": {
              "roundPass": false,
              "userName": "",
            },
            "playerTwo": {
              "roundPass": false,
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
      const {
        changeUserInfoID,
        createdAt: createdAtUser,
        playerID,
        updatedAt: updatedAtUser,
        ...dataValuesUser
      } = dataValuesOriginalUser

      expect(changeUserInfoID).toHaveLength(36)
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
}, 1000)
