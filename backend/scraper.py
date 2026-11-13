# scraper.py
# Entry point (`python scraper.py`). Pulls new posts from Reddit, filters by flair,
# extracts product links, calls GPT for titles, expands brand acronyms, and runs
# posts in parallel.
# Talks to: Reddit API (praw), OpenAI, imagescraper.py, db.py
# See backend/README.md for the full flow of one post.
#
# Current bottlenecks: can't read slideshow posts, can't read posts with no product
# links, and can't read agent links.
from imagescraper import scrape_product_data
import praw # Python Reddit API Wrapper, a Python library that allows you to easily interact with Reddit's API, so we can read posts
import re # regular expressions for matching patterns in text, idk gpt said to use it
import time # time module for sleep functionality so we dont spam reddit
from dotenv import load_dotenv # to load environment variables from a .env file
import os # lets us access environment variables, pythons standard library for interacting with the operating system
from db import save_post_with_items, get_existing_permalinks, get_existing_items_by_urls
import openai
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY") # gets openai key from environment variables 

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

PRODUCT_URL_REGEX = r"(https?://(?:item\.taobao\.com|(?:[\w\-]+\.)*weidian\.com|x\.yupoo\.com|detail\.1688\.com)[^\s)\]]+)"
# regex to match product links from Taobao, Weidian, Yupoo, and 1688
# NOTE: the regex alone is not enough (it accepts "https://weidian.com@evil.com" or
# "https://item.taobao.com.evil.com"), so every match is re-checked by is_allowed_product_url

# Hosts must match one of these exactly...
ALLOWED_PRODUCT_HOSTS = {"item.taobao.com", "weidian.com", "x.yupoo.com", "detail.1688.com"}
# ...or be a subdomain of one of these (e.g. shop123.v.weidian.com)
ALLOWED_PRODUCT_HOST_SUFFIXES = (".weidian.com",)

# the useless flairs we want to skip (lowercase)
SKIP_FLAIRS={"w2c", "shitpost", "guide", "news", 
             "presale", "lc", "announcement", "interest check"}

# Configuration
BATCH_SIZE = 5 # Number of posts to process in parallel
MAX_WORKERS = 5  # Thread pool size

BRAND_ACRONYMS = {
    # Luxury Fashion Houses
    "BLCG": "Balenciaga",
    "LV": "Louis Vuitton(LV)",
    "MM": "Maison Margiela(MM)",
    "CDG": "CDG(Comme des Garcons)",
    "FOG": "Fear of God(FOG)",
    "CPFM": "CPFM(Cactus Plant Flea Market)",
    "ERD": "ERD(Enfants Riches Deprimes)",
    "3RD": "ERD(Enfants Riches Deprimes)",
    "NB": "New Balance(NB)",
    "YSL": "YSL(Yves Saint Laurent)",
    "SLP": "SLP(Saint Laurent Paris)",
    "CH": "Chrome Hearts",
    "VD": "Vuja De",
    "VTM": "Vetements",
    "RO": "Rick Owens",
    "AC": "Acne Studios",
    "ACN": "Acne Studios",
    "D&G": "Dolce & Gabbana",
    "DG": "Dolce & Gabbana",
    "AJ": "Air Jordan",
    "VW": "Vivienne Westwood",
    "NN": "Number Nine",
    "EE": "Eric Emanuel",
}

#-------------------------------------------------------------------------------------#

def expand_brand_acronyms(item_name):
    if not item_name:
        return item_name
    
    expanded_name = item_name
    
    # Split into words for more precise matching
    words = expanded_name.split()
    
    for i, word in enumerate(words):
        # Remove common punctuation for matching but preserve it
        clean_word = word.strip('.,!?()[]{}"\'-').upper()
        
        # Check if the clean word is an acronym we know
        if clean_word in BRAND_ACRONYMS:
            # Replace the word while preserving any punctuation
            original_word = words[i]
            start_punct = ""
            end_punct = ""
            
            # Extract leading punctuation
            for char in original_word:
                if char.isalpha():
                    break
                start_punct += char
            
            # Extract trailing punctuation  
            for char in reversed(original_word):
                if char.isalpha():
                    break
                end_punct = char + end_punct
            
            # Get the expanded brand name
            expanded_brand = BRAND_ACRONYMS[clean_word]
            
            # Preserve original case style if possible
            original_letters = ''.join(c for c in original_word if c.isalpha())
            if original_letters.islower():
                # If original was all lowercase, make expanded brand lowercase except first letter
                expanded_brand = expanded_brand[0].upper() + expanded_brand[1:].lower()
            elif original_letters.isupper():
                # If original was all uppercase, keep expanded brand as-is (title case)
                pass  # Keep the title case from dictionary
            else:
                # Mixed case or title case, keep expanded brand as-is
                pass
            
            # Replace with expanded form
            words[i] = start_punct + expanded_brand + end_punct
    
    expanded_name = " ".join(words)
    
    # Log the expansion if it changed
    if expanded_name != item_name:
        print(f"🔄[ACRONYM] Expanded: '{item_name}' → '{expanded_name}'")
    
    return expanded_name

