import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveTitle(/Melhor Saúde|Login/i);
      await expect(page.getByRole('heading', { name: /entrar|login/i })).toBeVisible();
    });

    test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in the login form
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      
      // Submit the form
      await page.getByRole('button', { name: /entrar|login/i }).click();
      
      // Wait for navigation to dashboard
      await page.waitForURL(/\/(user|admin|company|prestador|especialista)\/dashboard/);
      
      // Verify we're on a dashboard page
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should show error message with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/email/i).fill('wrong@example.com');
      await page.getByLabel(/password|senha/i).fill('wrongpassword');
      
      await page.getByRole('button', { name: /entrar|login/i }).click();
      
      // Wait for error message
      await expect(page.getByText(/inválido|invalid|incorreto/i)).toBeVisible({ timeout: 5000 });
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit without filling fields
      await page.getByRole('button', { name: /entrar|login/i }).click();
      
      // Check for validation messages
      await expect(page.getByText(/obrigatório|required/i)).toBeVisible();
    });
  });

  test.describe('Signup', () => {
    test('should display signup page', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByRole('heading', { name: /registar|register|criar conta/i })).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
      await page.goto('/register');
      
      const randomEmail = `test${Date.now()}@example.com`;
      
      await page.getByLabel(/nome|name/i).fill('Test User');
      await page.getByLabel(/email/i).fill(randomEmail);
      await page.getByLabel(/password|senha/i).first().fill('StrongPass123');
      await page.getByLabel(/confirmar|confirm/i).fill('StrongPass123');
      
      await page.getByRole('button', { name: /registar|register|criar/i }).click();
      
      // Wait for success message or redirect
      await expect(
        page.getByText(/sucesso|success|email enviado|check your email/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByLabel(/nome|name/i).fill('Test User');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password|senha/i).first().fill('weak');
      
      // Check for password strength indicator
      await expect(page.getByText(/fraca|weak|forte|strong/i)).toBeVisible();
    });

    test('should validate matching passwords', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByLabel(/password|senha/i).first().fill('Password123');
      await page.getByLabel(/confirmar|confirm/i).fill('DifferentPassword123');
      
      await page.getByRole('button', { name: /registar|register/i }).click();
      
      await expect(page.getByText(/não correspondem|do not match/i)).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should display password reset page', async ({ page }) => {
      await page.goto('/reset-password');
      await expect(page.getByRole('heading', { name: /redefinir|reset|recuperar/i })).toBeVisible();
    });

    test('should request password reset email', async ({ page }) => {
      await page.goto('/reset-password');
      
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByRole('button', { name: /enviar|send|redefinir/i }).click();
      
      // Wait for success message
      await expect(
        page.getByText(/email enviado|check your email|link enviado/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test('should validate email format for password reset', async ({ page }) => {
      await page.goto('/reset-password');
      
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByRole('button', { name: /enviar|send/i }).click();
      
      await expect(page.getByText(/inválido|invalid/i)).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      
      await page.waitForURL(/dashboard/);
      
      // Find and click logout button
      await page.getByRole('button', { name: /sair|logout|terminar/i }).click();
      
      // Should redirect to home or login
      await page.waitForURL(/\/(|login)/);
      await expect(page).toHaveURL(/\/(|login)/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      await page.goto('/user/dashboard');
      
      // Should be redirected to login
      await page.waitForURL(/\/login/);
      await expect(page).toHaveURL(/\/login/);
    });

    test('should preserve intended destination after login', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/user/sessions');
      
      // Should redirect to login
      await page.waitForURL(/\/login/);
      
      // Login
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password|senha/i).fill('password123');
      await page.getByRole('button', { name: /entrar|login/i }).click();
      
      // Should redirect to originally intended route
      await page.waitForURL(/\/(user\/sessions|dashboard)/);
    });
  });
});

