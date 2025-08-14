/*
  # Fix Messaging System - Remove Custom Functions

  This migration removes the dependency on custom RPC functions and uses standard SQL queries instead.
  
  1. Tables
     - All messaging tables already exist from previous migration
  
  2. Security
     - RLS policies already configured
  
  3. Changes
     - Remove dependency on custom functions
     - Use standard SQL queries for better compatibility
*/

-- No additional database changes needed
-- The messaging store will be updated to use standard queries instead of RPC functions