def ask_gpt_for_titles(post_text, urls, existing_items=None, retries=0): # Enhanced function with existing items check
    print("⬜️[SYSTEM] ChatGPT Called")
    
    existing_context = ""
    if existing_items:
        existing_context = "\n\nEXISTING ITEMS IN DATABASE (for comparison):"
        for item in existing_items:
            existing_context += f'\n- URL: {item["product_url"]} | Prior Title: "{item.get("name") or ""}"'
        existing_context += (
            "\n\nFor any URL that appears above, you MUST compare your proposed new title with the prior title and "
            "return the single BEST final title. Prefer the one that is more useful; "
            "if each has complementary details, MERGE them into one concise title (<= 80 characters). It is often that one item has multiple garments from the same brand, such as Stussy Pants and Shirts. "
            "Avoid redundancy when merging. If the two titles describe different products and/or brands, assume the new post is correct."
        )

    prompt = f"""
        You are given the title and body of a Reddit post with product links.

        TASK
        - For each URL, produce a clear, concise, human-friendly product name (Title Case).
        - Fix obvious typos.
        - Do NOT include terms like: qc, replica, fake, from weidian/taobao/1688, retail/legit, hate speech, etc.
        - Do NOT use generic clothing words (shirt/pants/hoodie/shoes/accessory) unless you're confident they are correct.
        - Keep titles <= 80 characters when reasonable.
        - IMPORTANT: If the URL exists in the database (see section below), COMPARE the prior title with your new one and return a single best title. If both have complementary info, MERGE into one concise title. If they are clearly different items, use the new one.

        OUTPUT
        Return ONLY valid JSON (no extra text, no markdown). Format:
        [
        {{"url": "https://example.com/item1", "name": "Techwear Cargo Pants"}},
        {{"url": "https://example.com/item2", "name": "Jordan 1 Sneakers"}}
        ]

        {existing_context}

        Reddit Post:
        {post_text}

        Product Links:
        {urls}
        """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini", # Faster and cheaper than gpt-4-turbo
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # Lower temperature for more consistent output
            max_tokens=1000  # Limit tokens for faster response
        )
        
        content = response.choices[0].message.content.strip()
        
        # Debug: Print what GPT actually returned
        print(f"🔍[DEBUG] GPT Response: {content[:200]}...")
        
        # Handle empty responses
        if not content:
            print("🟨[GPT-EMPTY] GPT returned empty response")
            return []
        
        # Clean up common GPT formatting issues
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        
        # Try to parse JSON
        try:
            named_urls = json.loads(content)
        except json.JSONDecodeError as json_err:
            print(f"🟨[JSON-ERROR] Failed to parse JSON: {json_err}")
            print(f"🟨[JSON-CONTENT] Content was: {content}")
            
            # Try to extract JSON from response if GPT added extra text
            json_match = re.search(r'\[.*?\]', content, re.DOTALL)
            if json_match:
                try:
                    named_urls = json.loads(json_match.group())
                    print("🟩[JSON-RECOVERED] Successfully extracted JSON from response")
                except:
                    named_urls = []
            else:
                named_urls = []
        
        # Validate the response structure
        if not isinstance(named_urls, list):
            print(f"🟨[VALIDATION] Expected list, got {type(named_urls)}")
            return []
        
        # Filter out invalid items
        allowed_urls = set(urls)  # only URLs we extracted ourselves, never ones GPT made up or altered
        valid_items = []
        for item in named_urls:
            if isinstance(item, dict) and "url" in item and "name" in item:
                if item["url"] not in allowed_urls:
                    print(f"🟨[VALIDATION] Skipping URL not in post: {item['url']}")
                    continue
                item["name"] = expand_brand_acronyms(item["name"])
                valid_items.append(item)
            else:
                print(f"🟨[VALIDATION] Skipping invalid item: {item}")
        
        # Parallel data scraping (images + prices)
        if valid_items:
            scrape_data_parallel(valid_items)
        
        return valid_items
    
    except Exception as e:
        if retries < 2:  # Retry up to 2 times
            print(f"🟨[GPT-RETRY] GPT failed, retrying ({retries + 1}/2): {e}")
            time.sleep(2 ** retries)  # Exponential backoff
            return ask_gpt_for_titles(post_text, urls, existing_items, retries + 1)
        else:
            print(f"🟥🟥🟥[GPT-ERROR] GPT failed after retries: {e}")
            return []

