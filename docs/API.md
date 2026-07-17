# API Documentation

Base URL: `/api/v1`
Auth: Google OAuth via cookie session. Routes marked 🔒 require login (`auth` middleware).

## Auth
| Method | Path | Description |
|---|---|---|
| GET | `/auth/google` | Start Google OAuth login |
| GET | `/auth/google/callback` | OAuth callback, sets session cookie |
| GET 🔒 | `/auth/me` | Get logged-in user |
| POST | `/auth/logout` | Logout |

## Templates
| Method | Path | Description |
|---|---|---|
| GET | `/templates?sort=trending\|latest&project_id=&type=` | List templates |
| POST | `/templates/:id/view` | Increment usage count (view/share tracking) |
| PATCH 🔒 | `/templates/:id/feature` | Mark template as featured (admin) |

## Properties 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/properties` | List real-estate properties |

## Projects (My Studio — saved editor work) 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/projects` | List user's projects |
| GET | `/projects/:id` | Get one project |
| POST | `/projects` | Create project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

## Favorites 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/favorites` | List favorited projects |
| POST | `/favorites/:projectId` | Add favorite |
| DELETE | `/favorites/:projectId` | Remove favorite |

## Profile 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get name, email, phone, avatar |
| PUT | `/profile` | Update profile fields |

## Branding 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/branding` | Get company name & tagline |
| PUT | `/branding` | Update branding |

## Notification Settings 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/notification-settings` | Get push/email/sms toggle preferences |
| PUT | `/notification-settings` | Update preferences (partial update supported) |

## Notifications (feed) 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |

## Media, Upload, Render, Share, Editor, User
Scaffolded (`GET /`) but not fully implemented — reserved for the future Customize/editor phase.