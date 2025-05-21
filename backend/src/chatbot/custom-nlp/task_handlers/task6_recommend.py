from pymongo import MongoClient
import os
import re
from dotenv import load_dotenv
import random

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["test"]
collection = db["travelpackages"]

def handle(user_message):
    msg = user_message.lower()

    if "budget" in msg or "cheap" in msg or "affordable" in msg:
        packages = list(collection.find({"price": {"$lt": 50000}}))
        title = "💸 Budget-Friendly Packages:"
    elif "luxury" in msg or "expensive" in msg or "premium" in msg:
        packages = list(collection.find({"price": {"$gt": 100000}}))
        title = "💎 Luxury Packages:"
    else:
        packages = list(collection.find())
        packages = random.sample(packages, min(len(packages), 5))  # Pick random 5 packages
        title = "✨ Recommended Trips for You:"

    if not packages:
        return {"reply": "❌ Sorry, no packages match your request currently."}

    reply = f"{title}\n"
    for p in packages:
        reply += f"• {p['title']} ({p['destination']}) – ₹{p['price']}\n"

    return {"reply": reply.strip()}