def scrape_single_item_data(item):
    """Scrape both image and price for a single item"""
    url = item["url"]
    try:
        print(f"🖼️💰[DATA] Scraping image and price for: {url}")
        data = scrape_product_data(url)
        item["image_url"] = data['image_url']
        item["price"] = data['price']
        
        # Log what we found
        #if data['image_url']:
        #    print(f"✅[IMAGE] Found image for {url}")
        #if data['price']:
        #    print(f"💰[PRICE] Found price {data['price']} for {url}")
            
        return item
    except Exception as e:
        print(f"🟥🟥🟥[DATA-ERROR] Failed to scrape data for {url}: {e}")
        item["image_url"] = None
        item["price"] = None
        return item

def scrape_data_parallel(named_urls):
    """Scrape images and prices in parallel using ThreadPoolExecutor"""
    #print(f"🖼️💰[DATA] Scraping {len(named_urls)} items (image + price) in parallel...")
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submit all data scraping tasks
        future_to_item = {executor.submit(scrape_single_item_data, item): item for item in named_urls}
        
        # Wait for completion
        for future in as_completed(future_to_item):
            try:
                future.result()  # This will raise an exception if the task failed
            except Exception as e:
                print(f"🟥🟥🟥[DATA-ERROR] Data scraping task failed: {e}")

def is_allowed_product_url(url):
    """True only if the URL's real host is an allowed marketplace and it has no user@ section"""
    try:
        parsed = urlparse(url)
        host = parsed.hostname  # lowercased, with any user:pass@ and :port stripped
        port = parsed.port      # raises ValueError on a malformed port
    except ValueError:
        return False

    if parsed.scheme not in ("http", "https") or not host:
        return False
    if "@" in parsed.netloc or port is not None:  # e.g. https://weidian.com@evil.com
        return False
    return host in ALLOWED_PRODUCT_HOSTS or host.endswith(ALLOWED_PRODUCT_HOST_SUFFIXES)

def extract_product_urls(text):
    urls = set(re.findall(PRODUCT_URL_REGEX, text))
    allowed = [url for url in urls if is_allowed_product_url(url)]
    for url in urls.difference(allowed):
        print(f"🟨[URL-REJECTED] Host not allowed: {url}")
    return allowed

def prepare_post_data(post, subreddit_name, existing_permalinks):
    """Prepare post data, return None if should skip"""
    permalink = f"https://www.reddit.com{post.permalink}"
    
    # Check if already in database
    if permalink in existing_permalinks:
        return None, "DUPLICATE"
    
    # Check flair
    flair = (post.link_flair_text or "").lower()
    if flair in SKIP_FLAIRS:
        return None, f"FLAIR-{flair}"
    
    # Combine post title, body, and limited OP comments
    full_text = f"{post.title}\n\n{post.selftext}"
    
    # Efficiently get OP comments (limit to first 3 for performance)
    try:
        op_comment_count = 0
        for comment in post.comments[:5]:  # Only check first 5 comments
            if (hasattr(comment, 'author') and comment.author and 
                post.author and comment.author.name == post.author.name):
                full_text += f"\n\n{comment.body}"
                op_comment_count += 1
                if op_comment_count >= 3:  # Max 3 OP comments
                    break
    except Exception as e:
        print(f"🟨[COMMENT-ERROR] Error processing comments for {post.title}: {e}")
    
    # Extract product URLs
    product_urls = extract_product_urls(full_text)
    if not product_urls:
        return None, "NO-URLS"
    
    post_data = {
        "title": post.title,
        "permalink": permalink,
        "upvotes": post.score,
        "created_utc": post.created_utc,
        "subreddit": subreddit_name
    }
    
    return {
        "post_data": post_data,
        "full_text": full_text,
        "product_urls": product_urls
    }, "VALID"

