-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'hr', 'prestador', 'especialista_geral')),
  company_id UUID REFERENCES companies(id),
  department TEXT,
  position TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nuit TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  address TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  number_of_employees INTEGER DEFAULT 0,
  sessions_allocated INTEGER DEFAULT 0,
  sessions_used INTEGER DEFAULT 0,
  sessions_per_employee INTEGER DEFAULT 4,
  session_model TEXT DEFAULT 'pool' CHECK (session_model IN ('pool', 'fixed')),
  price_per_session DECIMAL(10,2),
  hr_contact_person TEXT,
  hr_email TEXT,
  program_start_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  pillars TEXT[] DEFAULT ARRAY['mental', 'physical', 'financial', 'legal'],
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to profiles after companies exists
ALTER TABLE profiles ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);

-- Create company_employees table
CREATE TABLE IF NOT EXISTS company_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT,
  position TEXT,
  sessions_quota INTEGER DEFAULT 10,
  sessions_used INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES profiles(id),
  UNIQUE(company_id, user_id)
);

-- Create prestadores table
CREATE TABLE IF NOT EXISTS prestadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  specialty TEXT,
  specialization TEXT[],
  pillars TEXT[] NOT NULL,
  bio TEXT,
  qualifications TEXT[],
  credentials TEXT,
  languages TEXT[],
  video_intro_url TEXT,
  hourly_rate DECIMAL(10,2),
  cost_per_session DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  experience_years INTEGER DEFAULT 0,
  session_type TEXT CHECK (session_type IN ('virtual', 'presential', 'both')),
  availability JSONB DEFAULT '{}'::jsonb,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  approval_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create prestador_availability table
CREATE TABLE IF NOT EXISTS prestador_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id, day_of_week, start_time)
);

-- Create prestador_schedule table
CREATE TABLE IF NOT EXISTS prestador_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id, date)
);

-- Create prestador_performance table
CREATE TABLE IF NOT EXISTS prestador_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  sessions_completed INTEGER DEFAULT 0,
  sessions_cancelled INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prestador_id, month)
);

-- Create bookings table with all columns
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  prestador_id UUID REFERENCES prestadores(id),
  chat_session_id UUID REFERENCES chat_sessions(id),
  pillar TEXT NOT NULL CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  topic TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  session_type TEXT DEFAULT 'virtual' CHECK (session_type IN ('virtual', 'phone', 'presencial')),
  meeting_type TEXT CHECK (meeting_type IN ('virtual', 'phone')),
  quota_type TEXT DEFAULT 'employer' CHECK (quota_type IN ('employer', 'personal')),
  meeting_link TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  rescheduled_from UUID REFERENCES bookings(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  prediagnostic_completed BOOLEAN DEFAULT false,
  prediagnostic_summary JSONB DEFAULT '{}'::jsonb,
  booking_source TEXT DEFAULT 'direct' CHECK (booking_source IN ('direct', 'referral', 'ai_chat')),
  referral_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create session_recordings table
CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  recording_url TEXT,
  duration INTEGER,
  is_encrypted BOOLEAN DEFAULT true,
  encryption_key TEXT,
  is_transcribed BOOLEAN DEFAULT false,
  transcription_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Create session_notes table
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  prestador_id UUID REFERENCES prestadores(id),
  notes TEXT NOT NULL,
  outcome TEXT,
  is_confidential BOOLEAN DEFAULT true,
  tags TEXT[],
  follow_up_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('individual', 'family', 'corporate')),
  plan_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  sessions_included INTEGER,
  price DECIMAL(10,2),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  company_id UUID REFERENCES companies(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  stripe_invoice_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  user_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider TEXT DEFAULT 'stripe',
  provider_transaction_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  type TEXT CHECK (type IN ('article', 'video', 'podcast', 'guide', 'exercise')),
  pillar TEXT CHECK (pillar IN ('saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica')),
  tags TEXT[],
  thumbnail_url TEXT,
  media_url TEXT,
  duration INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resource_access_log table
CREATE TABLE IF NOT EXISTS resource_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  access_type TEXT CHECK (access_type IN ('view', 'download', 'complete')),
  duration_seconds INTEGER,
  completion_percentage INTEGER CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'hr', 'prestador')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create specialist_assignments table
CREATE TABLE IF NOT EXISTS specialist_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  assigned_by UUID REFERENCES profiles(id),
  pillars TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(specialist_id, company_id)
);

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id),
  category TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create onboarding_data table
CREATE TABLE IF NOT EXISTS onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) UNIQUE,
  wellbeing_score INTEGER CHECK (wellbeing_score BETWEEN 1 AND 10),
  difficulty_areas TEXT[],
  main_goals TEXT[],
  improvement_signs TEXT[],
  frequency TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_company_employees_company_id ON company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_user_id ON company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_prestadores_user_id ON prestadores(user_id);
CREATE INDEX IF NOT EXISTS idx_prestadores_is_approved ON prestadores(is_approved);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_prestador_id ON bookings(prestador_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_resources_pillar ON resources(pillar);
CREATE INDEX IF NOT EXISTS idx_resources_is_published ON resources(is_published);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

