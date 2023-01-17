import type Ajv from 'ajv'
import { emailSchema, passwordSchema, userNameSchema } from './schemas.js'

export const validateUser = (
  { userName, password, email }: { readonly userName: string; readonly password: string; readonly email: string },
  ajv: Ajv,
) => {
  const validUsername = ajv.validate(userNameSchema, userName)
  if (!validUsername) {
    throw new Error(
      'Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters',
    )
  }

  const validPassword = ajv.validate(passwordSchema, password)
  if (!validPassword) {
    throw new Error('Invalid password. Passworrd must contain at least five letters.')
  }

  const validEmail = ajv.validate(emailSchema, email)
  if (!validEmail) {
    throw new Error('Email is not valid')
  }
}
