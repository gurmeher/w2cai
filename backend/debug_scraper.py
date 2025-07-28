import requests
from bs4 import BeautifulSoup
import time
import random

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
]

def debug_specific_url():
    url = "https://weidian.com/item.html?itemID=7504141137"
    
    try:
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        print(f"🔍 [DEBUG] Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        print(f"🔍 [DEBUG] Status Code: {response.status_code}")
        print(f"🔍 [DEBUG] Content Length: {len(response.content)} bytes")
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Check all img tags
        all_imgs = soup.find_all('img')
        print(f"🔍 [DEBUG] Found {len(all_imgs)} img tags total")
        
        # Check for each pattern specifically
        pcitem_imgs = soup.find_all('img', src=lambda x: x and 'pcitem' in x and 'geilicdn.com' in x)
        print(f"🔍 [DEBUG] Found {len(pcitem_imgs)} pcitem images")
        for i, img in enumerate(pcitem_imgs, 1):
            src = img.get('src', '')
            print(f"   └─ {i}: {src[:100]}...")
            
        wdseller_imgs = soup.find_all('img', src=lambda x: x and 'wdseller' in x and 'geilicdn.com' in x)
        print(f"🔍 [DEBUG] Found {len(wdseller_imgs)} wdseller images")
        for i, img in enumerate(wdseller_imgs, 1):
            src = img.get('src', '')
            print(f"   └─ {i}: {src[:100]}...")
            
        open_imgs = soup.find_all('img', src=lambda x: x and 'open' in x and 'geilicdn.com' in x)
        print(f"🔍 [DEBUG] Found {len(open_imgs)} open images")
        for i, img in enumerate(open_imgs, 1):
            src = img.get('src', '')
            print(f"   └─ {i}: {src[:100]}...")
        
        # Check for any geilicdn images
        all_geili = soup.find_all('img', src=lambda x: x and 'geilicdn.com' in x)
        print(f"🔍 [DEBUG] Found {len(all_geili)} total geilicdn images")
        for i, img in enumerate(all_geili, 1):
            src = img.get('src', '')
            print(f"   └─ {i}: {src[:100]}...")
        
        # Check if there are any images in script tags or other places
        print(f"🔍 [DEBUG] Checking for images in script tags...")
        scripts = soup.find_all('script')
        geili_in_scripts = 0
        for script in scripts:
            if script.string and 'geilicdn.com' in script.string:
                geili_in_scripts += 1
                # Look for image URLs in the script
                script_content = script.string
                if 'pcitem' in script_content:
                    print("   └─ Found pcitem in script content")
                if 'wdseller' in script_content:
                    print("   └─ Found wdseller in script content")
                if 'open' in script_content:
                    print("   └─ Found open in script content")
        
        print(f"🔍 [DEBUG] Found geilicdn in {geili_in_scripts} script tags")
        
        # Show a preview of the HTML
        print(f"🔍 [DEBUG] HTML Preview (first 2000 chars):")
        print(response.text[:2000])
        print("=" * 100)
        
    except Exception as e:
        print(f"🟥 [ERROR] {e}")

if __name__ == "__main__":
    debug_specific_url()