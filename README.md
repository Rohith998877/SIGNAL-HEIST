# Signal Heist: Overdrive — online multiplayer prototype

This project preserves the original Signal Heist local prototype (`local-prototype.html`) and adds a runnable online room prototype using Node.js, Express and Socket.IO.

## Requirements
- Node.js 20 or newer
- npm
- Network access for the first `npm install` to download dependencies

## Run locally
```bash
npm install
npm test
npm start
```
Open http://localhost:3000 in two separate browser sessions. Create a room in one session, join with the room code in the other, ready up, and start the match. The server validates turns, movement, stealing, scanning, dashes, scoring and win conditions.

## Test endpoints
- `GET /health` returns server status and active room count.
- `npm test` runs focused game-logic unit tests.

## Environment
- `PORT` (optional; default `3000`). No secrets are required by this prototype.

## Current limitations
- Rooms and matches are held in memory; restarting the server clears them.
- Reconnection tokens are stored in `sessionStorage` and are bearer credentials. Do not share them. For production, use secure authenticated sessions, expiry/rotation, CSRF/origin controls as applicable, and persistence.
- No accounts, database, persistent match history, public matchmaking, chat, reporting, spectator mode, or moderation.
- The game is turn-based. “Simultaneous actions” are serialized by the Node event loop and validated against the authoritative current turn.
- Host transfers to a connected player when the host disconnects. The departing/disconnected player's seat is retained for up to two minutes; a disconnected player can resume using the session token during that window.
- The server currently allows cross-origin Socket.IO defaults suitable for local development. Before public deployment, configure explicit allowed origins, HTTPS, rate limiting, robust schema validation, and persistent session storage.

## Deploy
Deploy this Node application to a host that supports persistent Node.js processes and WebSockets. Set `PORT` if the host requires it. Configure the platform's public origin and HTTPS; before production, add explicit Socket.IO CORS/origin policy and rate limiting. Static-only hosting is not sufficient for online multiplayer.

## Handshake submission assets
Use the existing cover image `../signal_heist_cover.png` and describe this accurately as an online multiplayer prototype. Test the deployed public URL from separate devices before submitting. The official rules require a title, cover image, description and project URL; this project does not automatically submit to Handshake.
