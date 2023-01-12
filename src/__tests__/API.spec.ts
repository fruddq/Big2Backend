import { describe, expect, it } from "vitest"
import { API as TheModule } from "../API"

describe("TheModule", async () => {
  const tester = {
    setupDB: async () => {
      const api = new TheModule()
      return await api.initDB()
    },
  }

  it("functions correcly", async () => {
    expect(1).toBe(1)
    const api = await tester.setupDB()
    await api.createUser({ userName: "hehj", password: "hola" })
  })
}, 1000)
