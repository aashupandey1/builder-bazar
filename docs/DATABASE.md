# Database Documentation

PostgreSQL, raw SQL (no ORM). Schema: `database/schema.sql`

## Tables

- **users** — Google OAuth login, `role` (user/admin), `phone`
- **templates** — admin-uploaded content (`type`: Video/Reel/Poster/Story/Banner), `file_url`, `usage_count`, belongs to a `properties` row via `project_id`
- **properties** — real-estate projects that templates belong to
- **media** — user-uploaded assets (logo/background/music) — future editor phase
- **projects** — a user's saved editor work (`data` JSONB stores layers/filters/text) — future editor phase
- **project_shares** — "Share with Team" — future phase
- **favorites** — user's favorited projects (unique per user+project)
- **downloads** — download history per user/project
- **branding** — one row per user: company_name, tagline
- **notification_settings** — one row per user: push_enabled, email_enabled, sms_enabled
- **notifications** — notification feed items (title, message, type, is_read)

## Key Relationships
- `templates.created_by` → `users.id`
- `templates.project_id` → `properties.id`
- `projects.user_id` → `users.id`, `projects.template_id` → `templates.id`
- `favorites` / `downloads` → `users.id` + `projects.id`
- `branding` / `notification_settings` → `users.id` (1:1, unique)

## Notes
- `favorites` and `downloads` reference `projects`, not `templates` directly — meaning full functionality depends on the editor/customize feature (which creates `projects` rows). Until then, these tables stay empty for the current view+share-only phase.