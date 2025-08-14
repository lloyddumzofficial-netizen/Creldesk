/*
  # Add onboarding fields to profiles table

  1. New Columns
    - `role` (text) - User's selected role
    - `custom_role` (text) - Custom role if "Other" selected
    - `goals` (text[]) - Array of selected goals
    - `experience_level` (text) - User's experience level
    - `onboarding_completed` (boolean) - Whether user completed onboarding
    - `onboarding_completed_at` (timestamptz) - When onboarding was completed

  2. Updates
    - Add default values for new fields
    - Ensure existing users are not prompted for onboarding
*/

-- Add onboarding fields to profiles table
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text;
  END IF;

  -- Add custom_role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_role text;
  END IF;

  -- Add goals column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'goals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN goals text[] DEFAULT '{}';
  END IF;

  -- Add experience_level column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'experience_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN experience_level text;
  END IF;

  -- Add onboarding_completed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  -- Add onboarding_completed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;

-- Mark existing users as having completed onboarding to avoid showing survey
UPDATE profiles 
SET onboarding_completed = true, 
    onboarding_completed_at = now()
WHERE onboarding_completed IS NULL OR onboarding_completed = false;

-- Add constraints for role and experience_level
DO $$
BEGIN
  -- Add role constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'freelancer', 'employee', 'business-owner', 'founder', 'other') OR role IS NULL);
  END IF;

  -- Add experience_level constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_experience_level_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_experience_level_check 
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced') OR experience_level IS NULL);
  END IF;
END $$;