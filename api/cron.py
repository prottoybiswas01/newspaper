import os
import json
import urllib.request
import urllib.parse
import sys
from http.server import BaseHTTPRequestHandler
import concurrent.futures
from datetime import datetime, timezone
import feedparser
from pymongo import MongoClient
from pymongo.errors import PyMongoError

def safe_print(message):
    try:
        print(message)
    except UnicodeEncodeError:
        try:
            encoding = sys.stdout.encoding or 'utf-8'
            print(message.encode(encoding, errors='replace').decode(encoding))
        except Exception:
            pass

# Popular Bengali news portal RSS feeds (10 feeds)
FEEDS = [
    {"name": "প্রথম আলো (Prothom Alo)", "url": "https://www.prothomalo.com/feed/"},
    {"name": "কালের কণ্ঠ (Kaler Kantho)", "url": "https://www.kalerkantho.com/rss.xml"},
    {"name": "জাগো নিউজ ২৪ (Jago News 24)", "url": "https://www.jagonews24.com/rss/rss.xml"},
    {"name": "বিডিনিউজ ২৪ (bdnews24)", "url": "https://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true"},
    {"name": "বাংলানিউজ ২৪ (banglanews24)", "url": "https://www.banglanews24.com/rss/rss.xml"},
    {"name": "ডেইলি স্টার বাংলা (Daily Star)", "url": "https://bangla.thedailystar.net/rss.xml"},
    {"name": "সময় টিভি (Somoy TV)", "url": "https://somoynews.tv/rss/rss.xml"},
    {"name": "ডিবিসি নিউজ (DBC News)", "url": "https://dbcnews.tv/rss.xml"},
    {"name": "বার্তা ২৪ (Barta24)", "url": "https://barta24.com/rss.xml"},
    {"name": "ঢাকা পোস্ট (Dhaka Post)", "url": "https://www.dhakapost.com/rss"}
]

