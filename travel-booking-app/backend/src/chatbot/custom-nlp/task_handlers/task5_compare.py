from pymongo import MongoClient
import os
import re
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["test"]
collection = db["travelpackages"]

def extract_destinations(message):
    """Try to extract two destinations from the user's message."""
    words = re.split(r' and | vs | versus | between ', message.lower())
    if len(words) >= 2:
        return words[0].strip(), words[1].strip()
    return None, None

def handle(user_message):
    dest1, dest2 = extract_destinations(user_message)
    
    if not dest1 or not dest2:
        return {"reply": "⚡ Please specify two destinations or packages to compare (e.g., 'Compare Goa and Kerala')."}
    
    # Search for matching travel packages
    pkg1 = collection.find_one({"destination": {"$regex": dest1, "$options": "i"}})
    pkg2 = collection.find_one({"destination": {"$regex": dest2, "$options": "i"}})

    if not pkg1 or not pkg2:
        return {"reply": f"❌ Could not find travel packages for both '{dest1}' and '{dest2}'. Please check the destination names."}

    # Build comparison reply
    reply = f"""
🔍 Here's a quick comparison:

🌍 {pkg1['destination']}:
- Title: {pkg1['title']}
- Price: ₹{pkg1['price']}
- Duration: {pkg1['duration']}
- Available Slots: {pkg1['availability']}

🌍 {pkg2['destination']}:
- Title: {pkg2['title']}
- Price: ₹{pkg2['price']}
- Duration: {pkg2['duration']}
- Available Slots: {pkg2['availability']}

✨ Hope this helps you choose better!
    """.strip()

    return {"reply": reply}
