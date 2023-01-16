import { describe, it } from 'vitest'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { validateUser } from '../modules/validateUser'

// all tests that does not use DB use it.concurrent / describe.concurrent. and also desctruct expect from "it" instead of importing
describe('validateUser', () => {
  const ajv = new Ajv()
  addFormats(ajv)

  it('Does not throw when all inputs are correct', async ({ expect }) => {
    const user = { userName: 'user', password: 'password', email: 'user@example.com' }
    expect(() => validateUser(user, ajv)).not.toThrow()
  })

  describe('Test cases for username', () => {
    it('throws an error when username is blank', async ({ expect }) => {
      const user = {
        userName: '',
        password: 'hola',
        email: 'frudderic@gmail.com',
      }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it('throws an error when username is less than 3 characters', async ({ expect }) => {
      const user = { userName: 'ab', password: 'validpassword', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it('throws an error when username is more than 12 characters', async ({ expect }) => {
      const user = { userName: 'averyverylongusername', password: 'validpassword', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it('throws an error when username contains special characters', async ({ expect }) => {
      const user = { userName: 'myusername!', password: 'validpassword', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })
  })

  describe('Test cases for invalid email', () => {
    it('throws an error when email is not in the correct format', async ({ expect }) => {
      const user = { userName: 'validusername', password: 'validpassword', email: 'notvalidemail' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it('throws an error when an email is blank', async ({ expect }) => {
      const user = { userName: 'validusername', password: 'validpassword', email: '' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })
  })

  describe('Test cases for invalid password', () => {
    it('throws an error when password is less than 8 characters', async ({ expect }) => {
      const user = { userName: 'validusername', password: 'short', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })

    it('throws an error when an empty password is provided', async ({ expect }) => {
      const user = { userName: 'validusername', password: '', email: 'validemail@example.com' }
      expect(() => validateUser(user, ajv)).toThrowErrorMatchingInlineSnapshot(
        '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
      )
    })
  })
})
