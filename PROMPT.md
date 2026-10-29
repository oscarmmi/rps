Build rock-paper-scissors in THIS folder: C:\xampp\htdocs\rps

A recruiter-ready browser RPS. Playable, polished, no backend.

## Game
- Call it "Pulse Hands". Original glyphs, no licensed branding.
- Player vs CPU. Rock beats scissors, scissors beat paper, paper beats rock. Same choice is a draw. Best of 5 (first to 3 round wins).
- Click/tap a glyph. Keyboard: 1 rock, 2 paper, 3 scissors. N starts a new match. Local match wins in localStorage.

## UI
- Dark stage, three glowing glyphs, round score, result flash. Not a default Vite page. No Vue logo.
- 390px phone and 1280px desktop.

## Tests
- Vitest (pure logic): rock beats scissors; paper beats rock; same choices are a draw; first to 3 round wins is a match win.
- `npm test` and `npm run build` must pass.

## GitHub
- Repo: https://github.com/oscarmmi/rps
- Pages: https://oscarmmi.github.io/rps/
- vite base `/rps/`
- Commit: feat: add rps
- First commit must `git add -A` so package.json, vite.config.ts, tsconfigs, src/main.ts, index.html, .gitignore, and .github/workflows/pages.yml ship with the game.
- gh repo edit --description "Pulse Hands rock-paper-scissors in Vue 3 + TypeScript, playable on GitHub Pages." --add-topic vue --add-topic typescript --add-topic game --add-topic rps --add-topic arcade
- Stop. Print the repo URL and Pages URL.
