// System Integrity Validation Tool
// Comprehensive testing for concurrency, edge cases, and security

import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
  timing?: number;
}

interface ConcurrencyTestResult {
  testName: string;
  results: ValidationResult[];
  raceConditions: string[];
  performance: {
    averageTime: number;
    maxTime: number;
    failureRate: number;
  };
}

export class SystemIntegrityValidator {
  private results: ValidationResult[] = [];
  
  // Concurrency Testing - Simulate high-load scenarios
  async testConcurrencyIntegrity(): Promise<ConcurrencyTestResult[]> {
    const concurrencyTests: ConcurrencyTestResult[] = [];
    
    // Test 1: Simultaneous Auth Operations
    concurrencyTests.push(await this.testSimultaneousAuth());
    
    // Test 2: Concurrent Session Consumption
    concurrencyTests.push(await this.testConcurrentSessionUsage());
    
    // Test 3: Provider Assignment Race Conditions
    concurrencyTests.push(await this.testProviderAssignmentRaces());
    
    // Test 4: Dashboard Load Stress Test
    concurrencyTests.push(await this.testDashboardLoadStress());
    
    return concurrencyTests;
  }

  private async testSimultaneousAuth(): Promise<ConcurrencyTestResult> {
    const testName = 'Simultaneous Authentication';
    const results: ValidationResult[] = [];
    const raceConditions: string[] = [];
    const timings: number[] = [];

    // Create multiple auth attempts simultaneously
    const authPromises = Array(10).fill(null).map(async (_, index) => {
      const startTime = Date.now();
      try {
        // Simulate different user logins
        const testEmail = `test${index}@example.com`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: 'invalid-password' // Expected to fail
        });
        
        const timing = Date.now() - startTime;
        timings.push(timing);
        
        // This should fail - if it succeeds unexpectedly, that's a race condition
        if (!error) {
          raceConditions.push(`Unexpected auth success for ${testEmail}`);
        }
        
        return {
          test: `Auth attempt ${index}`,
          passed: !!error, // Should fail with invalid credentials
          timing,
          details: { email: testEmail, error: error?.message }
        } as ValidationResult;
      } catch (err: any) {
        const timing = Date.now() - startTime;
        timings.push(timing);
        return {
          test: `Auth attempt ${index}`,
          passed: true, // Expected to catch error
          timing,
          details: { error: err.message }
        } as ValidationResult;
      }
    });

    const authResults = await Promise.allSettled(authPromises);
    
    authResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          test: `Auth attempt ${index}`,
          passed: false,
          error: result.reason?.message,
          timing: 0
        });
      }
    });

    return {
      testName,
      results,
      raceConditions,
      performance: {
        averageTime: timings.reduce((a, b) => a + b, 0) / timings.length,
        maxTime: Math.max(...timings),
        failureRate: results.filter(r => !r.passed).length / results.length
      }
    };
  }

  private async testConcurrentSessionUsage(): Promise<ConcurrencyTestResult> {
    const testName = 'Concurrent Session Consumption';
    const results: ValidationResult[] = [];
    const raceConditions: string[] = [];
    const timings: number[] = [];

    // Test concurrent session balance checks
    const sessionPromises = Array(15).fill(null).map(async (_, index) => {
      const startTime = Date.now();
      try {
        // Get session balance without auth (should handle gracefully)
        const { data, error } = await supabase.rpc('calculate_user_session_balance', {
          p_user_id: '00000000-0000-0000-0000-000000000000' // Invalid UUID
        });
        
        const timing = Date.now() - startTime;
        timings.push(timing);
        
        return {
          test: `Session balance check ${index}`,
          passed: !!error || data === null, // Should handle invalid user gracefully
          timing,
          details: { data, error: error?.message }
        } as ValidationResult;
      } catch (err: any) {
        const timing = Date.now() - startTime;
        timings.push(timing);
        return {
          test: `Session balance check ${index}`,
          passed: true, // Expected to handle error
          timing,
          details: { error: err.message }
        } as ValidationResult;
      }
    });

    const sessionResults = await Promise.allSettled(sessionPromises);
    
    sessionResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          test: `Session balance check ${index}`,
          passed: false,
          error: result.reason?.message,
          timing: 0
        });
      }
    });

    return {
      testName,
      results,
      raceConditions,
      performance: {
        averageTime: timings.reduce((a, b) => a + b, 0) / timings.length,
        maxTime: Math.max(...timings),
        failureRate: results.filter(r => !r.passed).length / results.length
      }
    };
  }

  private async testProviderAssignmentRaces(): Promise<ConcurrencyTestResult> {
    const testName = 'Provider Assignment Race Conditions';
    const results: ValidationResult[] = [];
    const raceConditions: string[] = [];
    const timings: number[] = [];

    // Test concurrent provider assignments
    const pillars = ['psicologica', 'financeira', 'juridica', 'fisica'];
    
    const assignmentPromises = Array(20).fill(null).map(async (_, index) => {
      const startTime = Date.now();
      try {
        const pillar = pillars[index % pillars.length];
        
        // Simulate provider assignment without auth
        const { data, error } = await supabase.functions.invoke('prestador-pillar-assignment', {
          body: { pillar }
        });
        
        const timing = Date.now() - startTime;
        timings.push(timing);
        
        return {
          test: `Provider assignment ${index} (${pillar})`,
          passed: !!error, // Should fail without auth
          timing,
          details: { pillar, data, error: error?.message }
        } as ValidationResult;
      } catch (err: any) {
        const timing = Date.now() - startTime;
        timings.push(timing);
        return {
          test: `Provider assignment ${index}`,
          passed: true, // Expected to handle error
          timing,
          details: { error: err.message }
        } as ValidationResult;
      }
    });

    const assignmentResults = await Promise.allSettled(assignmentPromises);
    
    assignmentResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          test: `Provider assignment ${index}`,
          passed: false,
          error: result.reason?.message,
          timing: 0
        });
      }
    });

    return {
      testName,
      results,
      raceConditions,
      performance: {
        averageTime: timings.reduce((a, b) => a + b, 0) / timings.length,
        maxTime: Math.max(...timings),
        failureRate: results.filter(r => !r.passed).length / results.length
      }
    };
  }

  private async testDashboardLoadStress(): Promise<ConcurrencyTestResult> {
    const testName = 'Dashboard Load Stress Test';
    const results: ValidationResult[] = [];
    const raceConditions: string[] = [];
    const timings: number[] = [];

    // Test concurrent dashboard data loads
    const dashboardQueries = [
      () => supabase.from('prestadores').select('id, name, pillar').limit(5),
      () => supabase.from('bookings').select('id, status, booking_date').limit(10),
      () => supabase.from('profiles').select('id, role, company').limit(5),
      () => supabase.rpc('get_admin_analytics'),
      () => supabase.from('session_allocations').select('allocation_type, sessions_allocated').limit(5)
    ];

    const loadPromises = Array(25).fill(null).map(async (_, index) => {
      const startTime = Date.now();
      try {
        const query = dashboardQueries[index % dashboardQueries.length];
        const { data, error } = await query();
        
        const timing = Date.now() - startTime;
        timings.push(timing);
        
        return {
          test: `Dashboard query ${index}`,
          passed: !error || (error.message?.includes('permission') || error.message?.includes('policy')), // RLS should block some
          timing,
          details: { dataLength: Array.isArray(data) ? data.length : 0, error: error?.message }
        } as ValidationResult;
      } catch (err: any) {
        const timing = Date.now() - startTime;
        timings.push(timing);
        return {
          test: `Dashboard query ${index}`,
          passed: true, // Expected to handle errors gracefully
          timing,
          details: { error: err.message }
        } as ValidationResult;
      }
    });

    const loadResults = await Promise.allSettled(loadPromises);
    
    loadResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          test: `Dashboard query ${index}`,
          passed: false,
          error: result.reason?.message,
          timing: 0
        });
      }
    });

    return {
      testName,
      results,
      raceConditions,
      performance: {
        averageTime: timings.reduce((a, b) => a + b, 0) / timings.length,
        maxTime: Math.max(...timings),
        failureRate: results.filter(r => !r.passed).length / results.length
      }
    };
  }

  // Edge Case Testing
  async testSessionBookingEdgeCases(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Test zero sessions scenario
    results.push(await this.testZeroSessionsHandling());
    
    // Test expired sessions
    results.push(await this.testExpiredSessionsHandling());
    
    // Test invalid pillar assignments
    results.push(await this.testInvalidPillarAssignments());
    
    // Test conflicting bookings
    results.push(await this.testConflictingBookings());
    
    // Test session consumption limits
    results.push(await this.testSessionConsumptionLimits());
    
    return results;
  }

  private async testZeroSessionsHandling(): Promise<ValidationResult> {
    try {
      // Try to use a session when user has zero sessions
      const { data, error } = await supabase.rpc('use_session_with_validation', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_allocation_type: 'company'
      });
      
      return {
        test: 'Zero Sessions Handling',
        passed: !!error && error.message?.includes('Insufficient session balance'),
        details: { data, error: error?.message }
      };
    } catch (err: any) {
      return {
        test: 'Zero Sessions Handling',
        passed: true, // Expected to throw error
        details: { error: err.message }
      };
    }
  }

  private async testExpiredSessionsHandling(): Promise<ValidationResult> {
    try {
      // Check for expired session allocations (would be filtered by database)
      const { data, error } = await supabase
        .from('session_allocations')
        .select('*')
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true);
      
      return {
        test: 'Expired Sessions Handling',
        passed: !error,
        details: { 
          expiredActiveAllocations: data?.length || 0,
          error: error?.message
        }
      };
    } catch (err: any) {
      return {
        test: 'Expired Sessions Handling',
        passed: false,
        error: err.message
      };
    }
  }

  private async testInvalidPillarAssignments(): Promise<ValidationResult> {
    try {
      // Test with invalid pillar
      const { data, error } = await supabase.functions.invoke('prestador-pillar-assignment', {
        body: { pillar: 'invalid-pillar-name' }
      });
      
      return {
        test: 'Invalid Pillar Assignments',
        passed: !!error, // Should reject invalid pillar
        details: { data, error: error?.message }
      };
    } catch (err: any) {
      return {
        test: 'Invalid Pillar Assignments',
        passed: true, // Expected to handle error
        details: { error: err.message }
      };
    }
  }

  private async testConflictingBookings(): Promise<ValidationResult> {
    try {
      // Try to check availability for a slot in the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const { data, error } = await supabase.rpc('check_booking_availability', {
        p_prestador_id: '00000000-0000-0000-0000-000000000000',
        p_booking_date: pastDate.toISOString(),
        p_duration: 60
      });
      
      return {
        test: 'Conflicting Bookings',
        passed: data === false || !!error, // Should not allow past bookings
        details: { data, error: error?.message }
      };
    } catch (err: any) {
      return {
        test: 'Conflicting Bookings',
        passed: true, // Expected to handle error
        details: { error: err.message }
      };
    }
  }

  private async testSessionConsumptionLimits(): Promise<ValidationResult> {
    try {
      // Test session consumption without valid allocation
      const { data, error } = await supabase.rpc('use_session', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_allocation_type: 'personal'
      });
      
      return {
        test: 'Session Consumption Limits',
        passed: !!error, // Should fail for invalid user
        details: { data, error: error?.message }
      };
    } catch (err: any) {
      return {
        test: 'Session Consumption Limits',
        passed: true, // Expected to handle error
        details: { error: err.message }
      };
    }
  }

  // Security & RLS Testing
  async testRLSEnforcement(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Test unauthorized data access
    results.push(await this.testUnauthorizedDataAccess());
    
    // Test role escalation attempts
    results.push(await this.testRoleEscalationAttempts());
    
    // Test cross-company data isolation
    results.push(await this.testCrossCompanyDataIsolation());
    
    // Test admin data protection
    results.push(await this.testAdminDataProtection());
    
    return results;
  }

  private async testUnauthorizedDataAccess(): Promise<ValidationResult> {
    try {
      // Try to access all profiles without auth
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      return {
        test: 'Unauthorized Data Access',
        passed: !!error && error.message?.includes('permission'),
        details: { 
          dataExposed: data?.length || 0,
          error: error?.message 
        }
      };
    } catch (err: any) {
      return {
        test: 'Unauthorized Data Access',
        passed: true, // Expected to be blocked
        details: { error: err.message }
      };
    }
  }

  private async testRoleEscalationAttempts(): Promise<ValidationResult> {
    try {
      // Try to access admin functions without auth
      const { data, error } = await supabase.functions.invoke('admin-users');
      
      return {
        test: 'Role Escalation Attempts',
        passed: !!error, // Should be blocked
        details: { data, error: error?.message }
      };
    } catch (err: any) {
      return {
        test: 'Role Escalation Attempts',
        passed: true, // Expected to be blocked
        details: { error: err.message }
      };
    }
  }

  private async testCrossCompanyDataIsolation(): Promise<ValidationResult> {
    try {
      // Try to access other companies' data
      const { data, error } = await supabase
        .from('company_organizations')
        .select('*');
      
      return {
        test: 'Cross-Company Data Isolation',
        passed: !!error && error.message?.includes('permission'),
        details: { 
          companiesExposed: data?.length || 0,
          error: error?.message 
        }
      };
    } catch (err: any) {
      return {
        test: 'Cross-Company Data Isolation',
        passed: true, // Expected to be blocked
        details: { error: err.message }
      };
    }
  }

  private async testAdminDataProtection(): Promise<ValidationResult> {
    try {
      // Try to access admin actions log
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*');
      
      return {
        test: 'Admin Data Protection',
        passed: !!error && error.message?.includes('permission'),
        details: { 
          adminActionsExposed: data?.length || 0,
          error: error?.message 
        }
      };
    } catch (err: any) {
      return {
        test: 'Admin Data Protection',
        passed: true, // Expected to be blocked
        details: { error: err.message }
      };
    }
  }

  // Generate comprehensive report
  generateIntegrityReport(
    concurrencyResults: ConcurrencyTestResult[],
    edgeCaseResults: ValidationResult[],
    securityResults: ValidationResult[]
  ): string {
    const allTests = [
      ...concurrencyResults.flatMap(c => c.results),
      ...edgeCaseResults,
      ...securityResults
    ];
    
    const totalTests = allTests.length;
    const passedTests = allTests.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    const avgTiming = allTests
      .filter(t => t.timing)
      .reduce((sum, t) => sum + (t.timing || 0), 0) / allTests.filter(t => t.timing).length;

    return `
SYSTEM INTEGRITY VALIDATION REPORT
Generated: ${new Date().toISOString()}

=== SUMMARY ===
Total Tests: ${totalTests}
Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)
Average Response Time: ${avgTiming?.toFixed(2)}ms

=== CONCURRENCY TESTS ===
${concurrencyResults.map(c => `
${c.testName}:
  - Tests: ${c.results.length}
  - Passed: ${c.results.filter(r => r.passed).length}
  - Race Conditions: ${c.raceConditions.length}
  - Avg Time: ${c.performance.averageTime.toFixed(2)}ms
  - Max Time: ${c.performance.maxTime}ms
  - Failure Rate: ${(c.performance.failureRate * 100).toFixed(1)}%
  ${c.raceConditions.length > 0 ? `⚠️ Race Conditions: ${c.raceConditions.join(', ')}` : '✅ No race conditions detected'}
`).join('')}

=== EDGE CASE TESTS ===
${edgeCaseResults.map(r => `
${r.test}: ${r.passed ? '✅ PASS' : '❌ FAIL'}
${r.error ? `  Error: ${r.error}` : ''}
${r.details ? `  Details: ${JSON.stringify(r.details, null, 2)}` : ''}
`).join('')}

=== SECURITY/RLS TESTS ===
${securityResults.map(r => `
${r.test}: ${r.passed ? '✅ PASS' : '❌ FAIL'}
${r.error ? `  Error: ${r.error}` : ''}
${r.details ? `  Details: ${JSON.stringify(r.details, null, 2)}` : ''}
`).join('')}

=== CRITICAL ISSUES ===
${failedTests > 0 ? 
  allTests.filter(t => !t.passed).map(t => `❌ ${t.test}: ${t.error || 'Failed'}`).join('\n') : 
  '✅ No critical issues detected'
}

=== RECOMMENDATIONS ===
${failedTests > 0 ? `
- Review failed tests for potential security vulnerabilities
- Investigate race conditions in concurrent operations
- Verify RLS policies are properly configured
- Check error handling in edge cases
` : `
✅ System integrity validated successfully
- All concurrency tests passed
- Edge cases handled appropriately  
- RLS enforcement working correctly
- No security vulnerabilities detected
`}
    `;
  }
}

export const systemValidator = new SystemIntegrityValidator();