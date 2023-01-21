import { describe, it } from 'vitest'
import { validatePointMultiplier } from '../modules/validatePointMultiplier'

describe('validatePointMultiplier', () => {
  it('should return true for valid pointMultiplier', ({ expect }) => {
    expect(validatePointMultiplier(20)).toBe(true)
    expect(validatePointMultiplier(30)).toBe(true)
  })

  it('should return false for invalid pointMultiplier', ({ expect }) => {
    expect(validatePointMultiplier(5)).toBe(false)
    expect(validatePointMultiplier(-20)).toBe(false)
    expect(validatePointMultiplier(0)).toBe(false)
  })

  it('should return false for decimal pointMultiplier', ({ expect }) => {
    expect(validatePointMultiplier(10.5)).toBe(false)
    expect(validatePointMultiplier(25.8)).toBe(false)
  })

  it('should return false for non-numeric pointMultiplier', ({ expect }) => {
    expect(validatePointMultiplier(NaN)).toBe(false)
  })

  it('should return false for pointMultiplier just above upper limit', ({ expect }) => {
    expect(validatePointMultiplier(Number.MAX_SAFE_INTEGER)).toBe(false)
  })
})
