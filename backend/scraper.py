#This file is scraper.py - Simple optimizations without new dependencies
#current bottlenecks: cant read slideshow posts, cant read posts with no product links, and cant read agent links
from imagescraper import scrape_product_data
import praw # Python Reddit API Wrapper, a Python library that allows you to easily interact with Reddit's API, so we can read posts
import re # regular expressions for matching patterns in text, idk gpt said to use it
import time # time module for sleep functionality so we dont spam reddit
from dotenv import load_dotenv # to load environment variables from a .env file
import os # lets us access environment variables, pythons standard library for interacting with the operating system
from db import save_post_with_items, get_existing_permalinks # NOT dragonball
import openai
import json #jason
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY") # gets openai key from environment variables 

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

PRODUCT_URL_REGEX = r"(https?://(?:item\.taobao\.com|(?:[\w\-]+\.)*weidian\.com|x\.yupoo\.com|detail\.1688\.com)[^\s)\]]+)"
# regex to match product links from Taobao, Weidian, Yupoo, and 1688

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
    "MM": "Maison Margiela(MM) ",
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
}

#-------------------------------------------------------------------------------------#

def expand_brand_acronyms(item_name):
    """
    Expand brand acronyms in item names while preserving context.
    Uses word boundary matching to avoid partial replacements.
    Works with any case: BLCG, blcg, Blcg, etc.
    """
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

def ask_gpt_for_titles(post_text, urls, retries=0): # function to ask GPT for product titles
    print("⬜️[SYSTEM] ChatGPT Called")
    prompt = f"""
        You are given the title and body of a Reddit post with links of product URLs. 
        Your task is to match each link to a meaningful name or product description. 
        If you cannot confidently match a name for a URL, exclude that URL entirely. Do not include it in the output.
        Write the name in title capitalization format, ex: "Fear of God Pants and Hat".
        Fix typos if obvious.

        Don't include terms such as "qc", "from weidian", "from taobao", "from 1688", "replica", "fake", "knockoff", "retail", "legit", any hate speech, and any terms similar.
        Don't include terms like "shirt", "pants", "hoodie", "shoes", "sneakers", "hoodie", "accessory" or any other generic clothing terms unless you're confident it is one. In this case, the item name itself is fine.

        IMPORTANT: Return ONLY valid JSON. No explanation, no markdown, no extra text. Just the JSON array.

        Format:
        [
        {{"url": "https://example.com/item1", "name": "Techwear Cargo Pants"}},
        {{"url": "https://example.com/item2", "name": "Jordan 1 Sneakers"}}
        ]

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
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
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
        valid_items = []
        for item in named_urls:
            if isinstance(item, dict) and "url" in item and "name" in item:
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
            return ask_gpt_for_titles(post_text, urls, retries + 1)
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
    print(f"🖼️💰[DATA] Scraping {len(named_urls)} items (image + price) in parallel...")
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submit all data scraping tasks
        future_to_item = {executor.submit(scrape_single_item_data, item): item for item in named_urls}
        
        # Wait for completion
        for future in as_completed(future_to_item):
            try:
                future.result()  # This will raise an exception if the task failed
            except Exception as e:
                print(f"🟥🟥🟥[DATA-ERROR] Data scraping task failed: {e}")

def extract_product_urls(text):
    return list(set(re.findall(PRODUCT_URL_REGEX, text)))

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
        
        named_urls = ask_gpt_for_titles(full_text, product_urls)
        
        if not named_urls:
            print(f"🟨[NOURL-SKIPPED] No named URLs found for: {post_data['title']}")
            return False
        
        save_post_with_items(post_data, named_urls)
        
        # Log summary of what was saved
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

def get_recent_posts(subreddit_name="fashionreps", limit=100, searchquery=""):
    print(f"\n⬜️⬜️⬜️[SYSTEM] \"get_recent_posts\" Called (for {subreddit_name}) - OPTIMIZED VERSION WITH PRICE SCRAPING\n")
    
    subreddit = reddit.subreddit(subreddit_name)
    posts = list(subreddit.new(limit=limit))

    #posts = list(subreddit.search(query="", sort="new", limit=limit)) # CHANGE THIS TO CHANGE POST RETRIEVAL METHOD 
    #posts = list(subreddit.new(limit=limit))  <-- use this to get the newest posts
    #posts = list(subreddit.top(time_filter="week", limit=limit)) <-- use this to get the top posts of the week
    #posts = list(subreddit.top(time_filter="month", limit=limit))
    #posts = list(subreddit.hot(limit=limit))
    #posts = list(subreddit.rising(limit=limit))
    #posts = list(subreddit.search(query="", sort="new", limit=limit)) <-- use this to search for specific keywords. limit is abt 250

    # Batch check for existing permalinks
    permalinks_to_check = [f"https://www.reddit.com{post.permalink}" for post in posts]
    existing_permalinks = get_existing_permalinks(permalinks_to_check)

    # Prepare all posts data first
    posts_to_process = []
    skip_counts = {"DUPLICATE": 0, "FLAIR": 0, "NO-URLS": 0}
    
    print("📋[PREP] Preparing posts data...")
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
    else:
        print("📭[EMPTY] No posts to process")

#-------------------------------------------------------------------------------------#
#ALTERNATING SUBREDDIT FUNCTION

if __name__ == "__main__":
    # example usage with both subreddits
    for sub in ["fashionreps", "qualityreps"]: #choose subreddits, limit will apply to each
        get_recent_posts(sub, limit=1000) #using searchquery will typically limit 
        time.sleep(2)  # Brief pause between subreddits