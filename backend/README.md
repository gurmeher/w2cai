# Backend: Reddit scraper

A batch job that turns Reddit posts into product rows in the Supabase Postgres database.
It runs on demand (`python scraper.py`) and never talks to the frontend directly. The
frontend reads the same tables through Supabase, so the database schema is the only
contract between the two.

See the root [README](../README.md) for setup and environment variables.

When you run `python scraper.py` it asks how many recent posts to scan (press Enter for
300; Reddit's maximum is 1000). The subreddit list is set in `SUBREDDITS` in `scraper.py`.

## Files

| File | Job | Talks to |
|---|---|---|
| `scraper.py` | Entry point (`python scraper.py`). Pulls new posts from Reddit, filters by flair, extracts links, calls Claude for titles, expands brand acronyms, runs posts in parallel | Reddit API (praw), Anthropic (Claude), `imagescraper.py`, `db.py` |
| `imagescraper.py` | Given one product URL, fetches the page and pulls out an image URL and price (Weidian only) | Weidian pages over HTTP; called by `scraper.py` |
| `db.py` | Creates and updates the tables on import; saves a post with its items, checks which posts and items already exist | Postgres directly via `SUPABASE_URL`; called by `scraper.py` |

## Flow for one post

```
scraper.get_recent_posts
  └─ db.get_existing_permalinks          skip posts already in the database
  └─ prepare_post_data                   filter by flair, extract and validate product links
  └─ process_single_post                 (run 5 at a time in a thread pool)
       └─ db.get_existing_items_by_urls  load existing titles for these links
       └─ ask_claude_for_titles          Claude names each link, merging with existing titles
            └─ imagescraper.scrape_product_data   image + price for each link (3 threads)
       └─ db.save_post_with_items        upsert post, items and their links
```

1. **`scraper.get_recent_posts`** fetches the newest posts from a subreddit.
2. **`db.get_existing_permalinks`** checks the whole batch in one query, so posts already in
   the database are skipped before any Claude calls.
3. **`prepare_post_data`** drops posts with a skipped flair, gathers the title, body and up to
   3 of the poster's own comments, and extracts product links. Each link must match an
   allowed marketplace host exactly (`is_allowed_product_url`), so spoofed links like
   `https://weidian.com@evil.com` are rejected.
4. **`process_single_post`** handles one post:
   1. **`db.get_existing_items_by_urls`** loads titles already stored for these links.
   2. **`ask_claude_for_titles`** asks Claude Haiku (thinking off, answer held to a fixed JSON shape)
      for a clean title and categories per link, comparing against and merging with any existing
      title. URLs the model returns that weren't in the post are dropped,
      and brand acronyms are expanded (`expand_brand_acronyms`).
   3. **`imagescraper.scrape_product_data`** runs for each link to get an image URL and price.
   4. **`db.save_post_with_items`** saves the post and its items. Existing items keep their
      old image and price if the new scrape found nothing, and `reddit_mentions` is recounted.

## Database tables

- `items`: one row per unique `product_url` (name, image, price, first seen, mention count)
- `posts`: one row per unique Reddit `permalink`
- `post_item_links`: join table linking posts and items (many-to-many)
