-- users: login + role (admin vs normal user)
CREATE TABLE
  users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(20) DEFAULT 'google',
    role VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
    created_at TIMESTAMP DEFAULT NOW (),
    updated_at TIMESTAMP DEFAULT NOW ()
  );

-- templates: admin-uploaded ready content (poster/video/story/banner)
CREATE TABLE
  templates (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'Video' | 'Reel' | 'Poster' | 'Story' | 'Banner'
    title VARCHAR(255),
    subtitle VARCHAR(255), -- project/property name shown under title
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    usage_count INTEGER DEFAULT 0, -- ponytail: one counter for view+use, split later if needed
    created_by INTEGER REFERENCES users (id),
    created_at TIMESTAMP DEFAULT NOW ()
  );

-- media: user-uploaded images (logo gallery, background images)
CREATE TABLE
  media (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    type VARCHAR(20) NOT NULL, -- 'logo' | 'background' | 'music'
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW ()
  );

-- projects: user's own editor work (LivePreview save)
CREATE TABLE
  projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) NOT NULL,
    template_id INTEGER REFERENCES templates (id), -- null agar scratch se banaya
    title VARCHAR(255),
    data JSONB NOT NULL, -- layers/filters/music/text — poora editor state
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT NOW (),
    updated_at TIMESTAMP DEFAULT NOW ()
  );

-- project_shares: "Share with Team" ke liye
CREATE TABLE
  project_shares (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects (id) NOT NULL,
    shared_by INTEGER REFERENCES users (id) NOT NULL,
    shared_with INTEGER REFERENCES users (id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW ()
  );

-- =====================================================
-- PROFILE MODULE
-- =====================================================
-- Add phone column to users (if not exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- =====================================================
-- BRANDING
-- =====================================================
CREATE TABLE
  IF NOT EXISTS branding (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- =====================================================
-- NOTIFICATION SETTINGS
-- =====================================================
CREATE TABLE
  IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE
  IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- =====================================================
-- FAVORITES
-- =====================================================
CREATE TABLE
  IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_favorite UNIQUE (user_id, project_id)
  );

-- =====================================================
-- DOWNLOADS
-- =====================================================
CREATE TABLE
  IF NOT EXISTS downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

-- =====================================================
-- PROPERTIES (real-estate projects that templates belong to —
-- distinct from `projects` table, which is a user's saved editor work)
-- =====================================================
CREATE TABLE
  IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

ALTER TABLE templates
ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES properties (id);

ALTER TABLE templates
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;