export const emailSchema = {
  type: 'string',
  format: 'email',
  required: ['email'],
}

export const userNameSchema = {
  type: 'string',
  minLength: 3,
  maxLength: 12,
  pattern: '^[a-zA-Z0-9]+$',
  required: ['userName'],
}

export const passwordSchema = {
  type: 'string',
  format: 'password',
  required: ['password'],
}
