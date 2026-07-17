# Project Status & Notes

Internal tracking doc — current build status, known gaps, and what's next. Not for public/recruiter-facing use (see root README for that).

## Current Phase Scope

Admins upload templates. Users can only **view and share** them. No editing, customization, or user media uploads yet — planned for a future phase.

## Core Flow: Dashboard → Template → Share

1. **Dashboard / Gallery** — trending templates fetched from DB via `/api/v1/templates`
2. **Preview** — clicking a template opens it with correct video/image rendering
3. **Customize** — disabled for now (reserved for the future editing phase)
4. **Share Now** — opens Share modal; WhatsApp, Facebook, and Download all working
5. **Save to My Studio** / **Share with Team** — disabled (no backend concept exists yet)
6. **"+" Create button** (bottom nav) — disabled (tied to future upload/customize feature)

## Page-by-Page Status

| Page | Status |
|---|---|
| Dashboard | ✅ Complete |
| Projects | ✅ Complete |
| Gallery / Preview / Share | ✅ Complete |
| My Studio | ✅ Recent & Favorites working. Drafts tab intentionally empty until Customize ships. Downloads tab removed. |
| Profile | ✅ Complete — Profile Info, Branding, Notification Settings all wired to real APIs. Change Password removed (Google OAuth-only login, no password field exists). |

## Backend Modules — Recently Built/Fixed

- **`profile`** — was querying a non-existent `profiles` table; now correctly reads/writes `users` table
- **`branding`** — was querying wrong table name (`brandings` instead of `branding`); fixed
- **`notification-settings`** — new module, stores push/email/SMS toggle preferences (storage only — no delivery engine yet)
- **`app.js`** — profile/branding/notification-settings routes existed in code but were never registered; now mounted

## Known Gaps / Next Up

- **Customize (editor) feature** — not built yet, biggest missing piece
- **Drafts tab** — becomes meaningful once Customize ships
- **Download sharing** — needs CORS headers enabled on production CDN/backend domain
- **Notifications** — preferences are saved, but no actual sending engine (push/email/SMS) exists yet