def fetch_single_feed(feed):
    """Fetch a single RSS feed with custom user agent and timeout."""
    try:
        req = urllib.request.Request(
            feed['url'], 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        # 3.5 seconds timeout to avoid exceeding Vercel 10s serverless limit when running concurrently
        with urllib.request.urlopen(req, timeout=3.5) as response:
            xml_data = response.read()
        parsed = feedparser.parse(xml_data)
        return feed['name'], parsed
    except Exception as e:
        safe_print(f"Error fetching feed '{feed['name']}': {e}")
        return feed['name'], None

# List of Gemini API keys for rotation to bypass Free Tier rate limits (15 RPM)
API_KEYS = [
    "AQ.Ab8RN6I4gpEPPnEb7u3aVAeoKhIHt5JEEzvFgDuoYENiAppTAA",
    "AQ.Ab8RN6JP6wvHqeC37_4tXK_AVRCWzR24aP_dQ-KbRLaBCzcavA",
    "AQ.Ab8RN6IzEfpep7fOx2UWq3HQ7w0inm2-YVSd6rfVaUzqU2ldfQ",
    "AQ.Ab8RN6Jk_nvyoWTN9wj4BIsAlWL8HnCiUDPbj96RJvhgL_vBoQ",
    "AQ.Ab8RN6IBy0rtE2o8g464yvh6L74yVeBqpVXzwWwae58BfecZuw",
    "AQ.Ab8RN6LMe6DyvZjtouwlyBZyfbW3-s6Sx78mlK21gGgAqL3reA",
    "AQ.Ab8RN6JQzKlEGPGCasKoPrTTS00ru0kEd2sp1-eXTcMdVGxzsw",
    "AQ.Ab8RN6LwT7znPkhPsOyiEGNFbqjuqFhBYsOivH5C7m6pb5uMRw",
    "AQ.Ab8RN6Kg29L3yk-jwTXj9I9yjUih9tMKOGkV9-Qcu_65aHCb5Q",
    "AQ.Ab8RN6Ki-hK7GvOwUVQ0FA8BzhNWvkz05AoaLNVjgf3FwbeEng",
    "AQ.Ab8RN6J07YArRKyYZb0xFCGJigqvxlfsams7I5qTVEhk3wbFww",
    "AQ.Ab8RN6JV8qfZIrEAjJtFtNaCpFLVnMakjUu2FoEwrgWqKqfuKw",
    "AQ.Ab8RN6LpDhpQKWKy17htDj3JKIvy-dnd16aJTMBzAAXxTiq3Nw",
    "AQ.Ab8RN6L7zpWXuotj5aNjLUX6J25ywtwHvj9NKl-g-CHuaooJxA",
    "AQ.Ab8RN6JohLCOutH7oVrqGiGPLDZOI9edUnrlGdpcLYXIUkRgaw",
    "AQ.Ab8RN6LXcSyXAWejJIHomXoLSH2hzozwO1wsvApSH39SJjtjYA",
    "AQ.Ab8RN6LoiAd4Y_CUIMih4Od1IPkyKaLtJTo5fmKS50EVBPA9Hg",
    "AQ.Ab8RN6J1pMCEpkHfoW-U141KD3Ft29r42H0vkVcxY3XKfaiuGg",
    "AQ.Ab8RN6IsY2eWASvYllrdNOW0jCTuNaG3FCmLDA5wpe5YTS_lJA",
    "AQ.Ab8RN6K7gauJf_43sRaNF4PhhMbpu0QBSfRixiF3lxx89XfDbg",
    "AQ.Ab8RN6JixV3OQgFlkHeLF1J4qoVvquEKmu_Ope2RVA9Z0BW98Q",
    "AQ.Ab8RN6J_Em9YT60_i-jk0k0YTOpF8-MJk0cSzxUvSgdhbHHiYA",
    "AQ.Ab8RN6JbwU0d96Cbe0Z39gtkZVgXaYAQdyt4Oux6dbmHbphi9g",
    "AQ.Ab8RN6Jj7EQkwRBdZpiNAO1ucXljHH95QMU-dfe4cuQTKsyjiQ",
    "AQ.Ab8RN6JQh87DaKGdh0UtWBERjLFMrpZnyLDXdaxG0jgISQeGcA",
    "AQ.Ab8RN6KTmgbovpmh7d83-RIlgdqquH0N3w0CjAPs7JAFkmt8YA",
    "AQ.Ab8RN6LaZDWHfC1vFpO51e7bdc2q3rrGjOlg83CJ6kFWgK4M4g",
    "AQ.Ab8RN6I5UA6doaqcpREU7919PfDKKiBmialCvPa3ltlSF3PuTQ",
    "AQ.Ab8RN6K_z8L_UecinoMu61GCmTtj4n0cX8LVYb4LuiGv3uG5Lw",
    "AQ.Ab8RN6IzwbQ9fRIGj6leYIYMLyrC7MsUhlTcdcOtgH9zQLYMKw",
    "AQ.Ab8RN6IJ1L1Nkf__MRG7voF9TND5pZpsyOgQBC7BDftY7eOJQA",
    "AQ.Ab8RN6IeV6BM_CfrpUUt-4_LtMyiISC_u14RMSw4IeNarsS4UA",
    "AQ.Ab8RN6JhwD9Csh1ALc1wbU2gVjA13xNwvKE8_jDhKn9gNbPm1g",
    "AQ.Ab8RN6Ll8gTxHEqtBnhP_CXYsCWpc0BUd4ZxWZlgvMWoSZqplQ",
    "AQ.Ab8RN6JPc-vjYS8s4UZR-lprFIZEJeyBVXjVsNNg89Yuo5llwg",
    "AQ.Ab8RN6JIa4ccE_N5TXbtXasl5Wu4RSXYnBjb929vKCHIa-QklA",
    "AQ.Ab8RN6JdPA_qSXtHVRXI-OATTRyOjaaPQbqdrluyQn2qpSFsdQ",
    "AQ.Ab8RN6KMEVH4M1VbZ8c2zmCfo8JscCmjWU10fp-Scqg_9wGKqg",
    "AQ.Ab8RN6J2EzEls3wdwh9u0FqVPBq_MI9xIAijUrvFE9Z-E8IIKA",
    "AQ.Ab8RN6IOk0dome6iAQYSk1RK-BElI6hOPPGA6EAcUqwbvc_Qcg",
    "AQ.Ab8RN6Inct93iXjm1sX3udbGTjTRbJOI9k_YjGmcAY_KqoL_0w",
    "AQ.Ab8RN6L74kSnPGY-OkNMhaZmaphoqrjHFjl-bkx-DPklHnL3Hw",
    "AQ.Ab8RN6LgvPXoHStCx_P2WhPFm4TGOhTR1Ky3E2LMnR1IelE0Bg",
    "AQ.Ab8RN6JSGXHfXi8VWdaZyAduJpipjWtd6n3U72vtD1kkBcpnLA",
    "AQ.Ab8RN6LoBYI4UwpmVpcym8XJ9ovDJYLCXOBwcTPThOKFJTFNTA",
    "AQ.Ab8RN6IjhRi4S6m9H63d4TwRsBmXo0PGtCfoznu-4pATFZe7-Q",
    "AQ.Ab8RN6J5IF7VcG1Wd5fiKkaTvL5-pCd7jCbjMi56R2MDci0xIA",
    "AQ.Ab8RN6LyQOKHhrCaWpBuisYdbVa6yht5rnnW2MFmbY_k9c5ntg",
    "AQ.Ab8RN6KOtRzlOWs5ymwXi-tP7nS-mwOAkdyaKcHllvfI52T2uw",
    "AQ.Ab8RN6IXub2_UlxxBTBzb__g81vdgjDmNN3msBr4FFXQgiSznA",
    "AQ.Ab8RN6KSXlwcVK1RK0UT7BsUqGlP43cLLBQXt3Ngi8Vjd9R6bg",
    "AQ.Ab8RN6I0GXTOw5vuxLkWuisO6dh2s_s2L6mbgnJRJ9kw2yIVKA",
    "AQ.Ab8RN6L9B3mtxGYxZ6KuUrAz5uk2QSBHE0rvScDMgDwHc04iYg",
    "AQ.Ab8RN6K1cnNkWUxAIkSiWFpzEWO0YK6xiZqSyO4Z_1yYByNVkA",
    "AQ.Ab8RN6LKwQNIi7FZSnep4zl4fTuQzHPIdhebOqQhXSXtykY-FA",
    "AQ.Ab8RN6IxV31VsRK36DNf_iqzgxFFcACjNiurtr18Qk1eqN5cyg",
    "AQ.Ab8RN6LdLAIoMChom2myJ8G2wgeMuwVRH90juYJG6Or33GxbZQ",
    "AQ.Ab8RN6Jk-HREqpC9gTMf4syXCrM_OmsSoAjdwxEEIWlLQx9Vfg",
    "AQ.Ab8RN6Kr-JWaumvN3T3iAvKAT5qlEHotsOJQ7fSRRNwaS6RUAg",
    "AQ.Ab8RN6LtopQ0KG29RCPZhZsrpRBZNysQnxP5wJGx2MWpAAciuw",
    "AQ.Ab8RN6Kk1K2b1TbDjjw8vUFZZ5VTkwagjyzGubhR6H6_L20eHw",
    "AQ.Ab8RN6LdqZN2VcmlsfXvIJL799sOXafaxmvpY4bsASEMtol-0w",
    "AQ.Ab8RN6IYeK0uFhk8i99AzckDsgjn1WR4EoPcIf3abEjcyViS5Q",
    "AQ.Ab8RN6LjyIwKBSqneGlXnUneIso7mWz4RqbwNIcS0ngJbWQQIQ",
    "AQ.Ab8RN6KhecwxQDa5AVm16pz7z9aTuB2F_UmVbOX1lwcktx9_lg",
    "AQ.Ab8RN6JMHaLXsXfAf3vB3GWfsuzE8QNx_i9vWZIrIQqM6mtEYA",
    "AQ.Ab8RN6KEplM2c-Ltsj6nRNzwkQau28-N61Cl68WYY-HojXIWLw",
    "AQ.Ab8RN6JbML6pgNcf_ZYmafcFtQcLAO9njah8qe5-iX3Vl3btiA"
]

# We can also load from environment variables if set (comma-separated)
env_keys = os.environ.get("GEMINI_API_KEYS") or os.environ.get("GEMINI_API_KEY")
if env_keys:
    # Prepend environment keys to our rotation list
    API_KEYS = [k.strip() for k in env_keys.split(",") if k.strip()] + API_KEYS

key_index = 0

def get_next_api_key():
    global key_index
    if not API_KEYS:
        return None
    key = API_KEYS[key_index % len(API_KEYS)]
    key_index += 1
    return key

def rewrite_with_gemini(title, description, retries=5):
    """Rewrite news title and description using Google's free Gemini API with key rotation on rate limits."""
    if not title or not description:
        return title, description
        
    for attempt in range(retries):
        api_key = get_next_api_key()
        if not api_key:
            break
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        prompt = (
            "You are a professional Bengali journalist. Read and fully digest the news article title and description below. "
            "Rewrite them completely in your own words. Use different sentence structures, synonyms, and a unique editorial style "
            "to ensure the resulting text is 100% unique, copyright-friendly, and free from plagiarism while accurately retaining the core facts of the news. "
            "Write in modern, standard Bengali (Cholitobhasa). "
            "Return the output STRICTLY as a raw JSON object with keys 'title' and 'description'. Do not include markdown code block syntax "
            "like ```json or ```, just return the raw JSON text.\n\n"
            f"Original Title: {title}\n"
            f"Original Description: {description}"
        )
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=4.0) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                
            candidates = res_data.get('candidates', [])
            if candidates:
                content_text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                cleaned_text = content_text.strip().replace('```json', '').replace('```', '')
                parsed_res = json.loads(cleaned_text)
                
                new_title = parsed_res.get('title', title)
                new_desc = parsed_res.get('description', description)
                return new_title, new_desc
                
        except urllib.error.HTTPError as e:
            if e.code == 429:
                safe_print(f"Rate limit (429) hit with current key. Rotating to next key. Attempt {attempt + 1}/{retries}")
                continue  # Retry with next rotated key
            else:
                safe_print(f"Gemini API HTTP Error {e.code}: {e.reason}. Falling back.")
                break
        except Exception as e:
            safe_print(f"Gemini rewriting failed: {e}. Falling back to original content.")
            break
            
    return title, description

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Fetch feeds concurrently
        parsed_feeds = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
            futures = {executor.submit(fetch_single_feed, feed): feed for feed in FEEDS}
            for future in concurrent.futures.as_completed(futures):
                feed_name, parsed = future.result()
                if parsed:
                    parsed_feeds.append((feed_name, parsed))

        # 2. Database integration
        mongo_uri = os.environ.get("MONGODB_URI")
        
        # Fallback response if MongoDB URI is not set
        if not mongo_uri:
            # Gather statistics without saving to database (dry run mode)
            fetched_feeds_summary = []
            total_items = 0
            for name, parsed in parsed_feeds:
                items_count = len(parsed.entries)
                total_items += items_count
                fetched_feeds_summary.append({"feed": name, "items_count": items_count})
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_payload = {
                "success": True,
                "mode": "dry-run (MONGODB_URI not set)",
                "total_fetched": total_items,
                "summary": fetched_feeds_summary,
                "message": "MONGODB_URI environment variable is missing. Feeds were parsed but not saved."
            }
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            return

        # 3. Connect to MongoDB and save items
        try:
            client = MongoClient(mongo_uri)
            # Access default database or fallback to 'newspaper'
            try:
                db = client.get_default_database()
            except Exception:
                db = client['newspaper']
                
            collection = db['autofetchedarticles']
            
            # Ensure unique index on link field to enforce duplicate prevention in the DB layer too
            collection.create_index("link", unique=True)
            
            inserted_count = 0
            duplicate_count = 0
            total_processed = 0
            
            for feed_name, parsed in parsed_feeds:
                for entry in parsed.entries:
                    link = entry.get('link')
                    if not link:
                        continue
                    
                    total_processed += 1
                    
                    # Prevent duplicate insertion using query check
                    if collection.find_one({"link": link}):
                        duplicate_count += 1
                        continue
                    
                    title = entry.get('title', 'No Title')
                    description = entry.get('summary') or entry.get('description') or ''
                    
                    # Rewrite with Gemini AI (uses key rotation)
                    title, description = rewrite_with_gemini(title, description)
                    
                    # Parse date or default to now
                    pub_date_parsed = entry.get('published_parsed')
                    if pub_date_parsed:
                        try:
                            # Construct UTC datetime from feed struct_time
                            pub_date = datetime(*pub_date_parsed[:6], tzinfo=timezone.utc)
                        except Exception:
                            pub_date = datetime.now(timezone.utc)
                    else:
                        pub_date = datetime.now(timezone.utc)
                    
                    # Clean description if it's too long
                    if len(description) > 1000:
                        description = description[:997] + '...'
                    
                    doc = {
                        "title": title,
                        "link": link,
                        "description": description,
                        "pubDate": pub_date,
                        "source": feed_name,
                        "createdAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc)
                    }
                    
                    try:
                        collection.insert_one(doc)
                        inserted_count += 1
                    except PyMongoError:
                        # Handle duplicate key or database write exception
                        duplicate_count += 1
                        
            client.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_payload = {
                "success": True,
                "mode": "production",
                "processed_items": total_processed,
                "inserted_items": inserted_count,
                "duplicate_items": duplicate_count,
                "message": f"Successfully processed {total_processed} items. Inserted {inserted_count} new entries, skipped {duplicate_count} duplicates."
            }
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            
        except Exception as e:
            # Handle connection or generic errors
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_payload = {
                "success": False,
                "error": str(e),
                "message": "Internal error occurred while saving feed data to MongoDB Atlas."
            }
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))


if __name__ == '__main__':
    # Local testing runner
    safe_print("Testing RSS cron job locally...")
    class MockWfile:
        def write(self, data):
            safe_print("\nResponse payload from cron handler:")
            safe_print(data.decode('utf-8'))
            
    class MockHandler(handler):
        def __init__(self):
            self.wfile = MockWfile()
        def send_response(self, code):
            safe_print(f"Response Code: {code}")
        def send_header(self, keyword, value):
            safe_print(f"Header: {keyword}: {value}")
        def end_headers(self):
            pass

    test_handler = MockHandler()
    test_handler.do_GET()
