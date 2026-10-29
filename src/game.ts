export type Choice = 'rock' | 'paper' | 'scissors'
export type RoundOutcome = 'win' | 'loss' | 'draw'

export interface RoundResult {
  player: Choice
  cpu: Choice
  outcome: RoundOutcome
}

const defeats: Record<Choice, Choice> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
}

export function decideRound(player: Choice, cpu: Choice): RoundResult {
  const outcome: RoundOutcome = player === cpu ? 'draw' : defeats[player] === cpu ? 'win' : 'loss'
  return { player, cpu, outcome }
}

export function getMatchWinner(playerScore: number, cpuScore: number): 'player' | 'cpu' | null {
  if (playerScore >= 3) return 'player'
  if (cpuScore >= 3) return 'cpu'
  return null
}
