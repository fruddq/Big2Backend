import type Ajv from 'ajv'
import { emailSchema, passwordSchema, userNameSchema } from './schemas'

export const validateUser = (
  { userName, password, email }: { readonly userName: string; readonly password: string; readonly email: string },
  ajv: Ajv,
) => {
  //   const ajv = new Ajv()
  //   addFormats(ajv)

  const validUsername = ajv.validate(userNameSchema, userName)
  if (!validUsername) {
    throw new Error(
      'Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters',
    )
  }

  //May not be required to validate password, check password specification openApi 3.0.0 specification
  const validPassword = ajv.validate(passwordSchema, password)
  if (!validPassword) {
    throw new Error('Password is not valid')
  }

  const validEmail = ajv.validate(emailSchema, email)
  if (!validEmail) {
    throw new Error('Email is not valid')
  }
}
