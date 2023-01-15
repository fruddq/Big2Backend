import { describe, it } from 'vitest'
// import { API as TheModule } from '../API'
// import type { ITableShapeUser } from '../DB/models'
// import { validateUser } from '../modules/validateUser'

// all tests that does not use DB use it.concurrent / describe.concurrent. and also desctruct expect from it instead of importing
describe('hej', () => {
  it('he', () => {})
})
// describe('validateUser', () => {
//   const tester = {
//     setupDB: async () => {
//       const api = new TheModule()
//       return await api.initDB()
//     },
//   }
//   it('Does not throw when all inputs are correct', async ({expect}) => {
//     const api = await tester.setupDB()
//     const user = { userName: 'hehj', password: 'hola', email: 'frudderic@gmail.com' }
//     expect(() => api.validateUser(user)).not.toThrow()
//   })

//   describe('Test cases for username', () => {
//     it('throws an error when username is blank', async ({expect}) => {
//       const api = await tester.setupDB()
//       const user = {
//         userName: '',
//         password: 'hola',
//         email: 'frudderic@gmail.com',
//       }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })

//     it('throws an error when username is less than 3 characters', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'ab', password: 'validpassword', email: 'validemail@example.com' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })

//     it('throws an error when username is more than 12 characters', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'averyverylongusername', password: 'validpassword', email: 'validemail@example.com' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })

//     it('throws an error when username contains special characters', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'myusername!', password: 'validpassword', email: 'validemail@example.com' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })
//   })

//   describe('Test cases for invalid email', () => {
//     it('throws an error when email is not in the correct format', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'validusername', password: 'validpassword', email: 'notvalidemail' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })

//     it('throws an error when an email is blank', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'validusername', password: 'validpassword', email: '' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })
//   })

//   describe('Test cases for invalid password', () => {
//     it('throws an error when password is less than 8 characters', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'validusername', password: 'short', email: 'validemail@example.com' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })

//     it('throws an error when an empty password is provided', async () => {
//       const api = await tester.setupDB()
//       const user = { userName: 'validusername', password: '', email: 'validemail@example.com' }
//       expect(() => api.validateUser(user)).toThrowErrorMatchingInlineSnapshot(
//         '"Invalid username. Username must contain a minimum of 3 characters, maximum of 12 characters and cannot cannot contain special characters"',
//       )
//     })
//   })
// })
