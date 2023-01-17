import { describe, it, vi } from 'vitest'
import { API as TheModule } from '../API'

describe('TheModule', async () => {
  const tester = {
    setupDB: async () => {
      const api = new TheModule()
      return await api.initDB()
    },
  }

  describe('createUser', () => {
    const user = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }

    it('creates a new user', async ({ expect }) => {
      const api = await tester.setupDB()

      await api.createUser(user)

      const userInDB = await api.models.Users.findOne({
        where: { lowerCaseUserName: user.userName.toLowerCase() },
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
          "lowerCaseUserName": "frudd",
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
      await expect(api.createUser(invalidPassword)).rejects.toThrowErrorMatchingInlineSnapshot('"Invalid password. Passworrd must contain at least five letters."')
    })
  })

  describe('createGameTable', () => {
    it('', () => {})
  })
}, 1000)
