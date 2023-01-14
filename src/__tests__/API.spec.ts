import exp from 'constants'
import { describe, expect, it } from 'vitest'
import { API as TheModule } from '../API'
import type { ITableShapeUser, Models as ModelsDB } from '../DB/models'

describe('TheModule', async () => {
  const tester = {
    setupDB: async () => {
      const api = new TheModule()
      return await api.initDB()
    },
  }

  describe('validateUserInfo', () => {
    it('validates correctly', async () => {
      const api = await tester.setupDB()
      try {
        await api.validateUserInfo({ userName: 'hehj', password: 'hola', email: 'frudderic@gmail.com' })
        expect(1).toBe(1)
      } catch (err) {
        console.log(err)
        expect(1).toBe(0)
      }
    })

    it('throws an error when username is invalid', async () => {
      const api = await tester.setupDB()
      try {
        await api.validateUserInfo({
          userName: 'he!!hj',
          password: 'hola',
          email: 'frudderic@gmail.com',
        })

        expect(1).toBe(0)
        // rome-ignore lint/suspicious/noExplicitAny: This could be multiple error types
      } catch (errInput: any) {
        const err: Error = errInput
        expect(err.message).toEqual(
          'Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters',
        )
      }
    })

    it('throws an error when email is invalid', async () => {
      const api = await tester.setupDB()
      try {
        await api.validateUserInfo({ userName: 'hehj', password: 'hola', email: 'frudderic' })
        expect(1).toBe(0)
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (errInput: any) {
        const err: Error = errInput
        expect(err.message).toEqual('Email is not valid')
      }
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

    //It 'validationFN is called with the right arguments' https://vitest.dev/guide/mocking.html
  })
}, 1000)
