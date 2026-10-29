<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { decideRound, getMatchWinner, type Choice, type RoundOutcome, type RoundResult } from './game'

const choices: { id: Choice; label: string; key: string }[] = [
  { id: 'rock', label: 'Rock', key: '1' },
  { id: 'paper', label: 'Paper', key: '2' },
  { id: 'scissors', label: 'Scissors', key: '3' },
]

const rounds = ref<RoundResult[]>([])
const lastRound = ref<RoundResult | null>(null)
const playerMatches = ref(0)
const cpuMatches = ref(0)
const isRevealing = ref(false)
let revealTimer: number | undefined

const playerScore = computed(() => rounds.value.filter((round) => round.outcome === 'win').length)
const cpuScore = computed(() => rounds.value.filter((round) => round.outcome === 'loss').length)
const matchWinner = computed(() => getMatchWinner(playerScore.value, cpuScore.value))
const roundNumber = computed(() => rounds.value.length + 1)

const status = computed(() => {
  if (matchWinner.value === 'player') return 'You take the match!'
  if (matchWinner.value === 'cpu') return 'The house takes this one.'
  if (!lastRound.value) return 'Make your move.'
  if (lastRound.value.outcome === 'draw') return 'A mirror match. Run it back.'
  return lastRound.value.outcome === 'win' ? 'Clean hit. You take the round.' : 'Outplayed. The house takes the round.'
})

function play(choice: Choice) {
  if (matchWinner.value || isRevealing.value) return
  isRevealing.value = true
  const cpu = choices[Math.floor(Math.random() * choices.length)]!.id
  const result = decideRound(choice, cpu)
  revealTimer = window.setTimeout(() => {
    rounds.value = [...rounds.value, result]
    lastRound.value = result
    isRevealing.value = false
    if (matchWinner.value === 'player') {
      playerMatches.value += 1
      saveMatchWins()
    } else if (matchWinner.value === 'cpu') {
      cpuMatches.value += 1
    }
  }, 360)
}

function newMatch() {
  window.clearTimeout(revealTimer)
  revealTimer = undefined
  rounds.value = []
  lastRound.value = null
  isRevealing.value = false
}

