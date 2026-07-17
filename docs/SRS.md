# Software Requirements Specification

## Scope
A mobile-first tool for real estate dealers to browse admin-curated marketing templates and share them for lead generation. Current phase: view + share only, no in-app editing.

## Actors
- **Admin** — uploads/manages templates, marks featured
- **User (dealer)** — browses, previews, shares templates; manages own profile/branding

## Functional Requirements
- FR1: Users authenticate via Google OAuth
- FR2: Users can browse templates by trending/latest and by property
- FR3: Users can preview a template's media before sharing
- FR4: Users can share a template via WhatsApp, Facebook, or download it
- FR5: Users can manage profile info, branding, and notification preferences
- FR6: Admins can upload and feature templates

## Non-Functional Requirements
- Mobile-first responsive UI
- Session-based auth via secure httpOnly cookies
- No password storage (OAuth-only)

## Out of Scope (current phase)
- In-app template customization/editing
- User media uploads
- Real-time collaboration