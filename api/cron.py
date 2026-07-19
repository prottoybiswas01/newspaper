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
                    
                    description = entry.get('summary') or entry.get('description') or ''
                    # Clean description if it's too long
                    if len(description) > 1000:
                        description = description[:997] + '...'
                    
                    doc = {
                        "title": entry.get('title', 'No Title'),
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
