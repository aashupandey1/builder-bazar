# Builder Bazar Marketing Studio

A mobile-first marketing platform for real estate dealers to browse, preview, and share branded promotional templates (videos & posters) — built as part of The Builder Bazar's dealer tools suite.

## Features

- **Google OAuth Login** — secure, password-free authentication
- **Template Gallery** — browse trending and latest marketing templates (videos, posters, reels, stories, banners)
- **Live Preview** — instant video/image preview before sharing
- **One-Tap Sharing** — share templates directly via WhatsApp, Facebook, or download
- **Projects Directory** — browse real estate properties with location-based filtering and search
- **My Studio** — personal space for recently viewed and favorited templates
- **Profile & Branding** — manage personal profile info, company branding (name/tagline), and notification preferences

## Tech Stack

- **Frontend:** React (Vite), mobile-first responsive design
- **Backend:** Node.js + Express, feature-based modular architecture
- **Database:** PostgreSQL
- **Auth:** Google OAuth 2.0
- **Infra (planned):** Redis + BullMQ for background video rendering jobs

## Setup

1. `docker-compose up -d` — starts Postgres + Redis
2. `cd server && npm install && npm run dev`
3. `cd client && npm install && npm run dev`

## Upcoming

- In-app template customization (text, filters, branding overlays)
- User-uploaded media
- Team collaboration & shared workspace tools

See `/docs` for detailed architecture and API documentation.