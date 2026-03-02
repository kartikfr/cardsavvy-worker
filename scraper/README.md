# CardSavvy Scraper - Setup and Usage

## Prerequisites
```bash
pip install playwright google-generativeai fastapi uvicorn aiohttp
playwright install chromium
```

## Environment Variables
```env
GEMINI_API_KEY=<your-gemini-api-key>
CRON_SECRET=<optional-shared-secret>
PORT=8000
```

## Local Server
```bash
python scraper/main.py
```

## Server API
```http
POST http://localhost:8000/scrape
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{ "card_name": "Axis Bank Atlas" }
```

## How It Works
1. Finds a likely official card URL via search.
2. Uses Playwright to render and extract page text.
3. Sends extracted text to Gemini 2.5 Flash for JSON extraction.
4. Returns structured card metadata.

## Integration with Admin Panel
For Playwright-backed scraping from admin routes, set either one:
```env
PYTHON_WORKER_URL=http://localhost:8000
PYTHON_SCRAPER_URL=http://localhost:8000
```
