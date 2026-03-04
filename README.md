# minigames

Standalone minigame collection for FiveM. Drop-in resource with 6 skill-check minigames, no framework dependency required.

## Minigames

| Export | Game | Description |
|--------|------|-------------|
| `Lockpick` | Tumbler Lock | Rotate rings to align colored balls with matching slots |
| `Thermite` | Grid Breaker | Click chess-like pieces to destroy grid cells and reach a target score |
| `PinCracker` | Cipher Dial | Guess a hidden PIN with Wordle-style color feedback |
| `RoofRunning` | Tile Collapse | Click groups of matching colored blocks to clear the board |
| `Chopping` | Rapid Keys | Press the correct keys in sequence before time runs out |
| `WordMemory` | Recall Challenge | Identify whether each word has been seen before |

## Usage

Each minigame is a client-side export that blocks until the player wins or loses, then returns a boolean.

```lua
local success = exports['minigames']:Lockpick(title, levels, timer)
local success = exports['minigames']:Thermite(targetScore, rows, columns, timer)
local success = exports['minigames']:PinCracker(pinLength, timer)
local success = exports['minigames']:RoofRunning(rows, columns, timer)
local success = exports['minigames']:Chopping(letters, timer)
local success = exports['minigames']:WordMemory(words, timer)
```

All parameters are optional with sensible defaults. Returns `true` on win, `false` on loss.

### Parameters

**Lockpick** `(title?, levels?, timer?)`
- `title` — Display name (default: `"Lockpick"`)
- `levels` — Number of rings to unlock, 1-5 (default: `4`)
- `timer` — Seconds (default: `20`)

**Thermite** `(targetScore?, rows?, columns?, timer?)`
- `targetScore` — Points needed to win (default: `24`)
- `rows` / `columns` — Grid dimensions (default: `6`x`6`)
- `timer` — Seconds (default: `60`)

**PinCracker** `(pinLength?, timer?)`
- `pinLength` — Number of digits, 1-10 (default: `4`)
- `timer` — Seconds (default: `20`)

**RoofRunning** `(rows?, columns?, timer?)`
- `rows` / `columns` — Grid dimensions (default: `8`x`11`)
- `timer` — Seconds (default: `25`)

**Chopping** `(letters?, timer?)`
- `letters` — Number of keys in the sequence (default: `15`)
- `timer` — Seconds (default: `7`)

**WordMemory** `(words?, timer?)`
- `words` — Number of rounds (default: `25`)
- `timer` — Seconds (default: `25`)

## Installation

1. Drop the `minigames` folder into your server's `resources/` directory
2. Add `ensure minigames` to your `server.cfg`
3. The UI comes pre-built in `interface/dist/`

## Building from Source

```bash
cd interface
npm install
npm run build
```

## Credits

Minigame logic based on [NoPixel-MiniGames-4.0](https://github.com/MaximilianAdF/NoPixel-MiniGames-4.0) by [MaximilianAdF](https://github.com/MaximilianAdF).