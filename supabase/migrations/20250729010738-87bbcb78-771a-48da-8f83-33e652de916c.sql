-- Fix specialties column to accept text array instead of UUID array
ALTER TABLE prestadores 
ALTER COLUMN specialties TYPE text[] 
USING specialties::text[];