import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const emailSchema = {
  type: 'string',
  format: 'email',
  required: ['email'],
}

const userNameSchema = {
  type: 'string',
  minLength: 3,
  maxLength: 12,
  pattern: '^[a-zA-Z0-9]+$',
  required: ['userName'],
}

const passwordSchema = {
  type: 'string',
  format: 'password',
  minLength: 5,
  required: ['password'],
}

const validateUser = (
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
  console.log(validPassword)

  const validEmail = ajv.validate(emailSchema, email)
  if (!validEmail) {
    throw new Error('Email is not valid')
  }
}

const ajv = new Ajv()
addFormats(ajv)

validateUser({ userName: 'Jonas', password: 'Bonne', email: 'email' }, ajv)
