-- Add company_id column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

-- Add missing columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS date DATE;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS start_time TIME;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS end_time TIME;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS rating INTEGER;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Add constraints (using DO block to handle existing constraints)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_rating_check'
  ) THEN
    ALTER TABLE public.bookings 
    ADD CONSTRAINT bookings_rating_check 
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_time_check'
  ) THEN
    ALTER TABLE public.bookings 
    ADD CONSTRAINT bookings_time_check 
    CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON public.bookings(company_id);

-- Populate date from booking_date for existing records
UPDATE public.bookings 
SET date = booking_date::date 
WHERE date IS NULL AND booking_date IS NOT NULL;