export const emailSchema = {
  properties: {
    email: {
      type: "string",
      format: "email",
    },
  },
  required: ["email"],
}

export const userNameSchema = {
  type: "string",
  minLength: 3,
  maxLength: 10,
  pattern: "^[a-zA-Z0-9]+$",
  required: ["userName"],
}
