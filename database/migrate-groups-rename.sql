-- =====================================================
-- Builder Bazar — MIGRATION SQL (deploy with Neon SQL Editor)
-- Do NOT run against local DB or drop tables.
-- Block 1 already executed — skip it.
-- =====================================================

-- ─────────────────────────────────────────────────────
-- BLOCK 1: ALREADY DONE — skip
-- (groups table + properties.group_id nullable FK)
-- ─────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────
-- BLOCK 2: WAIT FOR EXPLICIT GO
-- Run only after all code changes in steps (1)-(4) are
-- deployed and confirmed stable on Neon.
-- ─────────────────────────────────────────────────────

-- Renames table: properties → listings
-- ALTER TABLE properties RENAME TO listings;

-- Renames column: templates.project_id → listing_id
-- ALTER TABLE templates RENAME COLUMN project_id TO listing_id;

-- ─────────────────────────────────────────────────────
-- BLOCK 3: WAIT FOR EXPLICIT GO (run AFTER Block 2)
-- Both duplicate constraint names confirmed by user:
--   properties_name_location_uniq
--   properties_name_location_unique
-- Both must be dropped before adding the new one.
-- ─────────────────────────────────────────────────────

-- Drop both duplicate (name, location) constraints:
-- ALTER TABLE listings DROP CONSTRAINT IF EXISTS properties_name_location_uniq;
-- ALTER TABLE listings DROP CONSTRAINT IF EXISTS properties_name_location_unique;

-- Add the new re-scoped unique constraint (name, location, group_id)
-- so two different builders can both have a project with the same name+location:
-- ALTER TABLE listings
--   ADD CONSTRAINT unique_listing_per_group UNIQUE (name, location, group_id);

-- =====================================================
-- ROLLBACK PLAN
-- =====================================================
-- Undo Block 3 (constraint):
--   ALTER TABLE listings DROP CONSTRAINT IF EXISTS unique_listing_per_group;
--   ALTER TABLE listings ADD CONSTRAINT properties_name_location_unique UNIQUE (name, location);
--
-- Undo Block 2 (renames):
--   ALTER TABLE listings RENAME TO properties;
--   ALTER TABLE templates RENAME COLUMN listing_id TO project_id;
--
-- Undo Block 1 (already done — only if rollback needed):
--   ALTER TABLE properties DROP COLUMN IF EXISTS group_id;
--   DROP TABLE IF EXISTS groups;
-- =====================================================
