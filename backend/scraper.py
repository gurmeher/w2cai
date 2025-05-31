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



def ask_gpt_for_titles(post_text, urls): # function to ask GPT for product titles
    prompt = f"""
You are given the title and body of a Reddit post and a list of product URLs. 
Your task is to match each link to a meaningful name or product description. 
If you are not sure about any of the product names, or if you cannot confidently match a name, return an empty list: []. 
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
        model="gpt-4", #<------------------ model is chosen here!!!
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )
    content = response.choices[0].message.content
    return json.loads(content)

def extract_product_urls(text):
    return list(set(re.findall(PRODUCT_URL_REGEX, text)))

def get_recent_posts(subreddit_name="fashionreps", limit=10):
    subreddit = reddit.subreddit(subreddit_name)
    posts = subreddit.new(limit=limit)
    
    for post in posts:
        # combine post body and title for URL scanning
        full_text = f"{post.title}\n\n{post.selftext}"
        product_urls = extract_product_urls(full_text)
        
        if not product_urls:
            continue  # skip posts with no product links, wonder if this will allow it to be added later if gpt finds no title

        post_data = {
            "title": post.title,
            "permalink": post.permalink,
            "upvotes": post.score,
            "created_utc": post.created_utc,
            "subreddit": subreddit_name
        }

        try:
            named_urls = ask_gpt_for_titles(full_text, product_urls)
        except Exception as e:
            print(f"GPT failed for post: {post.title} — {e}")
            continue

        save_post_with_items(post_data, named_urls)
        print(f"Processed post: {post.title} with {len(named_urls)} product links.")


if __name__ == "__main__":
    # example usage with both subreddits
    for sub in ["fashionreps", "qualityreps"]:
        get_recent_posts(sub, limit=50)
        time.sleep(0.25)  # so ion crash reddit or myself
