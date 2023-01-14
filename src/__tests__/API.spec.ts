import { describe, expect, it, vi, afterEach } from 'vitest'
import { API as TheModule } from '../API'
import type { ITableShapeUser } from '../DB/models'

describe('TheModule', async () => {
  const tester = {
    setupDB: async () => {
      const api = new TheModule()
      return await api.initDB()
    },
  }

  describe('validateUser', () => {
    it('Does not throw when all inputs are correct', async () => {
      const api = await tester.setupDB()
      const user = { userName: 'hehj', password: 'hola', email: 'frudderic@gmail.com' }
      expect(() => api.validateUser(user)).not.toThrow()
    })

    describe('Test cases for username', () => {
      it('throws an error when username is blank', async () => {
        const api = await tester.setupDB()
        const user = {
          userName: '',
          password: 'hola',
          email: 'frudderic@gmail.com',
        }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })

      it('throws an error when username is less than 3 characters', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'ab', password: 'validpassword', email: 'validemail@example.com' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })

      it('throws an error when username is more than 12 characters', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'averyverylongusername', password: 'validpassword', email: 'validemail@example.com' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })

      it('throws an error when username contains special characters', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'myusername!', password: 'validpassword', email: 'validemail@example.com' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })
    })

    describe('Test cases for invalid email', () => {
      it('throws an error when email is not in the correct format', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'validusername', password: 'validpassword', email: 'notvalidemail' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })

      it('throws an error when an email is blank', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'validusername', password: 'validpassword', email: '' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })
    })

    describe('Test cases for invalid password', () => {
      it('throws an error when password is less than 8 characters', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'validusername', password: 'short', email: 'validemail@example.com' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })

      it('throws an error when an empty password is provided', async () => {
        const api = await tester.setupDB()
        const user = { userName: 'validusername', password: '', email: 'validemail@example.com' }
        expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
          '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
        )
      })
    })
  })

  describe('createUser', () => {
    const user = { userName: 'frudd', password: 'password', email: 'frudd@example.com' }

    it('creates a new user', async () => {
      const api = await tester.setupDB()

      await api.createUser(user)

      const userInDB = (await api.models.User.findOne({
        where: { lowerCaseUserName: user.userName.toLowerCase() },
      })) as ITableShapeUser

      if (!userInDB) {
        throw new Error('Should not happen')
      }
      const dataValues: ITableShapeUser = { ...userInDB.dataValues }

      expect(dataValues.changeUserInfoID).toHaveLength(36)
      expect(dataValues.createdAt).toBeInstanceOf(Date)
      expect(dataValues.playerID).toHaveLength(36)
      expect(dataValues.updatedAt).toBeInstanceOf(Date)

      // rome-ignore lint/suspicious/noExplicitAny: <need to delete for this test because these value changes>
      // rome-ignore lint/performance/noDelete: <explanation>
      delete (dataValues as any).changeUserInfoID
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      // rome-ignore lint/performance/noDelete: <explanation>
      delete (dataValues as any).createdAt
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      // rome-ignore lint/performance/noDelete: <explanation>
      delete (dataValues as any).playerID
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      // rome-ignore lint/performance/noDelete: <explanation>
      delete (dataValues as any).updatedAt

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

    it('throws an error when username already exists', async () => {
      const api = await tester.setupDB()
      await api.createUser(user)
      await expect(api.createUser(user)).rejects.toThrowErrorMatchingInlineSnapshot(
        '"User with that name already exists"',
      )
    })

    it('validateUser has been called upon with correct arguments', async () => {
      const api = await tester.setupDB()
      const spy = vi.spyOn(api, 'validateUser')
      await api.createUser(user)
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
}, 1000)
