import { describe, expect, it } from 'vitest'
import { decideRound, getMatchWinner } from './game'

describe('Pulse Hands round rules', () => {
  it('rock beats scissors', () => {
    expect(decideRound('rock', 'scissors').outcome).toBe('win')
  })

  it('paper beats rock', () => {
    expect(decideRound('paper', 'rock').outcome).toBe('win')
  })

  it('the same choices are a draw', () => {
    expect(decideRound('scissors', 'scissors').outcome).toBe('draw')
  })

  it('ends the match when either player reaches three round wins', () => {
    expect(getMatchWinner(3, 2)).toBe('player')
    expect(getMatchWinner(2, 3)).toBe('cpu')
    expect(getMatchWinner(2, 2)).toBeNull()
  })
})
