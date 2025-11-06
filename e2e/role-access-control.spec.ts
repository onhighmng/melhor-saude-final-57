import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control', () => {
  const roles = [
    { role: 'user', email: 'user@example.com', dashboard: '/user/dashboard' },
    { role: 'admin', email: 'admin@example.com', dashboard: '/admin/dashboard' },
    { role: 'hr', email: 'hr@company.com', dashboard: '/company/dashboard' },
    { role: 'prestador', email: 'prestador@example.com', dashboard: '/prestador/dashboard' },
    { role: 'especialista', email: 'especialista@example.com', dashboard: '/especialista/dashboard' },
  ];

  for (const { role, email, dashboard } of roles) {
    test.describe(`${role.toUpperCase()} Role`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password|senha/i).fill('password123');
        await page.getByRole('button', { name: /entrar|login/i }).click();
        await page.waitForLoadState('networkidle');
      });

      test(`should access own dashboard (${dashboard})`, async ({ page }) => {
        await page.goto(dashboard);
        await expect(page).toHaveURL(dashboard);
        
        // Should see dashboard content
        await expect(page.getByText(/dashboard|painel/i)).toBeVisible();
      });

      test(`should be blocked from accessing other role dashboards`, async ({ page }) => {
        const otherDashboards = roles
          .filter(r => r.role !== role)
          .map(r => r.dashboard);

        for (const otherDashboard of otherDashboards) {
          await page.goto(otherDashboard);
          
          // Should be redirected away
          await page.waitForLoadState('networkidle');
          await expect(page).not.toHaveURL(otherDashboard);
          
          // Should be on correct dashboard
          await expect(page).toHaveURL(dashboard);
        }
      });
    });
  }

  test.describe('Admin Role Specific', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      await page.waitForURL(/\/admin\/dashboard/);
    });

    test('should access user management', async ({ page }) => {
      await page.goto('/admin/users-management');
      await expect(page).toHaveURL(/\/admin\/(users-management|gestao-utilizadores)/);
    });

    test('should access provider management', async ({ page }) => {
      await page.goto('/admin/providers');
      await expect(page).toHaveURL(/\/admin\/(providers|prestadores)/);
    });

    test('should access company management', async ({ page }) => {
      await page.goto('/admin/companies');
      await expect(page).toHaveURL(/\/admin\/(companies|empresas)/);
    });

    test('should access reports', async ({ page }) => {
      await page.goto('/admin/reports');
      await expect(page).toHaveURL(/\/admin\/(reports|relatorios)/);
    });
  });

  test.describe('HR Role Specific', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('hr@company.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      await page.waitForURL(/\/company\/dashboard/);
    });

    test('should access employee management', async ({ page }) => {
      await page.goto('/company/colaboradores');
      await expect(page).toHaveURL(/\/company\/colaboradores/);
    });

    test('should access company reports', async ({ page }) => {
      await page.goto('/company/relatorios');
      await expect(page).toHaveURL(/\/company\/relatorios/);
    });

    test('should access company sessions', async ({ page }) => {
      await page.goto('/company/sessions');
      await expect(page).toHaveURL(/\/company\/sessions/);
    });
  });

  test.describe('Prestador Role Specific', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('prestador@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      await page.waitForURL(/\/prestador\/dashboard/);
    });

    test('should access calendar', async ({ page }) => {
      await page.goto('/prestador/calendario');
      await expect(page).toHaveURL(/\/prestador\/calendario/);
    });

    test('should access sessions list', async ({ page }) => {
      await page.goto('/prestador/sessoes');
      await expect(page).toHaveURL(/\/prestador\/sessoes/);
    });

    test('should access performance metrics', async ({ page }) => {
      await page.goto('/prestador/desempenho');
      await expect(page).toHaveURL(/\/prestador\/desempenho/);
    });
  });

  test.describe('Especialista Role Specific', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('especialista@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      await page.waitForURL(/\/especialista\/dashboard/);
    });

    test('should access call requests', async ({ page }) => {
      await page.goto('/especialista/call-requests');
      await expect(page).toHaveURL(/\/especialista\/call-requests/);
    });

    test('should access user history', async ({ page }) => {
      await page.goto('/especialista/user-history');
      await expect(page).toHaveURL(/\/especialista\/user-history/);
    });

    test('should access stats', async ({ page }) => {
      await page.goto('/especialista/stats');
      await expect(page).toHaveURL(/\/especialista\/stats/);
    });
  });

  test.describe('User Role Specific', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('user@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      await page.waitForURL(/\/user\/dashboard/);
    });

    test('should access booking', async ({ page }) => {
      await page.goto('/user/book');
      await expect(page).toHaveURL(/\/user\/book/);
    });

    test('should access sessions', async ({ page }) => {
      await page.goto('/user/sessions');
      await expect(page).toHaveURL(/\/user\/sessions/);
    });

    test('should access resources', async ({ page }) => {
      await page.goto('/user/resources');
      await expect(page).toHaveURL(/\/user\/resources/);
    });

    test('should NOT access admin routes', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Should be redirected to user dashboard
      await expect(page).toHaveURL(/\/user\/dashboard/);
    });
  });
});

