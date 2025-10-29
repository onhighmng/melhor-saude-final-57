-- Testing & Performance Tables Migration
-- This migration creates tables for testing, performance monitoring, and system health checks

-- Test cases table
CREATE TABLE IF NOT EXISTS test_cases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('unit', 'integration', 'e2e', 'performance', 'security')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    test_function TEXT NOT NULL,
    expected_result JSONB,
    test_data JSONB,
    dependencies TEXT[],
    tags TEXT[],
    active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test suites table
CREATE TABLE IF NOT EXISTS test_suites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    test_cases TEXT[] NOT NULL,
    execution_order TEXT DEFAULT 'sequential' CHECK (execution_order IN ('sequential', 'parallel')),
    timeout_ms INTEGER DEFAULT 30000,
    retry_count INTEGER DEFAULT 0,
    tags TEXT[],
    active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    test_case_id TEXT NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped', 'error')),
    execution_time_ms INTEGER NOT NULL,
    actual_result JSONB,
    error_message TEXT,
    error_stack TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    executed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    environment TEXT DEFAULT 'test',
    metadata JSONB DEFAULT '{}'
);

-- Performance tests table
CREATE TABLE IF NOT EXISTS performance_tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
    headers JSONB,
    body JSONB,
    expected_response_time_ms INTEGER NOT NULL,
    expected_status_code INTEGER NOT NULL,
    concurrent_users INTEGER DEFAULT 1,
    duration_seconds INTEGER DEFAULT 60,
    ramp_up_seconds INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance test results table
