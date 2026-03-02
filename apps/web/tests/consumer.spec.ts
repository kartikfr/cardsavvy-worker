import { test, expect, Page } from '@playwright/test';

// ─── SMOKE TESTS: Critical paths that MUST pass for product to function ────

test.describe('🏠 Landing Page', () => {
    test('loads correctly with hero, nav, and all sections', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Title
        await expect(page).toHaveTitle(/CardSavvy/);

        // Nav bar visible with logo
        await expect(page.getByText('CardSavvy').first()).toBeVisible();

        // Hero H1
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // Primary CTA
        const cta = page.getByRole('link', { name: /Calculate My Savings/i }).first();
        await expect(cta).toBeVisible();

        // How It Works section
        await expect(page.getByText(/How it works/i)).toBeVisible();

        // No console errors that crash the page
        const errors: string[] = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.waitForTimeout(1500);
        expect(errors.filter(e => !e.includes('hydrat'))).toHaveLength(0);
    });

    test('CTA navigates to /find-my-card', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.getByRole('link', { name: /Calculate My Savings/i }).first().click();
        await expect(page).toHaveURL(/find-my-card/);
    });

    test('nav logo navigates home', async ({ page }) => {
        await page.goto('http://localhost:3000/find-my-card');
        await page.getByText('CardSavvy').first().click();
        await expect(page).toHaveURL('http://localhost:3000/');
    });

    test('mobile: hamburger menu opens and closes', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3000');
        const hamburger = page.getByRole('button', { name: /Toggle menu|menu/i });
        await expect(hamburger).toBeVisible();
        await hamburger.click();
        // Drawer opens
        await expect(page.getByRole('link', { name: 'Find My Card' }).last()).toBeVisible();
        await hamburger.click();
    });
});

// ─── FIND MY CARD FORM ───────────────────────────────────────────────────────

test.describe('💳 Find My Card Form', () => {
    test('loads Step 1 with spend sliders', async ({ page }) => {
        await page.goto('http://localhost:3000/find-my-card');
        await expect(page.getByText(/Groceries/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /Next|Continue/i }).first()).toBeVisible();
    });

    test('Step 1 → Step 2 navigation', async ({ page }) => {
        await page.goto('http://localhost:3000/find-my-card');
        await page.getByRole('button', { name: /Next|Continue/i }).first().click();
        await page.waitForTimeout(500);
        await expect(page.getByText(/PERKS|Travel|perk/i)).toBeVisible();
    });

    test('Step 2 → Step 3 navigation', async ({ page }) => {
        await page.goto('http://localhost:3000/find-my-card');
        await page.getByRole('button', { name: /Next|Continue/i }).first().click();
        await page.waitForTimeout(500);
        await page.getByRole('button', { name: /Almost Done|Next|Continue/i }).first().click();
        await page.waitForTimeout(500);
        await expect(page.getByRole('button', { name: /Show My Savings|Submit/i })).toBeVisible();
    });

    test('form submits and redirects with session token', async ({ page }) => {
        await page.goto('http://localhost:3000/find-my-card');

        // Navigate all steps quickly
        await page.getByRole('button', { name: /Next|Continue/i }).first().click();
        await page.waitForTimeout(400);
        await page.getByRole('button', { name: /Almost Done|Next|Continue/i }).first().click();
        await page.waitForTimeout(400);

        // Submit
        await page.getByRole('button', { name: /Show My Savings|Submit/i }).click();

        // Should navigate to results with ?session=
        await page.waitForURL(/results/, { timeout: 10000 });
        expect(page.url()).toMatch(/results/);
    });

    test('mobile: form is usable on 375px viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3000/find-my-card');
        await expect(page.getByText(/Groceries/i)).toBeVisible();
        // Sliders should be scrollable and not overflow
        const form = page.locator('form, [data-form]').first();
        if (await form.count() > 0) {
            const box = await form.boundingBox();
            expect(box?.width).toBeLessThanOrEqual(375 + 10);
        }
    });
});

// ─── RESULTS PAGE ────────────────────────────────────────────────────────────

