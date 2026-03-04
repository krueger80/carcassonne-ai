# Chromecast Fix Plan

## Root Causes Identified

### 1. Receiver gates state on `tileMapCache` — but it's never used
The receiver buffers incoming state updates until `loadAllTiles()` completes. But `tileMapCache` is never passed to `CastView` — the view reads `gameState.staticTileMap` directly (which already contains tile definitions from the sender). If the DB fetch in `loadAllTiles()` hangs or fails, state is buffered forever → "Waiting for game to start" indefinitely.

### 2. Sender double-serializes the message
```js
const message = JSON.stringify({ type: 'STATE_UPDATE', json })
session.sendMessage(CAST_NAMESPACE, message)  // string, not object
```
The CAF SDK may parse the string internally before delivering, leading to unpredictable `event.data` types on the receiver. Google recommends sending **objects** to `sendMessage`.

### 3. Sender uses callback API on a Promise-based method
`session.sendMessage(ns, data, successCb, errorCb)` — CAF `CastSession.sendMessage` returns a Promise. The callbacks are extra args that get ignored. Any send failure is an unhandled Promise rejection (silent).

## Fix Plan

### A. `src/receiver.tsx` — Remove tile loading gate
- Remove `tileMapCache` and `latestPartialState` variables
- Apply state immediately in the message listener: `useGameStore.setState({ gameState: partialState })`
- Remove the `loadAllTiles()` call entirely (tile definitions arrive with the state)
- Add more verbose debug logging: log `typeof event.data`, raw data length

### B. `src/cast/useCastSender.ts` — Fix message sending
- Send an **object** instead of a string: `session.sendMessage(CAST_NAMESPACE, { type: 'STATE_UPDATE', json })`
- Use `.then()/.catch()` instead of callback args
- Apply same fix in both `sendCurrentState()` and the Zustand subscriber

### C. `src/receiver.tsx` — Simplify message parsing
Since the sender now sends an object, the receiver can expect `event.data` to be the object directly. Keep fallback for string case (robustness).

## Files Changed
1. `src/cast/useCastSender.ts` — fix sendMessage calls
2. `src/receiver.tsx` — remove tile gate, simplify parsing, add logging