CREATE TABLE IF NOT EXISTS performance_test_results (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL REFERENCES performance_tests(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    concurrent_users INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    total_requests INTEGER NOT NULL,
    successful_requests INTEGER NOT NULL,
    failed_requests INTEGER NOT NULL,
    average_response_time NUMERIC NOT NULL,
    min_response_time NUMERIC NOT NULL,
    max_response_time NUMERIC NOT NULL,
    requests_per_second NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security tests table
CREATE TABLE IF NOT EXISTS security_tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    test_type TEXT NOT NULL CHECK (test_type IN ('sql_injection', 'xss', 'csrf', 'authentication', 'authorization', 'input_validation')),
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
    payload JSONB,
    expected_behavior TEXT NOT NULL CHECK (expected_behavior IN ('block', 'allow', 'redirect')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security test results table
CREATE TABLE IF NOT EXISTS security_test_results (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL REFERENCES security_tests(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    expected_behavior TEXT NOT NULL,
    actual_behavior TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    details JSONB,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('greater_than', 'less_than', 'equals', 'not_equals')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    enabled BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance reports table
CREATE TABLE IF NOT EXISTS performance_reports (
    id TEXT PRIMARY KEY,
    report_name TEXT NOT NULL,
    metrics TEXT[] NOT NULL,
    time_range JSONB NOT NULL,
    aggregation TEXT NOT NULL CHECK (aggregation IN ('average', 'sum', 'min', 'max', 'count')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    data JSONB NOT NULL,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_cases_category ON test_cases(category);
CREATE INDEX IF NOT EXISTS idx_test_cases_priority ON test_cases(priority);
CREATE INDEX IF NOT EXISTS idx_test_cases_active ON test_cases(active);
CREATE INDEX IF NOT EXISTS idx_test_cases_created_at ON test_cases(created_at);

CREATE INDEX IF NOT EXISTS idx_test_suites_active ON test_suites(active);
CREATE INDEX IF NOT EXISTS idx_test_suites_created_at ON test_suites(created_at);

CREATE INDEX IF NOT EXISTS idx_test_results_test_case_id ON test_results(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
CREATE INDEX IF NOT EXISTS idx_test_results_executed_at ON test_results(executed_at);
CREATE INDEX IF NOT EXISTS idx_test_results_environment ON test_results(environment);

CREATE INDEX IF NOT EXISTS idx_performance_tests_active ON performance_tests(active);
CREATE INDEX IF NOT EXISTS idx_performance_tests_created_at ON performance_tests(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_test_results_test_id ON performance_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_performance_test_results_start_time ON performance_test_results(start_time);
CREATE INDEX IF NOT EXISTS idx_performance_test_results_created_at ON performance_test_results(created_at);

CREATE INDEX IF NOT EXISTS idx_security_tests_test_type ON security_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_security_tests_severity ON security_tests(severity);
CREATE INDEX IF NOT EXISTS idx_security_tests_active ON security_tests(active);
CREATE INDEX IF NOT EXISTS idx_security_tests_created_at ON security_tests(created_at);

CREATE INDEX IF NOT EXISTS idx_security_test_results_test_id ON security_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_security_test_results_test_type ON security_test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_security_test_results_passed ON security_test_results(passed);
CREATE INDEX IF NOT EXISTS idx_security_test_results_created_at ON security_test_results(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_metric_name ON performance_alerts(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_enabled ON performance_alerts(enabled);

CREATE INDEX IF NOT EXISTS idx_performance_reports_report_name ON performance_reports(report_name);
CREATE INDEX IF NOT EXISTS idx_performance_reports_generated_at ON performance_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_performance_reports_created_at ON performance_reports(created_at);

-- RLS policies
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

-- Admin can access all testing data
CREATE POLICY "Admins can access all test cases" ON test_cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all test suites" ON test_suites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all test results" ON test_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all performance tests" ON performance_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all performance test results" ON performance_test_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all security tests" ON security_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all security test results" ON security_test_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all performance alerts" ON performance_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can access all performance reports" ON performance_reports
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
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_tests_updated_at BEFORE UPDATE ON performance_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_tests_updated_at BEFORE UPDATE ON security_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_alerts_updated_at BEFORE UPDATE ON performance_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create performance alert for failed tests
CREATE OR REPLACE FUNCTION create_performance_alert_for_failed_test()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'failed' OR NEW.status = 'error' THEN
        INSERT INTO performance_alerts (
            id,
            metric_name,
            threshold,
            operator,
            severity,
            enabled,
            created_at
        ) VALUES (
            'alert_' || NEW.id,
            'test_failure_rate',
            0,
            'greater_than',
            'high',
            true,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create performance alert for failed tests
CREATE TRIGGER create_performance_alert_for_failed_test_trigger
    AFTER INSERT ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION create_performance_alert_for_failed_test();

-- Insert default test cases
INSERT INTO test_cases (id, name, description, category, priority, test_function, expected_result, active) VALUES
    ('test_user_registration', 'User Registration Validation', 'Test user registration form validation',
     'unit', 'high', 'validateUserRegistration', '{"valid": true, "errors": []}', true),
    ('test_company_creation', 'Company Creation Validation', 'Test company creation form validation',
     'unit', 'high', 'validateCompanyCreation', '{"valid": true, "errors": []}', true),
    ('test_booking_creation', 'Booking Creation Validation', 'Test booking creation form validation',
     'unit', 'high', 'validateBookingCreation', '{"valid": true, "errors": []}', true),
    ('test_database_connection', 'Database Connection', 'Test database connectivity',
     'integration', 'critical', 'testDatabaseConnection', '{"connected": true}', true),
    ('test_email_service', 'Email Service', 'Test email service availability',
     'integration', 'high', 'testEmailService', '{"service_available": true}', true),
    ('test_sms_service', 'SMS Service', 'Test SMS service availability',
     'integration', 'high', 'testSMSService', '{"service_available": true}', true),
    ('test_payment_service', 'Payment Service', 'Test payment service availability',
     'integration', 'high', 'testPaymentService', '{"service_available": true}', true),
    ('test_webhook_service', 'Webhook Service', 'Test webhook service availability',
     'integration', 'high', 'testWebhookService', '{"service_available": true}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default test suites
INSERT INTO test_suites (id, name, description, test_cases, execution_order, timeout_ms, active) VALUES
    ('suite_validation_tests', 'Validation Tests', 'Test suite for form validation',
     ARRAY['test_user_registration', 'test_company_creation', 'test_booking_creation'], 'sequential', 30000, true),
    ('suite_integration_tests', 'Integration Tests', 'Test suite for service integration',
     ARRAY['test_database_connection', 'test_email_service', 'test_sms_service', 'test_payment_service', 'test_webhook_service'], 'parallel', 60000, true),
    ('suite_full_regression', 'Full Regression Tests', 'Complete test suite for regression testing',
     ARRAY['test_user_registration', 'test_company_creation', 'test_booking_creation', 'test_database_connection', 'test_email_service', 'test_sms_service', 'test_payment_service', 'test_webhook_service'], 'sequential', 120000, true)
ON CONFLICT (id) DO NOTHING;

-- Insert default performance tests
INSERT INTO performance_tests (id, name, description, endpoint, method, expected_response_time_ms, expected_status_code, concurrent_users, duration_seconds, active) VALUES
    ('perf_api_response', 'API Response Time', 'Test API response time under load',
     '/api/users', 'GET', 500, 200, 10, 60, true),
    ('perf_database_query', 'Database Query Performance', 'Test database query performance',
     '/api/bookings', 'GET', 200, 200, 5, 30, true),
    ('perf_email_sending', 'Email Sending Performance', 'Test email sending performance',
     '/api/emails', 'POST', 1000, 200, 3, 45, true)
ON CONFLICT (id) DO NOTHING;

-- Insert default security tests
INSERT INTO security_tests (id, name, description, test_type, endpoint, method, payload, expected_behavior, severity, active) VALUES
    ('sec_sql_injection', 'SQL Injection Test', 'Test for SQL injection vulnerabilities',
     'sql_injection', '/api/users', 'POST', '{"email": "test@test.com; DROP TABLE users; --"}', 'block', 'critical', true),
    ('sec_xss_test', 'XSS Test', 'Test for cross-site scripting vulnerabilities',
     'xss', '/api/feedback', 'POST', '{"message": "<script>alert(\"XSS\")</script>"}', 'block', 'high', true),
    ('sec_auth_test', 'Authentication Test', 'Test authentication mechanisms',
     'authentication', '/api/admin', 'GET', '{}', 'block', 'high', true),
    ('sec_csrf_test', 'CSRF Test', 'Test for CSRF vulnerabilities',
     'csrf', '/api/bookings', 'POST', '{"booking_data": "malicious"}', 'block', 'medium', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default performance alerts
INSERT INTO performance_alerts (id, metric_name, threshold, operator, severity, enabled) VALUES
    ('alert_api_response_time', 'api_response_time', 1000, 'greater_than', 'warning', true),
    ('alert_database_query_time', 'database_query_time', 500, 'greater_than', 'warning', true),
    ('alert_email_response_time', 'email_response_time', 2000, 'greater_than', 'warning', true),
    ('alert_sms_response_time', 'sms_response_time', 3000, 'greater_than', 'warning', true),
    ('alert_payment_response_time', 'payment_response_time', 5000, 'greater_than', 'warning', true),
    ('alert_webhook_response_time', 'webhook_response_time', 1500, 'greater_than', 'warning', true),
    ('alert_system_cpu_usage', 'system_cpu_usage', 80, 'greater_than', 'critical', true),
    ('alert_system_memory_usage', 'system_memory_usage', 85, 'greater_than', 'critical', true),
    ('alert_system_disk_usage', 'system_disk_usage', 90, 'greater_than', 'critical', true)
ON CONFLICT (id) DO NOTHING;
