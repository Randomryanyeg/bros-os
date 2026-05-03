import { test, expect } from '@playwright/test';

test('should perform a transfer between accounts', async ({ page }) => {
  // 1. Navigate to the application
  await page.goto('/');

  // 2. Perform Login (Assuming a user exists or login flow is bypassable for testing)
  // Since I cannot know the credentials, I will assume a set of test credentials 
  // or that the UI needs to be interacted with to setup a test user.                
  // For the purpose of this test, let's assume successful auth by filling credentials.
  await page.fill('input[id*="username"]', 'testuser');
  await page.fill('input[id*="password"]', 'password123');
  await page.click('button:has-text("Sign In")');

  // Wait for dashboard to load
  await page.waitForSelector('text=Accounts');

  // 3. Initiate Transfer
  await page.click('text=Transfer'); 
  
  // 4. Fill Transfer Details
  await page.selectOption('select[id="fromAccount"]', 'Ultimate Package');
  await page.selectOption('select[id="toAccount"]', 'Momentum Plus Savings');
  await page.fill('input[id="amount"]', '100');
  await page.fill('input[id="description"]', 'Test Transfer');
  
  await page.click('button:has-text("Transfer")');

  // 5. Verify Transfer Completion
  // Assuming a success confirmation appears
  await expect(page.locator('text=Transfer completed')).toBeVisible();

  // 6. Verify Balances updated
  // This part highly depends on the exact UI reflection.
  // We'll check if the transaction appeared in history.
  await page.click('text=Ultimate Package');
  await expect(page.locator('text=Test Transfer')).toBeVisible();
});
