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

      const userInDB = await api.models.User.findOne({
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

      // console.log(JSON.stringify(dataValues, undefined, 20))
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
      await api.createUser(user)
      await expect(api.createUser(user)).rejects.toThrowErrorMatchingInlineSnapshot(
        '"User with that name already exists"',
      )
    })

    it('validateUser has been called upon with correct arguments', async ({ expect }) => {
      const api = await tester.setupDB()
      const spy = vi.spyOn(api.validators, 'user')
      await api.createUser(user)
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
}, 1000)
