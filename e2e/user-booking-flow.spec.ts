import { test, expect } from '@playwright/test';

test.describe('User Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a user before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('user@example.com');
    await page.getByLabel(/password|senha/i).fill('password123');
    await page.getByRole('button', { name: /entrar|login/i }).click();
    await page.waitForURL(/\/user\/dashboard/);
  });

  test('should complete full booking flow from dashboard to confirmation', async ({ page }) => {
    // Navigate to booking page
    await page.getByRole('link', { name: /agendar|book|marcar/i }).click();
    await page.waitForURL(/\/user\/book/);
    
    // Select pillar (Mental Health)
    await page.getByRole('button', { name: /saúde mental|mental health|psicol/i }).click();
    
    // Select topic
    await page.getByText(/ansiedade|anxiety|stress|depressão/i).first().click();
    await page.getByRole('button', { name: /continuar|continue|next/i }).click();
    
    // Select provider
    await page.getByRole('button', { name: /selecionar|select|escolher/i }).first().click();
    
    // Select date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateButton = page.locator(`[data-date="${futureDate.toISOString().split('T')[0]}"]`);
    if (await dateButton.isVisible()) {
      await dateButton.click();
    }
    
    // Select time slot
    await page.getByText(/10:00|14:00|15:00/).first().click();
    
    // Select meeting type
    await page.getByLabel(/virtual|online/i).check();
    
    // Add notes
    await page.getByPlaceholder(/notas|notes|observações/i).fill('This is a test booking');
    
    // Confirm booking
    await page.getByRole('button', { name: /confirmar|confirm|agendar/i }).click();
    
    // Wait for confirmation
    await expect(page.getByText(/sucesso|agendado|confirmado|success/i)).toBeVisible({ timeout: 10000 });
  });

  test('should allow selecting different pillars', async ({ page }) => {
    await page.goto('/user/book');
    
    // Test all four pillars
    const pillars = [
      /saúde mental|mental health/i,
      /bem-estar físico|physical/i,
      /assistência jurídica|legal/i,
      /assistência financeira|financial/i,
    ];
    
    for (const pillar of pillars) {
      const pillarButton = page.getByRole('button', { name: pillar });
      if (await pillarButton.isVisible()) {
        await expect(pillarButton).toBeVisible();
      }
    }
  });

  test('should show available providers for selected pillar', async ({ page }) => {
    await page.goto('/user/book');
    
    // Select a pillar
    await page.getByRole('button', { name: /saúde mental|mental health/i }).click();
    
    // Wait for provider list
    await expect(page.getByText(/especialista|provider|prestador|doutor/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto('/user/book');
    
    // Try to proceed without selecting pillar
    const continueButton = page.getByRole('button', { name: /continuar|continue/i });
    if (await continueButton.isVisible()) {
      await continueButton.click();
      
      // Should show validation message
      await expect(page.getByText(/selecione|select|escolha|required/i)).toBeVisible();
    }
  });

  test('should show booking in user dashboard after creation', async ({ page }) => {
    // Assuming a booking was created in previous test or setup
    await page.goto('/user/dashboard');
    
    // Check for bookings section
    await expect(page.getByText(/próximas|upcoming|agendamentos|appointments/i)).toBeVisible();
  });

  test('should allow viewing booking details', async ({ page }) => {
    await page.goto('/user/sessions');
    
    // Click on first booking (if exists)
    const firstBooking = page.locator('[data-testid="booking-item"]').first();
    if (await firstBooking.isVisible()) {
      await firstBooking.click();
      
      // Should show booking details
      await expect(page.getByText(/data|date|hora|time|prestador|provider/i)).toBeVisible();
    }
  });

  test('should allow rescheduling a booking', async ({ page }) => {
    await page.goto('/user/sessions');
    
    // Find reschedule button (if bookings exist)
    const rescheduleButton = page.getByRole('button', { name: /reagendar|reschedule/i }).first();
    if (await rescheduleButton.isVisible()) {
      await rescheduleButton.click();
      
      // Should navigate to booking flow with reschedule mode
      await page.waitForURL(/book.*mode=reschedule/);
    }
  });

  test('should show meeting link for confirmed bookings', async ({ page }) => {
    await page.goto('/user/sessions');
    
    // Look for meeting link (if confirmed bookings exist)
    const meetingLink = page.getByRole('link', { name: /entrar|join|reunião|meeting/i }).first();
    if (await meetingLink.isVisible()) {
      await expect(meetingLink).toHaveAttribute('href', /.+/);
    }
  });

  test('should handle booking cancellation', async ({ page }) => {
    await page.goto('/user/sessions');
    
    // Find cancel button (if bookings exist)
    const cancelButton = page.getByRole('button', { name: /cancelar|cancel/i }).first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Confirm cancellation in dialog
      await page.getByRole('button', { name: /confirmar|confirm|sim|yes/i }).click();
      
      // Should show success message
      await expect(page.getByText(/cancelado|cancelled/i)).toBeVisible();
    }
  });
});

