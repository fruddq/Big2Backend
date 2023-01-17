import { describe, it } from 'vitest'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { validateUser } from '../modules/validateUser'

describe.concurrent('validateUser', () => {
  const ajv = new Ajv()
  addFormats(ajv)

  it.concurrent('Does not throw when all inputs are correct', async ({ expect }) => {
    const user = { userName: 'username', password: 'password', email: 'user@example.com' }
    expect(() => validateUser(user, ajv)).not.toThrow()
  })

  describe.concurrent('Test cases for username', () => {
    it.concurrent('throws an error when username is blank', async ({ expect }) => {
      const user = {
        userName: '',
        password: 'hola',
        email: 'frudderic@gmail.com',
      }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it.concurrent('throws an error when username is less than 3 characters', async ({ expect }) => {
      const user = { userName: 'ab', password: 'validpassword', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it.concurrent('throws an error when username is more than 12 characters', async ({ expect }) => {
      const user = { userName: 'averyverylongusername', password: 'validpassword', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it.concurrent('throws an error when username contains special characters', async ({ expect }) => {
      const user = { userName: 'myusername!', password: 'validpassword', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })
  })

  describe.concurrent('Test cases for invalid email', () => {
    it.concurrent('throws an error when email is not in the correct format', async ({ expect }) => {
      const user = { userName: 'username', password: 'validpassword', email: 'notvalidemail' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot('"Email is not valid"')
    })

    it.concurrent('throws an error when an email is blank', async ({ expect }) => {
      const user = { userName: 'username', password: 'validpassword', email: '' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot('"Email is not valid"')
    })
  })

  describe.concurrent('Test cases for invalid password', () => {
    it('throws an error when password is less than 8 characters', async ({ expect }) => {
      const user = { userName: 'username', password: 'abc', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid password. Passworrd must contain at least five letters."',
      )
    })

    it.concurrent('throws an error when an empty password is provided', async ({ expect }) => {
      const user = { userName: 'username', password: '', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid password. Passworrd must contain at least five letters."',
      )
    })
  })
})
