import os #lets us access environment variables
import psycopg2 # PostgreSQL database adapter for Python
from dotenv import load_dotenv # to load environment variables from a .env file

load_dotenv() # Load environment variables from .env file

SUPABASE_URL = os.getenv("SUPABASE_URL") # Get the Supabase URL from environment variables

def get_connection(): # Function to establish a connection to the PostgreSQL database
    return psycopg2.connect(SUPABASE_URL)

def init_db():
    conn = get_connection() # Establish a connection to the database
    cur = conn.cursor() # Create a cursor object to execute SQL commands
    

    # Create table for unique product links
    cur.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            product_url TEXT UNIQUE,
            name TEXT,
            first_seen_utc REAL
        )
    ''')

    # Create table for Reddit posts
    cur.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title TEXT,
            permalink TEXT UNIQUE,
            upvotes INTEGER,
            created_utc REAL,
            subreddit TEXT
        )
    ''')

    # Create many-to-many join table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS post_item_links (
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
            PRIMARY KEY (post_id, item_id)
        )
    ''')

    conn.commit()
    cur.close()
    conn.close()

def save_post_with_items(post, product_urls):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # Insert or retrieve post
        cur.execute('''
            INSERT INTO posts (title, permalink, upvotes, created_utc, subreddit)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (permalink) DO NOTHING
            RETURNING id
        ''', (
            post['title'],
            post['permalink'],
            post['upvotes'],
            post['created_utc'],
            post['subreddit']
        ))

        post_id_row = cur.fetchone()
        if post_id_row is None:
            cur.execute('SELECT id FROM posts WHERE permalink = %s', (post['permalink'],))
            post_id_row = cur.fetchone()
        post_id = post_id_row[0]

        for url in product_urls:
            # Insert or retrieve item
            cur.execute('''
                INSERT INTO items (product_url, first_seen_utc)
                VALUES (%s, %s)
                ON CONFLICT (product_url) DO NOTHING
                RETURNING id
            ''', (url, post['created_utc']))
            item_id_row = cur.fetchone()
            if item_id_row is None:
                cur.execute('SELECT id FROM items WHERE product_url = %s', (url,))
                item_id_row = cur.fetchone()
            item_id = item_id_row[0]

            # Insert link between post and item
            cur.execute('''
                INSERT INTO post_item_links (post_id, item_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            ''', (post_id, item_id))

        conn.commit()
    finally:
        cur.close()
        conn.close()

def fetch_items_with_posts():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT i.id, i.product_url, i.name, p.id, p.title, p.permalink, p.upvotes
        FROM items i
        JOIN post_item_links pil ON i.id = pil.item_id
        JOIN posts p ON p.id = pil.post_id
        ORDER BY i.id, p.upvotes DESC
    ''')
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = {}
    for item_id, product_url, name, post_id, title, permalink, upvotes in rows:
        if item_id not in result:
            result[item_id] = {
                "product_url": product_url,
                "name": name,
                "posts": []
            }
        result[item_id]["posts"].append({
            "id": post_id,
            "title": title,
            "permalink": f"https://reddit.com{permalink}",
            "upvotes": upvotes
        })
    return list(result.values())
init_db()