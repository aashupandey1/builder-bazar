# Architecture Overview

## Structure
- **Client:** React (Vite), pages under `client/src/pages`, shared UI in `client/src/components`
- **Server:** Express, feature-based modules under `server/src/modules/<feature>/`
  - Each module: `*.routes.js` → `*.controller.js` → `*.service.js` → `*.repository.js` (+ `*.validation.js`)
  - Routes are thin (HTTP only), services hold business logic, repositories hold all SQL
- **Database:** PostgreSQL, raw `pg` queries — no ORM

## Request Flow
`Route → auth middleware (if protected) → validate middleware → Controller → Service → Repository → DB`

## Auth
Google OAuth 2.0 (Passport.js) — session via httpOnly cookie, no password stored/used anywhere.

## Current Phase Boundary
Admin uploads templates → users view + share only. Editor/customize modules (`editor`, `media`, `render`, `project`) are scaffolded for a future phase but not wired into the current user flow.