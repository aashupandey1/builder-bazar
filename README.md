# Builder Bazar Marketing Studio

Enterprise-grade marketing content editor - browse, upload, edit (branding/text/CTA/music/filters), preview, and share media.

## Tech Stack
- React (Vite) + Zustand
- Node.js + Express (feature-based modules)
- PostgreSQL
- Redis + BullMQ (background rendering jobs)

## Setup
1. `docker-compose up -d` - starts Postgres + Redis
2. `cd server && npm install && npm run dev`
3. `cd client && npm install && npm run dev`

See /docs for SRS, API docs, and architecture notes.