def process_single_post(post_info):
    """Process a single post"""
    try:
        post_data = post_info["post_data"]
        full_text = post_info["full_text"]
        product_urls = post_info["product_urls"]

        # BEFORE: snapshot current DB titles for these URLs
        existing_items = get_existing_items_by_urls(product_urls)
        before_titles = {it["product_url"]: it.get("name") for it in existing_items}
        #if existing_items:
            #print(f"🔍[EXISTING] Found {len(existing_items)} existing items for comparison")

        # GPT with existing items (enables compare/merge behavior in prompt)
        named_urls = ask_gpt_for_titles(full_text, product_urls, existing_items)
        if not named_urls:
            print(f"🟨[NOURL-SKIPPED] No named URLs found for: {post_data['title']}")
            return False

        # Save (upsert)
        save_post_with_items(post_data, named_urls)

        # AFTER: re-fetch titles for the URLs we just touched
        touched_urls = [it["url"] for it in named_urls]
        after_items = get_existing_items_by_urls(touched_urls)
        after_titles = {it["product_url"]: it.get("name") for it in after_items}

        # Print before → proposed → after (only when it changed, else annotate)
        for it in named_urls:
            url = it["url"]
            prev = before_titles.get(url)
            proposed = it.get("name")
            final = after_titles.get(url)

            if prev != final or proposed != final:
                print(
                    f"📝[TITLE-CHANGE] {url}\n"
                    f"   before  : {repr(prev)}\n"
                    f"   proposed: {repr(proposed)}\n"
                    f"   after   : {repr(final)}"
                )
            else:
                if url in before_titles:
                    print(f"📝[TITLE-UNCHANGED] {url} stayed as {repr(final)}")
                else:
                    print(f"📝[TITLE-NEW] {url} inserted with {repr(final)}")

        # Summary
        items_with_price = sum(1 for item in named_urls if item.get('price'))
        items_with_image = sum(1 for item in named_urls if item.get('image_url'))
        print(f"🟩🟩🟩[SUCCESS] Processed: {post_data['title']}")
        print(f"📊[SUMMARY] {len(named_urls)} items | {items_with_price} with prices | {items_with_image} with images\n")
        return True

    except Exception as e:
        print(f"🟥🟥🟥[ERROR] Failed to process post: {e}\n")
        return False
    

def process_posts_in_batches(posts_to_process):
    """Process posts in parallel batches"""
    total_processed = 0
    
    # Process posts in batches
    for i in range(0, len(posts_to_process), BATCH_SIZE):
        batch = posts_to_process[i:i + BATCH_SIZE]
        print(f"🔄[BATCH] Processing batch {i//BATCH_SIZE + 1} with {len(batch)} posts (Processed {total_processed})")
        
        # Process batch in parallel
        with ThreadPoolExecutor(max_workers=min(BATCH_SIZE, MAX_WORKERS)) as executor:
            future_to_post = {executor.submit(process_single_post, post_info): post_info for post_info in batch}
            
            for future in as_completed(future_to_post):
                try:
                    success = future.result()
                    if success:
                        total_processed += 1
                except Exception as e:
                    print(f"🟥🟥🟥[BATCH-ERROR] Batch processing error: {e}")

        # Small delay between batches
        time.sleep(1)
    
    print(f"📊[FINAL] Successfully processed {total_processed} posts")

def get_recent_posts(subreddit_name="fashionreps", limit=100):
    print(f"\n⬜️⬜️⬜️[SYSTEM] \"get_recent_posts\" Called (for {subreddit_name})\n")

    subreddit = reddit.subreddit(subreddit_name)
    posts = list(subreddit.new(limit=limit))

    # Batch check for existing permalinks
    permalinks_to_check = [f"https://www.reddit.com{post.permalink}" for post in posts]
    existing_permalinks = get_existing_permalinks(permalinks_to_check)

    # Prepare all posts data first
    posts_to_process = []
    skip_counts = {"DUPLICATE": 0, "FLAIR": 0, "NO-URLS": 0}

    for postcount, post in enumerate(posts, 1):
        post_info, status = prepare_post_data(post, subreddit_name, existing_permalinks)
        
        if post_info is None:
            if status == "DUPLICATE":
                skip_counts["DUPLICATE"] += 1
                print(f"🟨[DUPLICATE-SKIPPED](#{postcount}) Already in DB: {post.title}")
            elif status.startswith("FLAIR"):
                skip_counts["FLAIR"] += 1
                flair = status.split("-")[1] if "-" in status else "unknown"
                print(f"🟨[FLAIR-SKIPPED](#{postcount}) Skipped due to flair: [{flair}] — {post.title}")
            elif status == "NO-URLS":
                skip_counts["NO-URLS"] += 1
                print(f"🟨[NO-URLS-SKIPPED](#{postcount}) No product URLs: {post.title}")
            continue
        
        posts_to_process.append(post_info)
    
    print(f"\n📊[STATS] Prepared {len(posts_to_process)} posts to process")
    print(f"📊[SKIPPED] Duplicates: {skip_counts['DUPLICATE']}, Flair: {skip_counts['FLAIR']}, No URLs: {skip_counts['NO-URLS']}")
    
    if posts_to_process:
        process_posts_in_batches(posts_to_process)

#-------------------------------------------------------------------------------------#
#ALTERNATING SUBREDDIT FUNCTION

if __name__ == "__main__":
    # example usage with both subreddits
    for sub in ["fashionreps", ]: #choose subreddits, limit will apply to each
        get_recent_posts(sub, limit=1000)
        time.sleep(2)  # Brief pause between subreddits