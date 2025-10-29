-- Error Handling & Validation Tables Migration
-- This migration creates tables for error logging, validation, and support tickets

-- Error logging table
CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('error', 'warning', 'info', 'debug')),
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB NOT NULL DEFAULT '{}',
    user_agent TEXT,
    url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    category TEXT CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'general')),
    assigned_to TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    error_log_id TEXT REFERENCES error_logs(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Support ticket comments
CREATE TABLE IF NOT EXISTS support_ticket_comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation rules table
CREATE TABLE IF NOT EXISTS validation_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rules JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation logs table
CREATE TABLE IF NOT EXISTS validation_logs (
    id TEXT PRIMARY KEY,
    rule_id TEXT REFERENCES validation_rules(id) ON DELETE SET NULL,
    field TEXT NOT NULL,
    value TEXT,
    valid BOOLEAN NOT NULL,
    error_message TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System health checks table
CREATE TABLE IF NOT EXISTS system_health_checks (
    id TEXT PRIMARY KEY,
    check_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    message TEXT,
    details JSONB DEFAULT '{}',
    response_time_ms INTEGER,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_change', 'permission_denied', 'suspicious_activity')),
    user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_context ON error_logs USING GIN(context);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket_id ON support_ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_author_id ON support_ticket_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_created_at ON support_ticket_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_validation_rules_name ON validation_rules(name);
CREATE INDEX IF NOT EXISTS idx_validation_rules_active ON validation_rules(active);

CREATE INDEX IF NOT EXISTS idx_validation_logs_rule_id ON validation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_field ON validation_logs(field);
CREATE INDEX IF NOT EXISTS idx_validation_logs_valid ON validation_logs(valid);
CREATE INDEX IF NOT EXISTS idx_validation_logs_created_at ON validation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_system_health_checks_status ON system_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_checked_at ON system_health_checks(checked_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Admin can access all error handling data
CREATE POLICY "Admins can access all error logs" ON error_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all support tickets" ON support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can access their own support tickets" ON support_tickets
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all support ticket comments" ON support_ticket_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can access comments on their tickets" ON support_ticket_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = support_ticket_comments.ticket_id 
            AND support_tickets.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all validation rules" ON validation_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all validation logs" ON validation_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all system health checks" ON system_health_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all performance metrics" ON performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all security logs" ON security_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_error_logs_updated_at BEFORE UPDATE ON error_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_ticket_comments_updated_at BEFORE UPDATE ON support_ticket_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at BEFORE UPDATE ON validation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create support ticket for critical errors
CREATE OR REPLACE FUNCTION create_support_ticket_for_critical_error()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.level = 'error' AND NEW.resolved = false THEN
        INSERT INTO support_tickets (
            id,
            title,
            description,
            priority,
            status,
            category,
            error_log_id,
            created_at
        ) VALUES (
            'ticket_' || NEW.id,
            'Critical Error: ' || NEW.message,
            'Error ID: ' || NEW.id || E'\n\n' ||
            'Message: ' || NEW.message || E'\n\n' ||
            'Context: ' || NEW.context::text,
            'high',
            'open',
            'bug_report',
            NEW.id,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create support ticket for critical errors
CREATE TRIGGER create_support_ticket_for_critical_error_trigger
    AFTER INSERT ON error_logs
    FOR EACH ROW
    EXECUTE FUNCTION create_support_ticket_for_critical_error();

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_user_id TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_severity TEXT DEFAULT 'medium'
)
RETURNS TEXT AS $$
DECLARE
    event_id TEXT;
BEGIN
    event_id := 'sec_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    INSERT INTO security_logs (
        id,
        event_type,
        user_id,
        ip_address,
        user_agent,
        details,
        severity,
        created_at
    ) VALUES (
        event_id,
        p_event_type,
        p_user_id,
        p_ip_address,
        p_user_agent,
        p_details,
        p_severity,
        NOW()
    );
    
    RETURN event_id;
END;
$$ language 'plpgsql';

-- Function to record performance metrics
CREATE OR REPLACE FUNCTION record_performance_metric(
    p_metric_name TEXT,
    p_metric_value NUMERIC,
    p_metric_unit TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '{}'
)
RETURNS TEXT AS $$
DECLARE
    metric_id TEXT;
BEGIN
    metric_id := 'perf_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    INSERT INTO performance_metrics (
        id,
        metric_name,
        metric_value,
        metric_unit,
        tags,
        recorded_at,
        created_at
    ) VALUES (
        metric_id,
        p_metric_name,
        p_metric_value,
        p_metric_unit,
        p_tags,
        NOW(),
        NOW()
    );
    
    RETURN metric_id;
END;
$$ language 'plpgsql';

-- Function to perform system health check
CREATE OR REPLACE FUNCTION perform_system_health_check(
    p_check_name TEXT,
    p_status TEXT,
    p_message TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    check_id TEXT;
BEGIN
    check_id := 'health_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    INSERT INTO system_health_checks (
        id,
        check_name,
        status,
        message,
        details,
        response_time_ms,
        checked_at,
        created_at
    ) VALUES (
        check_id,
        p_check_name,
        p_status,
        p_message,
        p_details,
        p_response_time_ms,
        NOW(),
        NOW()
    );
    
    RETURN check_id;
END;
$$ language 'plpgsql';

-- Insert default validation rules
INSERT INTO validation_rules (id, name, description, rules, active) VALUES
    ('rule_user_registration', 'User Registration', 'Validation rules for user registration',
     '{"rules": [{"field": "email", "type": "required", "message": "Email is required"}, {"field": "email", "type": "email", "message": "Invalid email format"}, {"field": "password", "type": "required", "message": "Password is required"}, {"field": "password", "type": "min_length", "value": 8, "message": "Password must be at least 8 characters"}, {"field": "name", "type": "required", "message": "Name is required"}, {"field": "name", "type": "min_length", "value": 2, "message": "Name must be at least 2 characters"}]}',
     true),
    ('rule_company_creation', 'Company Creation', 'Validation rules for company creation',
     '{"rules": [{"field": "company_name", "type": "required", "message": "Company name is required"}, {"field": "company_name", "type": "min_length", "value": 2, "message": "Company name must be at least 2 characters"}, {"field": "contact_email", "type": "required", "message": "Contact email is required"}, {"field": "contact_email", "type": "email", "message": "Invalid email format"}]}',
     true),
    ('rule_booking_creation', 'Booking Creation', 'Validation rules for booking creation',
     '{"rules": [{"field": "user_id", "type": "required", "message": "User ID is required"}, {"field": "prestador_id", "type": "required", "message": "Provider ID is required"}, {"field": "pillar", "type": "required", "message": "Pillar is required"}, {"field": "session_date", "type": "required", "message": "Session date is required"}, {"field": "session_time", "type": "required", "message": "Session time is required"}]}',
     true)
ON CONFLICT (id) DO NOTHING;

-- Insert default system health checks
INSERT INTO system_health_checks (id, check_name, status, message, checked_at) VALUES
    ('health_database', 'Database Connection', 'healthy', 'Database connection is working', NOW()),
    ('health_email_service', 'Email Service', 'healthy', 'Email service is operational', NOW()),
    ('health_sms_service', 'SMS Service', 'healthy', 'SMS service is operational', NOW()),
    ('health_payment_service', 'Payment Service', 'healthy', 'Payment service is operational', NOW()),
    ('health_webhook_service', 'Webhook Service', 'healthy', 'Webhook service is operational', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert default performance metrics
INSERT INTO performance_metrics (id, metric_name, metric_value, metric_unit, recorded_at) VALUES
    ('perf_response_time', 'Average Response Time', 150, 'ms', NOW()),
    ('perf_memory_usage', 'Memory Usage', 75, '%', NOW()),
    ('perf_cpu_usage', 'CPU Usage', 45, '%', NOW()),
    ('perf_disk_usage', 'Disk Usage', 60, '%', NOW()),
    ('perf_active_users', 'Active Users', 1250, 'count', NOW())
ON CONFLICT (id) DO NOTHING;
