#current bottlenecks: cant read slideshow posts, cant read posts with no product links, and cant read agent links


import praw # Python Reddit API Wrapper, a Python library that allows you to easily interact with Reddit’s API, so we can read posts
import re # regular expressions for matching patterns in text, idk gpt said to use it
import time # time module for sleep functionality so we dont spam reddit
from dotenv import load_dotenv # to load environment variables from a .env file
import os # lets us access environment variables, pythons standard library for interacting with the operating system
from db import save_post_with_items # NOT dragonball
import openai
import json #jason

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY") # gets openai key from environment variables 

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

PRODUCT_URL_REGEX = r"(https?://(?:item\.taobao\.com|weidian\.com|x\.yupoo\.com|detail\.1688\.com)[^\s)\]]+)" 
# regex to match product links from Taobao, Weidian, Yupoo, and 1688

# the useless flairs we want to skip (lowercase)
SKIP_FLAIRS={"wdywt", "w2c", "discussion", "shitpost", "question", "guide", "news", 
             "presale", "lc", "announcement", "interest check"}
#line 1 fashionreps -> (in my experience some w2c post has product links), line 2 qualityreps -> (maybe add "retail reference pics", "seller update", fit pic",)

#-------------------------------------------------------------------------------------#

def ask_gpt_for_titles(post_text, urls): # function to ask GPT for product titles
    print("⬜️ ChatGPT Called")
    prompt = f"""
You are given the title and body of a Reddit post and a list of product URLs. 
Your task is to match each link to a meaningful name or product description. 
If you cannot confidently match a name, return an empty list: []. 

Don't include terms such as "qc", "from weidian", "from taobao", "from 1688", "replica", "fake", "knockoff", "retail", "legit", any hate speech, and any terms similar.
Don't include terms like "shirt", "pants", "hoodie", "shoes", "sneakers", "hoodie", "accessory" or any other generic clothing terms unless you're confident it is one. In this case, the item name itself is fine.

Return the output in valid JSON like:

[
  {{"url": "https://example.com/item1", "name": "Techwear cargo pants"}},
  {{"url": "https://example.com/item2", "name": "Replica Jordan 1 sneakers"}}
]

Reddit Post:
{post_text}

Product Links:
{urls}
"""

    response = openai.chat.completions.create(
        model="gpt-4.1-mini", #<------------------ model is chosen here!!!
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    content = response.choices[0].message.content
    return json.loads(content)

def extract_product_urls(text):
    return list(set(re.findall(PRODUCT_URL_REGEX, text)))

def get_recent_posts(subreddit_name="fashionreps", limit=10):
    print("⬜️ \"get_recent_posts\" Called")
    subreddit = reddit.subreddit(subreddit_name)
    posts = subreddit.new(limit=limit)
    
    for post in posts:
        flair = (post.link_flair_text or "").lower()
        # skip posts with flairs that are in the SKIP_FLAIRS set
        if flair in SKIP_FLAIRS:
            print(f"🟨[FLAIR-SKIPPED] Skipped due to flair: [{flair}] — {post.title}")
            continue
        # combine post body and title for URL scanning
        full_text = f"{post.title}\n\n{post.selftext}"
        product_urls = extract_product_urls(full_text)
        
        if not product_urls:
            continue  # skip posts with no product links, wonder if this will allow it to be added later if gpt finds no title

        post_data = {
            "title": post.title,
            "permalink": f"https://www.reddit.com{post.permalink}",
            "upvotes": post.score,
            "created_utc": post.created_utc,
            "subreddit": subreddit_name
        }

        try:
            named_urls = ask_gpt_for_titles(full_text, product_urls)
            if not named_urls:
                # the scraper correctly skips any posts that have no product links but if ask_gpt_for_titles() returns an empty list,
                # save_post_with_items() was still called, and the post gets saved with no items in the database
                # this function will prevent that, skipping the post if no named URLs are found
                print(f"🟨[NOURL-SKIPPED] Skipped, no named URLs found for post: {post.title}")
                continue
        except Exception as e:
            print(f"🟥[GPT-ERROR] GPT failed for post: {post.title} — {e}")
            continue

        save_post_with_items(post_data, named_urls)
        print(f"🟩[SUCCESS] Processed post: {post.title} with {len(named_urls)} product links.")

#-------------------------------------------------------------------------------------#
#ALTERNATING SUBREDDIT FUNCTION

if __name__ == "__main__":
    # example usage with both subreddits
    for sub in ["fashionreps", "qualityreps"]:
        get_recent_posts(sub, limit=300) #limit is for both subreddits, this function alternates
        time.sleep(0.25)  # so ion crash reddit or myself



#-------------------------------------------------------------------------------------#
#SUBREDDIT SPECIFIC FUNCTIONS (remove quotes)
'''
if __name__ == "__main__":
    # example usage with both subreddits
    for sub in ["qualityreps"]:
        get_recent_posts(sub, limit=30) #limit is for both subreddits, this function alternates
        time.sleep(0.25)  # so ion crash reddit or myself
'''

'''
if __name__ == "__main__":
    # example usage with both subreddits
    for sub in ["fashionreps"]:
        get_recent_posts(sub, limit=300) #limit is for both subreddits, this function alternates
        time.sleep(0.25)  # so ion crash reddit or myself
'''