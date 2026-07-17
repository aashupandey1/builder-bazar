# UI Spec

## Screens
- **Dashboard** — trending templates grid, bottom nav
- **Gallery** — full template list with type/property filters
- **Preview** — full-screen media, "Customize" (disabled) + "Share Now" buttons
- **Share Modal** — bottom sheet: WhatsApp, Facebook, Download (active); Save to My Studio, Share with Team (disabled)
- **Projects** — property list, search + location filter
- **My Studio** — tabs: Recent, Favorites, Drafts (empty until editor ships)
- **Profile** — avatar/name/email, expandable sections: Branding, Profile Info, Notifications; Logout button

## Bottom Navigation
Dashboard · Projects · **+ (disabled, future upload)** · My Studio · Profile

## Design Notes
- Disabled buttons: 40–45% opacity, `cursor: not-allowed`, `title="Coming soon"`
- Primary action color: `#2f5fe0`
- Destructive action (Logout): `#e5484d`