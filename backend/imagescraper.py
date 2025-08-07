# This file is imagescraper.py - Enhanced with price scraping
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
def scrape_weidian_price(soup):
    """Extract price from Weidian product page"""
    try:
        # Method 1: Look for the specific pattern you found
        price_span = soup.find('span', class_='cur-price wd-theme__price')
        if price_span:
            price_text = price_span.get_text(strip=True)
            # Extract only numbers (and decimal point if present)
            price_match = re.search(r'(\d+(?:\.\d+)?)', price_text)
            if price_match:
                price = float(price_match.group(1))
                print(f"🟪[PRICE-SUCCESS] Found price (method 1): {price}")
                return price

        # Method 2: Look for data-v attributes with price-like classes
        price_spans = soup.find_all('span', {'data-v-486d16e2': True, 'class': lambda x: x and 'price' in x.lower()})
        for span in price_spans:
            price_text = span.get_text(strip=True)
            price_match = re.search(r'(\d+(?:\.\d+)?)', price_text)
            if price_match:
                price = float(price_match.group(1))
                print(f"🟪[PRICE-SUCCESS] Found price (method 2): {price}")
                return price

        # Method 3: Alternative class patterns for price
        price_patterns = [
            'cur-price',
            'price-current',
            'current-price',
            'wd-theme__price'
        ]
        
        for pattern in price_patterns:
            price_elements = soup.find_all(class_=lambda x: x and pattern in x)
            for element in price_elements:
                price_text = element.get_text(strip=True)
                price_match = re.search(r'(\d+(?:\.\d+)?)', price_text)
                if price_match:
                    price = float(price_match.group(1))
                    print(f"🟪[PRICE-SUCCESS] Found price (method 3, pattern: {pattern}): {price}")
                    return price

        # Method 4: Broader search for any element with "price" in class name
        all_price_elements = soup.find_all(class_=lambda x: x and 'price' in x.lower())
        for element in all_price_elements:
            price_text = element.get_text(strip=True)
            # Look for reasonable price ranges (assuming 1-9999 yuan)
            price_match = re.search(r'\b(\d{1,4}(?:\.\d{1,2})?)\b', price_text)
            if price_match:
                price = float(price_match.group(1))
                # Basic sanity check - reasonable price range
                if 1 <= price <= 9999:
                    print(f"🟪[PRICE-SUCCESS] Found price (method 4): {price}")
                    return price

        print(f"🟨[PRICE-NOTFOUND] No price found in page")
        return None

    except Exception as e:
        print(f"🟥🟥🟥[PRICE-ERROR] Error extracting price: {e}")
        return None

def scrape_weidian_image(soup, debugprinturl=""):
    """Extract image from Weidian product page using soup"""
    try:
        # Method 1: Look for pcitem pattern (original working pattern)
        pcitem_imgs = soup.find_all('img', src=lambda x: x and 'pcitem' in x and 'geilicdn.com' in x)
        for img in pcitem_imgs:
            src = img.get('src', '')
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found pcitem image: {clean_url}")
                return clean_url

        # Method 2: Look for wdseller pattern (second working pattern)
        wdseller_imgs = soup.find_all('img', src=lambda x: x and 'wdseller' in x and 'geilicdn.com' in x)
        for img in wdseller_imgs:
            src = img.get('src', '')
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found wdseller image: {clean_url}")
                return clean_url

        # Method 3: Look for open pattern (NEW - for failing URLs)
        open_imgs = soup.find_all('img', src=lambda x: x and 'open' in x and 'geilicdn.com' in x)
        for img in open_imgs:
            src = img.get('src', '')
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found open image: {clean_url}")
                return clean_url

        # Method 4: Fallback - original item-img class method
        img_tag = soup.find('img', class_='item-img')
        if img_tag and img_tag.get('src'):
            image_url = img_tag['src'].replace('&amp;', '&')
            print(f"🟪[IMAGE-SUCCESS] Found item-img class image: {image_url}")
            return image_url

        # Method 5: Last resort - any geilicdn image with reasonable dimensions
        all_geili_imgs = soup.find_all('img', src=lambda x: x and 'geilicdn.com' in x and '_' in x)
        for img in all_geili_imgs:
            src = img.get('src', '')
            if any(skip in src for skip in ['_74_74', '_30_30', '_96_52', 'unadjust', 'poseidon']):
                continue
            if is_valid_product_image(src):
                clean_url = src.split('?')[0].replace('.webp', '.jpg').replace('&amp;', '&')
                print(f"🟪[IMAGE-SUCCESS] Found fallback geilicdn image: {clean_url}")
                return clean_url

        print(f"🟥🟥🟥[IMAGE-NOTFOUND] No suitable image found for: {debugprinturl}")
        return None

    except Exception as e:
        print(f"🟥🟥🟥[IMAGE-ERROR] Error extracting image: {e}")
        return None

