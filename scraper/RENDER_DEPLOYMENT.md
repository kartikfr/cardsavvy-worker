# Deploying the Python Scraper to Render (Method 3)

We have containerized the Playwright Python scraper to run as a reliable background worker in the cloud. This solves Next.js timeouts and allows the script to natively handle Google Gemini's 429 Rate Limits by sleeping for 65 seconds when blocked.

## Step 1: Push Code to GitHub
Ensure the entire `cardsavvy` repository (including the `scraper/` folder) is pushed to your GitHub account.

## Step 2: Create a Web Service on Render
1. Go to [Render.com](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. **Environment:** Select `Docker` (not Python). Render will automatically detect the `scraper/Dockerfile`.
4. **Root Directory:** Type in `scraper`
5. **Instance Type:** The Free Tier ($0) will work, but it spins down after 15 minutes of inactivity. For background scraping 50 cards (which takes ~45 minutes due to API rate limits), you might need the **Starter ($7/mo)** tier to prevent the server from going to sleep mid-scrape.

## Step 3: Add Environment Variables in Render
In the Render dashboard for your new service, add these Environment Variables:
- `GEMINI_API_KEY`: `AIzaSy...` (Your Gemini API Key)
- `CRON_SECRET`: Optional secure string (e.g. `my-super-secret-cron-key`) to prevent unauthorized people from triggering the scrape endpoint.

## Step 4: Link Your Admin Panel to the Worker
Once Render finishes deploying your Docker container, it will give you a public URL (e.g., `https://cardsavvy-worker.onrender.com`).

1. Open your `apps/admin/.env.local`
2. Add the URL you got from Render:
   ```env
   PYTHON_WORKER_URL=https://cardsavvy-worker.onrender.com
   CRON_SECRET=my-super-secret-cron-key # Must match what you put in Render
   ```
3. Restart your Next.js admin server.

## Step 5: Trigger the Sync
Open your Admin Panel UI -> Go to **Settings**.
You will see a new **"Python Cloud Worker Sync"** section. Click the **"Trigger Background Sync"** button.

The Next.js app will instantly send your Top 50 Cards list + Supabase API keys to the Render worker. The worker will reply "Accepted" instantly, and proceed to scrape and insert all 50 cards securely into your database over the next 45 minutes!
