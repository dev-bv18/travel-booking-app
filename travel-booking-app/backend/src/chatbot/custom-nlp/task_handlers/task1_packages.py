from bson import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import os
import re
from dotenv import load_dotenv
from rapidfuzz import fuzz, process

load_dotenv()

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["test"]
collection = db["travelpackages"]

# Training examples and labels
examples = [
    "Show me all packages",
    "List travel packages",
    "Explore destinations",
    "Packages under 40000",
    "Cheap trips below 50000",
    "Expensive packages above 100000",
    "Show packages to Goa",
    "I want trips to Kerala",
    "Tell me the cost of Rajasthan package",
    "How many slots are available for Paris trip",
]

labels = [
    "show_all",
    "show_all",
    "show_all",
    "price_filter",
    "price_filter",
    "price_filter",
    "destination_search",
    "destination_search",
    "get_price",
    "check_availability",
]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(examples)

def predict_intent(user_message):
    input_vec = vectorizer.transform([user_message])
    sim = cosine_similarity(input_vec, X)
    best_match = sim.argmax()
    return labels[best_match]

def extract_price_limits(msg):
    numbers = list(map(int, re.findall(r'\d{4,6}', msg)))
    msg = msg.lower()

    if "between" in msg and len(numbers) == 2:
        return {"lower": min(numbers), "upper": max(numbers)}
    if any(k in msg for k in ["under", "below", "less than"]):
        return {"upper": numbers[0]} if numbers else None
    if any(k in msg for k in ["above", "over", "greater than", "more than"]):
        return {"lower": numbers[0]} if numbers else None
    if len(numbers) == 2:
        return {"lower": min(numbers), "upper": max(numbers)}
    elif len(numbers) == 1:
        return {"upper": numbers[0]}
    return None

def extract_destination(msg):
    destinations = collection.distinct("destination")
    match = process.extractOne(msg, destinations, scorer=fuzz.partial_ratio)
    if match and match[1] > 70:
        return match[0]
    return None

def handle(user_message):
    msg = user_message.lower()
    intent = predict_intent(user_message)

    if intent == "show_all":
        packages = list(collection.find({}, {"title": 1, "destination": 1, "price": 1}).limit(10))
        if not packages:
            return {"reply": "No travel packages found."}
        reply = "Here are some available travel packages:\n\n"
        for p in packages:
            reply += (
                f"• {p['title']}\n"
                f"  Destination: {p['destination']}\n"
                f"  Price: ₹{p['price']}\n\n"
            )
        return {"reply": reply.strip()}

    elif intent == "price_filter":
        price_limits = extract_price_limits(msg)

        if ("cheap" in msg or "low" in msg) and price_limits and "upper" in price_limits:
            packages = list(collection.find({"price": {"$lte": price_limits["upper"]}}, {"title": 1, "destination": 1, "price": 1}))
            reply = f"Here are some cheap packages under ₹{price_limits['upper']}:\n\n"

        elif "cheap" in msg or "low" in msg:
            packages = list(collection.find({"price": {"$lte": 50000}}, {"title": 1, "destination": 1, "price": 1}))
            reply = "Here are some budget-friendly packages (under ₹50,000):\n\n"

        elif "expensive" in msg or "luxury" in msg:
            packages = list(collection.find({}, {"title": 1, "destination": 1, "price": 1}))
            packages = sorted(packages, key=lambda x: x["price"], reverse=True)[:5]
            reply = "Here are some premium travel packages:\n\n"

        elif price_limits:
            query = {}
            if "lower" in price_limits and "upper" in price_limits:
                query["price"] = {"$gte": price_limits["lower"], "$lte": price_limits["upper"]}
            elif "lower" in price_limits:
                query["price"] = {"$gte": price_limits["lower"]}
            elif "upper" in price_limits:
                query["price"] = {"$lte": price_limits["upper"]}
            packages = list(collection.find(query))
            reply = "Packages matching your price filter:\n\n"

        else:
            return {"reply": "Please mention a valid price range (e.g., 'under 30000', 'between 20000 and 50000')"}

        if not packages:
            return {"reply": "No packages found in that price range."}

        for p in packages:
            reply += (
                f"• {p['title']}\n"
                f"  Destination: {p['destination']}\n"
                f"  Price: ₹{p['price']}\n\n"
            )
        return {"reply": reply.strip()}

    elif intent == "destination_search":
        destination = extract_destination(msg)
        if destination:
            packages = list(collection.find({"destination": {"$regex": destination, "$options": "i"}}))
            if not packages:
                return {"reply": f"No packages found for {destination}."}
            reply = f"Packages for {destination}:\n\n"
            for p in packages:
                reply += (
                    f"• {p['title']}\n"
                    f"  Price: ₹{p['price']}\n\n"
                )
            return {"reply": reply.strip()}
        else:
            return {"reply": "Please mention a valid destination (e.g., Goa, Kerala)."}

    elif intent == "get_price":
        all_packages = list(collection.find({}, {"title": 1, "price": 1}))
        for p in all_packages:
            if fuzz.partial_ratio(p["title"].lower(), msg) > 80:
                return {"reply": f"The price of '{p['title']}' is ₹{p['price']}."}
        return {"reply": "Please mention a valid package name to get the price."}

    elif intent == "check_availability":
        all_packages = list(collection.find({}, {"title": 1, "destination": 1, "availability": 1}))
        for p in all_packages:
            if fuzz.partial_ratio(p["title"].lower(), msg) > 80 or fuzz.partial_ratio(p["destination"].lower(), msg) > 80:
                if p.get("availability", 0) > 0:
                    return {"reply": f"{p['availability']} slots are available for '{p['title']}'."}
                else:
                    return {"reply": f"'{p['title']}' is currently fully booked."}
        return {"reply": "Couldn't find a package to check availability. Try mentioning the package name or destination."}

    else:
        return {"reply": "Sorry, I couldn't understand your travel package query. Please try again with keywords like 'price', 'destination', or 'availability'."}