def scrape_weidian_data(url):
    """Scrape both image and price from a Weidian product page"""
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

        # Extract image and price using the soup
        image_url = scrape_weidian_image(soup, url)
        price = scrape_weidian_price(soup)

        return {
            'image_url': image_url,
            'price': price
        }

    except requests.exceptions.RequestException as e:
        print(f"🟥🟥🟥[DATA-ERROR] Network error for {url}: {e}")
        return {'image_url': None, 'price': None}
    except Exception as e:
        print(f"🟥🟥🟥[DATA-ERROR] Parsing error for {url}: {e}")
        return {'image_url': None, 'price': None}

#-------------------------------------------------------------------------------------#
def scrape_1688_data(url):
    """Scrape both image and price from a 1688 product page"""
    # TODO: Implement when you're ready to add 1688 support
    print(f"🖼️💰[DATA-TODO] 1688 scraping not implemented yet for {url}")
    return {'image_url': None, 'price': None}

#-------------------------------------------------------------------------------------#
def scrape_taobao_data(url):
    """Scrape both image and price from a Taobao product page"""
    # TODO: Implement when you're ready to add Taobao support
    print(f"🖼️💰[DATA-TODO] Taobao scraping not implemented yet for {url}")
    return {'image_url': None, 'price': None}

#-------------------------------------------------------------------------------------#
def scrape_yupoo_data(url):
    """Scrape data from Yupoo - usually just images, no prices"""
    # TODO: Implement when you're ready to add Yupoo support
    print(f"🖼️💰[DATA-TODO] Yupoo scraping not implemented yet for {url}")
    return {'image_url': None, 'price': None}

#-------------------------------------------------------------------------------------#
def scrape_product_image(url):
    """
    Legacy function - kept for backward compatibility
    Returns just the image URL
    """
    data = scrape_product_data(url)
    return data.get('image_url')

def scrape_product_data(url):
    """
    Router function that scrapes both image and price based on URL domain
    Returns dict with 'image_url' and 'price' keys
    """
    if not url:
        return {'image_url': None, 'price': None}

    try:
        if 'weidian.com' in url:
            return scrape_weidian_data(url)
        elif '1688.com' in url:
            return scrape_1688_data(url)
        elif 'taobao.com' in url:
            return scrape_taobao_data(url)
        elif 'yupoo.com' in url:
            return scrape_yupoo_data(url)
        else:
            print(f"🟨[DATA-UNSUPPORTED] Unsupported domain for {url}")
            return {'image_url': None, 'price': None}
    except Exception as e:
        print(f"🔹[DATA-ERROR] Unexpected error for {url}: {e}")
        return {'image_url': None, 'price': None}

# Test function - you can run this to test individual URLs
def test_scraper():
    """Test the scraper with example URLs"""
    test_urls = [
        "https://weidian.com/item.html?itemID=7457306479",
        "https://weidian.com/item.html?itemId=7506852426&vc_cps_track=1459920903_0_0"
    ]
    
    for url in test_urls:
        print(f"\n🧪[TEST] Testing URL: {url}")
        data = scrape_product_data(url)
        print(f"📊[RESULT] Image: {data['image_url']}")
        print(f"📊[RESULT] Price: {data['price']}")

if __name__ == "__main__":
    test_scraper()