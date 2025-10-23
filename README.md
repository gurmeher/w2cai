# W2C AI

Traditionally, niche Chinese fashion enthusiasts rely on noisy Reddit forums or manually inputted spreadsheets, which prone to data entry errors and typically are outdated, to find clothes. W2C AI (meaning Where 2 Cop, slang for "Where do I buy _______?") turns Reddit posts into a clean, visual product catalog, with links for you to pass to your shipping agent. 

W2C AI is a full-stack project that scans Reddit forums, extracts product links (Weidian, Taobao, 1688, Yupoo), uses AI to produce clean human-friendly titles, scrapes product images and prices, and stores results in a Postgres (Supabase) database. The Next.js frontend can then display these items.

## Features
- Reddit ingestion using PRAW
- URL extraction for Weidian, Taobao, 1688, Yupoo
- AI-generated product titles (OpenAI)
- Data enrichment: image and price scraping per product URL
- De-duplication + title merging for already-known URLs
- Persistence in Postgres (via Supabase connection string)
- Simple Next.js app ready to consume the data

## Repository Structure
```text
backend/
  db.py                # DB init, upsert, and fetch helpers (Postgres/Supabase)
  scraper.py           # Reddit scraper + OpenAI titling + data enrichment
  requirements.txt     # Python dependencies
frontend/
  src/app/             # Next.js 15 app directory
  package.json         # Next.js + React 19
```

## Prerequisites
- Python 3.11+
- Node.js 18+ (for Next.js frontend)
- A Postgres connection string (Supabase recommended)
- OpenAI API key
- Reddit app credentials (script type)

## Environment Variables
Create `backend/.env` with:
```env
# Postgres connection string (e.g., from Supabase)
SUPABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# OpenAI
OPENAI_API_KEY=sk-...

# Reddit API (create a Reddit app and set user agent)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=w2c-ai-scraper/1.0 by <your-reddit-username>
```

## Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip3 install -r requirements.txt
```

### Initialize/Verify Database
`db.py` runs `init_db()` on import and will ensure required columns exist:
- items(id, product_url UNIQUE, name, first_seen_UTC, image_url, reddit_mentions, price)
- posts(id, title, permalink UNIQUE, upvotes, created_utc, subreddit)
- post_item_links(post_id, item_id)

If you already had the tables, `init_db()` uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` to add missing columns.

### Run the Scraper
```bash
cd backend
python3 scraper.py
```
The scraper will:
- Fetch recent posts from a subreddit (configured in `scraper.py`)
- Extract product URLs from title/body (+ a few OP comments)
- Ask OpenAI for clean titles (and compare/merge with any existing titles)
- Scrape image and price per URL (via `scrape_product_data` in `imagescraper`)
- Upsert into Postgres and link post↔item

Note: `scraper.py` imports `imagescraper.scrape_product_data(url)` to get `{ image_url, price }`. Ensure you have that module available in `backend/` or installed in your environment. If you don’t need price scraping yet, you can adapt `scraper.py` to only populate images.

## Frontend Setup (Next.js 15 + React 19)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000 to view. The app is scaffolded and includes Supabase client utilities in `frontend/src/lib/supabase.ts`. Wire your UI to query items from your API or directly from Supabase.

## How Data Flows
1. Reddit posts fetched via PRAW
2. Product URLs extracted via regex
3. OpenAI produces concise product titles
4. Image and price scraped per URL
5. Data upserted into `items`, linked via `post_item_links` to `posts`
6. Frontend reads items and displays them

## Key Files to Know
- `backend/scraper.py`: Orchestrates fetching posts, OpenAI titling, scraping, saves to DB
- `backend/db.py`: Database initialization and CRUD helpers
- `frontend/src/app/*`: Next.js pages

## Troubleshooting
- Python not found: use `python3` on macOS
- `psycopg2` errors: verify `SUPABASE_URL` is a valid Postgres connection string with correct IP allow-listing in Supabase
- OpenAI errors: verify `OPENAI_API_KEY` and model name used in `scraper.py`
- Reddit errors: verify client id/secret and user agent; ensure your app is a “script” type
- Missing image/price: confirm `imagescraper.scrape_product_data(url)` exists and is callable; network-based scraping can be rate-limited—add user-agent rotation and polite delays

## Suggested Production Considerations
- Run scraper in a scheduled job (e.g., cron, GitHub Actions, serverless cron)
- Add request retry and backoff for scraping
- Cache or store fetched images if hotlinking is undesirable
- Add API endpoints (FastAPI is already listed in requirements) to serve items to the frontend
- Implement observability (logging, error capture)

## License
Copyright © 2025 Gurmeher Bhasin. All rights reserved.
