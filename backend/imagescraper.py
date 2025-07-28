# This file is imagescraper.py
import requests
from bs4 import BeautifulSoup
import time
import random
import re

# User agents to rotate through to avoid getting blocked
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
]

# Helper: Check if image filename contains any _###_### dimension pattern
def is_valid_product_image(url):
    return re.search(r'_\d{3,4}_\d{3,4}', url) is not None

#-------------------------------------------------------------------------------------#
def scrape_weidian_image(url):
    """Scrape the main product image from a Weidian product page"""
    try:
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }

        # Add a small delay to be respectful
        time.sleep(random.uniform(0.5, 1.5))

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Method 1: Look for pcitem pattern (original working pattern)
        pcitem_imgs = soup.find_all('img', src=lambda x: x and 'pcitem' in x and 'geilicdn.com' in x)
        for img in pcitem_imgs:
            src = img.get('src', '')
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found pcitem image for {url}: {clean_url}")
                return clean_url

        # Method 2: Look for wdseller pattern (second working pattern)
        wdseller_imgs = soup.find_all('img', src=lambda x: x and 'wdseller' in x and 'geilicdn.com' in x)
        for img in wdseller_imgs:
            src = img.get('src', '')
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found wdseller image for {url}: {clean_url}")
                return clean_url

        # Method 3: Look for open pattern (NEW - for failing URLs)
        open_imgs = soup.find_all('img', src=lambda x: x and 'open' in x and 'geilicdn.com' in x)
        for img in open_imgs:
            src = img.get('src', '')
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found open image for {url}: {clean_url}")
                return clean_url

        # Method 4: Fallback - original item-img class method
        img_tag = soup.find('img', class_='item-img')
        if img_tag and img_tag.get('src'):
            image_url = img_tag['src'].replace('&amp;', '&')
            print(f"🟪[IMAGE-SUCCESS] Found item-img class image for {url}: {image_url}")
            return image_url

        # Method 5: Last resort - any geilicdn image with reasonable dimensions
        all_geili_imgs = soup.find_all('img', src=lambda x: x and 'geilicdn.com' in x and '_' in x)
        for img in all_geili_imgs:
            src = img.get('src', '')
            if any(skip in src for skip in ['_74_74', '_30_30', '_96_52', 'unadjust', 'poseidon']):
                continue
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found fallback geilicdn image for {url}: {clean_url}")
                return clean_url

        print(f"🟥[IMAGE-NOTFOUND] No suitable image found for {url}")
        return None

    except requests.exceptions.RequestException as e:
        print(f"🟥[IMAGE-ERROR] Network error for {url}: {e}")
        return None
    except Exception as e:
        print(f"🟥[IMAGE-ERROR] Parsing error for {url}: {e}")
        return None

#-------------------------------------------------------------------------------------#
def scrape_1688_image(url):
    """Scrape the main product image from a 1688 product page"""
    # TODO: Implement when you're ready to add 1688 support
    print(f"🖼️[IMAGE-TODO] 1688 scraping not implemented yet for {url}")
    return None

#-------------------------------------------------------------------------------------#
def scrape_taobao_image(url):
    """Scrape the main product image from a Taobao product page"""
    # TODO: Implement when you're ready to add Taobao support
    print(f"🖼️[IMAGE-TODO] Taobao scraping not implemented yet for {url}")
    return None

#-------------------------------------------------------------------------------------#
def scrape_product_image(url):
    """
    Router function that calls the appropriate scraper based on the URL domain
    Returns the image URL or None if scraping fails
    """
    if not url:
        return None

    try:
        if 'weidian.com' in url:
            return scrape_weidian_image(url)
        elif '1688.com' in url:
            return scrape_1688_image(url)
        elif 'taobao.com' in url:
            return scrape_taobao_image(url)
        else:
            print(f"🟨[IMAGE-UNSUPPORTED] Unsupported domain for {url}")
            return None
    except Exception as e:
        print(f"🔹[IMAGE-ERROR] Unexpected error for {url}: {e}")
        return None

# Test function - you can run this to test individual URLs
def test_scraper():
    """Test the scraper with the URL you provided"""
    test_url = "https://weidian.com/item.html?itemId=7506852426&vc_cps_track=1459920903_0_0"
    image_url = scrape_product_image(test_url)
    print(f"Result: {image_url}")

if __name__ == "__main__":
    test_scraper()