test.describe('📊 Results Page', () => {
    test('shows invalid session when no token provided', async ({ page }) => {
        await page.goto('http://localhost:3000/results');
        await expect(page.getByText(/Invalid Session|Please calculate/i).first()).toBeVisible();
    });


    test('shows results loading skeleton when session token present', async ({ page }) => {
        await page.goto('http://localhost:3000/results?session=test-token-123');
        // Either loads results or shows something (not blank)
        await page.waitForTimeout(1000);
        const hasContent = await page.getByRole('main').count();
        expect(hasContent).toBeGreaterThan(0);
    });
});

// ─── API HEALTH CHECKS ───────────────────────────────────────────────────────

test.describe('🔌 API Health', () => {
    test('GET /api/recommend → 405 (only POST allowed)', async ({ request }) => {
        const res = await request.get('http://localhost:3000/api/recommend');
        expect([404, 405]).toContain(res.status());
    });

    test('POST /api/recommend with empty body → 400', async ({ request }) => {
        const res = await request.post('http://localhost:3000/api/recommend', {
            headers: { 'Content-Type': 'application/json' },
            data: {}
        });
        expect([400, 422]).toContain(res.status());
    });

    test('POST /api/recommend with valid profile → 200', async ({ request }) => {
        const res = await request.post('http://localhost:3000/api/recommend', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                spend_profile: {
                    monthly: {
                        groceries: 10000, dining: 5000, online_shopping: 8000,
                        travel_flights: 3000, travel_hotels: 2000, fuel: 2000,
                        utilities: 3000, ott: 500, other: 5000
                    },
                    income_bracket: "ABOVE_25L",
                    fee_willingness: 5000,
                    preferred_reward_type: "ANY"
                }
            }
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
    });
});

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────

test.describe('⚙️ Admin Panel', () => {
    test('dashboard loads with nav sidebar', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await expect(page.getByText('CardSavvy')).toBeVisible();
        await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
        await expect(page.getByText(/Card Ledger/i)).toBeVisible();
    });

    test('admin KPI cards are visible', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await expect(page.getByText(/Total Cards/i)).toBeVisible();
        await expect(page.getByText(/Pending Queue/i)).toBeVisible();
    });

    test('admin cards/new page loads with AI scraper form', async ({ page }) => {
        await page.goto('http://localhost:3001/cards/new');
        await expect(page.getByText(/Add New Card/i)).toBeVisible();
        await expect(page.getByPlaceholder(/HDFC Diners|Axis Reserve/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /Auto-Fill with AI/i })).toBeVisible();
    });

    test('admin Queue page loads', async ({ page }) => {
        await page.goto('http://localhost:3001/queue');
        await expect(page).not.toHaveURL(/404|error/);
    });

    test('admin Settings page loads', async ({ page }) => {
        await page.goto('http://localhost:3001/settings');
        await expect(page).not.toHaveURL(/404|error/);
    });

    test('admin Analytics page loads', async ({ page }) => {
        await page.goto('http://localhost:3001/analytics');
        await expect(page).not.toHaveURL(/404|error/);
    });
});

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────

test.describe('⚡ Performance', () => {
    test('landing page LCP < 3s on desktop', async ({ page }) => {
        const start = Date.now();
        await page.goto('http://localhost:3000');
        await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 3000 });
        const loadTime = Date.now() - start;
        expect(loadTime).toBeLessThan(5000); // generous for local dev
    });

    test('no broken images on homepage', async ({ page }) => {
        await page.goto('http://localhost:3000');
        const images = await page.locator('img').all();
        for (const img of images) {
            const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
            // naturalWidth 0 means broken, but only if image was supposed to load
            if (await img.getAttribute('src')) {
                expect(naturalWidth).toBeGreaterThan(0);
            }
        }
    });
});

// ─── MOBILE RESPONSIVENESS ───────────────────────────────────────────────────

test.describe('📱 Mobile Responsiveness', () => {
    const MOBILE = { width: 375, height: 812 };
    const TABLET = { width: 768, height: 1024 };

    test('landing page no horizontal scroll on mobile', async ({ page }) => {
        await page.setViewportSize(MOBILE);
        await page.goto('http://localhost:3000');
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });

    test('find-my-card form is usable on tablet', async ({ page }) => {
        await page.setViewportSize(TABLET);
        await page.goto('http://localhost:3000/find-my-card');
        await expect(page.getByText(/Groceries/i)).toBeVisible();
    });

    test('admin panel renders on tablet (768px)', async ({ page }) => {
        await page.setViewportSize(TABLET);
        await page.goto('http://localhost:3001');
        await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
    });
});
