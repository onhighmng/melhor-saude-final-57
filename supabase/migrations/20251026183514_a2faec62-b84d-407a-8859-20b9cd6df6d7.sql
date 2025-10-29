-- Phase 1: Fix Critical Database Schema Issues for User Role

-- Step 1.1: Add missing pillar column to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS pillar TEXT;

-- Migrate existing data from pillar_specialties array to pillar text
UPDATE bookings 
SET pillar = pillar_specialties[1]
WHERE pillar IS NULL AND pillar_specialties IS NOT NULL AND array_length(pillar_specialties, 1) > 0;

-- Set default for new bookings
ALTER TABLE bookings 
ALTER COLUMN pillar SET DEFAULT 'saude_mental';

-- Step 1.2: Add missing columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance on metadata
CREATE INDEX IF NOT EXISTS idx_profiles_metadata ON profiles USING GIN (metadata);

-- Step 1.3: Add category to feedback table
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Step 1.4: Ensure prestadores has user_id relationship index
CREATE INDEX IF NOT EXISTS idx_prestadores_user_id ON prestadores(user_id);

-- Step 1.5: Add constraints for data integrity
-- Add check constraint for valid pillars
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS valid_pillar;

ALTER TABLE bookings
ADD CONSTRAINT valid_pillar CHECK (
  pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')
);

-- Ensure feedback has valid ratings
ALTER TABLE feedback
DROP CONSTRAINT IF EXISTS valid_rating;

ALTER TABLE feedback
ADD CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5);