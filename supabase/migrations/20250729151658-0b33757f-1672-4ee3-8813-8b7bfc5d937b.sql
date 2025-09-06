-- Create extra services table
CREATE TABLE extra_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE extra_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active extra services"
ON extra_services FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all extra services"
ON extra_services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create service requests table
CREATE TABLE service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES extra_services(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for service requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for service requests
CREATE POLICY "Users can view their own service requests"
ON service_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service requests"
ON service_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all service requests"
ON service_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_extra_services_updated_at
BEFORE UPDATE ON extra_services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();