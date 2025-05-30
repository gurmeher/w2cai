import praw # Python Reddit API Wrapper, a Python library that allows you to easily interact with Reddit’s API, so you can read posts.
import re # Regular expressions for matching patterns in text
import time # Time module for sleep functionality
from dotenv import load_dotenv
import os
from db import save_post_with_items

load_dotenv()


# Set up Reddit API using environment variables
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

# Regex to extract common product links
PRODUCT_URL_REGEX = r"(https?://(?:item\.taobao\.com|weidian\.com|x\.yupoo\.com|detail\.1688\.com)[^\s)\]]+)"

def extract_product_urls(text):
    return list(set(re.findall(PRODUCT_URL_REGEX, text)))

def get_recent_posts(subreddit_name="fashionreps", limit=10):
    subreddit = reddit.subreddit(subreddit_name)
    posts = subreddit.new(limit=limit)
    
    for post in posts:
        # Combine post body and title for URL scanning
        full_text = f"{post.title}\n{post.selftext}"
        product_urls = extract_product_urls(full_text)
        
        if not product_urls:
            continue  # Skip posts with no product links

        post_data = {
            "title": post.title,
            "permalink": post.permalink,
            "upvotes": post.score,
            "created_utc": post.created_utc,
            "subreddit": subreddit_name
        }

        save_post_with_items(post_data, product_urls)
        print(f"Saved post: {post.title} with {len(product_urls)} products")

if __name__ == "__main__":
    # Example usage with both subreddits
    for sub in ["fashionreps", "qualityreps"]:
        get_recent_posts(sub, limit=50)
        time.sleep(0.25)  # Be nice to Reddit API