function saveMatchWins() {
  try {
    window.localStorage.setItem('pulse-hands-wins', String(playerMatches.value))
  } catch {
    // The game remains playable when browser storage is unavailable.
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target
  if (target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
  const key = event.key.toLowerCase()
  if (key === 'n') {
    newMatch()
    return
  }
  const choice = choices[Number(key) - 1]
  if (choice) play(choice.id)
}

onMounted(() => {
  try {
    playerMatches.value = Number(window.localStorage.getItem('pulse-hands-wins')) || 0
  } catch {
    playerMatches.value = 0
  }
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(revealTimer)
})

function choiceLabel(choice: Choice | undefined) {
  return choices.find((item) => item.id === choice)?.label ?? '—'
}

function outcomeLabel(outcome: RoundOutcome) {
  return outcome === 'win' ? 'You win' : outcome === 'loss' ? 'House wins' : 'Draw'
}
</script>

<template>
  <main class="stage">
    <div class="ambient ambient-one" aria-hidden="true"></div>
    <div class="ambient ambient-two" aria-hidden="true"></div>

    <header class="topbar">
      <a class="brand" href="#top" aria-label="Pulse Hands home">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span>PULSE<span class="brand-light"> / HANDS</span></span>
      </a>
      <div class="topbar-right">
        <span class="live-indicator"><i></i> ARCADE LIVE</span>
        <span class="topbar-divider"></span>
        <span class="match-total"><span class="tiny-label">MATCH WINS</span><strong>{{ String(playerMatches).padStart(2, '0') }}</strong></span>
      </div>
    </header>

    <section id="top" class="game-layout" aria-label="Pulse Hands game">
      <div class="game-main">
        <div class="eyebrow"><span class="eyebrow-line"></span> HEAD-TO-HEAD / ROUND {{ String(roundNumber).padStart(2, '0') }}</div>
        <div class="title-row">
          <h1>Read the <span>rhythm.</span></h1>
          <p class="intro-copy">One move ahead.<br />Best of five.</p>
        </div>

        <div class="arena">
          <div class="arena-grid" aria-hidden="true"></div>
          <div class="scoreboard">
            <div class="score-side player-side">
              <span class="score-caption">YOU</span>
              <strong>{{ playerScore }}</strong>
              <span class="score-name">PLAYER</span>
            </div>
            <div class="score-center">
              <span class="score-dash"></span><span>FIRST TO 3</span><span class="score-dash"></span>
            </div>
            <div class="score-side house-side">
              <span class="score-caption">THE HOUSE</span>
              <strong>{{ cpuScore }}</strong>
              <span class="score-name">CPU</span>
            </div>
          </div>

          <div class="versus-row">
            <div class="versus-person">
              <div class="avatar avatar-player"><span>Y</span><i></i></div>
              <span>YOU</span>
            </div>
            <div class="versus-word">VS<span>·</span></div>
            <div class="versus-person">
              <div class="avatar avatar-house"><span>H</span><i></i></div>
              <span>THE HOUSE</span>
            </div>
          </div>

          <div class="result-panel" :class="{ 'has-result': lastRound || matchWinner, 'is-revealing': isRevealing }" aria-live="polite" aria-atomic="true">
            <div class="result-line"></div>
            <template v-if="isRevealing">
              <span class="result-kicker">LOCKING IN</span>
              <strong class="result-message">Reading the room<span class="loading-dots">···</span></strong>
            </template>
            <template v-else-if="matchWinner">
              <span class="result-kicker">MATCH COMPLETE / {{ playerScore > cpuScore ? 'VICTORY' : 'DEFEAT' }}</span>
              <strong class="result-message">{{ status }}</strong>
            </template>
            <template v-else-if="lastRound">
              <span class="result-kicker">ROUND {{ String(rounds.length).padStart(2, '0') }} / {{ outcomeLabel(lastRound.outcome).toUpperCase() }}</span>
              <strong class="result-message">{{ status }}</strong>
              <span class="result-detail">{{ choiceLabel(lastRound.player) }} <b>vs</b> {{ choiceLabel(lastRound.cpu) }}</span>
            </template>
            <template v-else>
              <span class="result-kicker">YOUR MOVE</span>
              <strong class="result-message">{{ status }}</strong>
              <span class="result-detail">Choose your hand to begin</span>
            </template>
          </div>

          <div class="choice-area">
            <p class="choice-prompt"><span>CHOOSE YOUR HAND</span><span class="prompt-rule"></span></p>
            <div class="choices" :class="{ 'choices-disabled': matchWinner || isRevealing }">
              <button v-for="choice in choices" :key="choice.id" class="choice-card" :class="[`choice-${choice.id}`, { selected: lastRound?.player === choice.id }]" :disabled="!!matchWinner || isRevealing" :aria-label="`${choice.label}, keyboard shortcut ${choice.key}`" @click="play(choice.id)">
                <span class="choice-key">{{ choice.key }}</span>
                <svg v-if="choice.id === 'rock'" class="hand-glyph" viewBox="0 0 80 80" aria-hidden="true">
                  <path d="M24 38V27a5 5 0 0 1 10 0v8-14a5 5 0 0 1 10 0v14-11a5 5 0 0 1 10 0v13-7a5 5 0 0 1 10 0v18c0 13-8 22-21 22h-3c-7 0-12-3-16-9L13 47a6 6 0 0 1 9-8l8 8" />
                  <path class="glyph-accent" d="M31 53h22" />
                </svg>
                <svg v-else-if="choice.id === 'paper'" class="hand-glyph" viewBox="0 0 80 80" aria-hidden="true">
                  <path d="M18 39V22a5 5 0 0 1 10 0v13-20a5 5 0 0 1 10 0v20-24a5 5 0 0 1 10 0v24-18a5 5 0 0 1 10 0v22l3-5a6 6 0 0 1 10 6l-9 19c-3 7-9 10-17 10h-9c-8 0-13-4-17-11L10 47a6 6 0 0 1 8-8l8 7" />
                  <path class="glyph-accent" d="M30 52h23" />
                </svg>
                <svg v-else class="hand-glyph" viewBox="0 0 80 80" aria-hidden="true">
                  <path d="M38 43 20 19a6 6 0 0 1 9-7l17 20M43 39 56 14a6 6 0 0 1 11 5L54 49c-2 5-1 9 3 13l5 5H30l-7-7a14 14 0 0 1-2-17l4-8a6 6 0 0 1 11 5l-4 9" />
                  <path class="glyph-accent" d="m30 22 10 13M56 22l-8 16" />
                </svg>
                <span class="choice-label">{{ choice.label }}</span>
                <span class="choice-sheen" aria-hidden="true"></span>
              </button>
            </div>
            <p class="rule-note">ROCK <b>›</b> SCISSORS <span>·</span> SCISSORS <b>›</b> PAPER <span>·</span> PAPER <b>›</b> ROCK</p>
          </div>
        </div>
      </div>

      <aside class="side-panel">
        <div class="panel-head"><span>ROUND LOG</span><span class="log-count">{{ String(rounds.length).padStart(2, '0') }} / ∞</span></div>
        <div v-if="rounds.length" class="round-list">
          <div v-for="(round, index) in [...rounds].reverse()" :key="index" class="round-item" :class="`round-${round.outcome}`">
            <span class="round-index">{{ String(rounds.length - index).padStart(2, '0') }}</span>
            <span class="round-matchup"><span>{{ choiceLabel(round.player) }}</span><i>×</i><span>{{ choiceLabel(round.cpu) }}</span></span>
            <span class="round-badge">{{ round.outcome === 'win' ? '+1' : round.outcome === 'loss' ? '−1' : '=' }}</span>
          </div>
        </div>
        <div v-else class="empty-log">
          <span class="empty-mark">···</span>
          <p>The first move<br />sets the tone.</p>
        </div>
        <div class="panel-bottom">
          <div class="win-streak"><span class="streak-orbit">✳</span><span><b>{{ playerMatches }}</b> MATCH{{ playerMatches === 1 ? '' : 'ES' }} WON</span></div>
          <button class="new-match" @click="newMatch"><span>↻</span> NEW MATCH <kbd>N</kbd></button>
        </div>
      </aside>
    </section>

    <footer class="footer">
      <span>THINK FAST. PLAY CLEAN.</span>
      <span class="footer-shortcuts"><kbd>1</kbd> ROCK <kbd>2</kbd> PAPER <kbd>3</kbd> SCISSORS <i></i> <kbd>N</kbd> RESET</span>
      <span class="footer-version">PH—001 <span>©</span> 2026</span>
    </footer>
  </main>
</template>
