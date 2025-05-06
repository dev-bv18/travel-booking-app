import os
import requests
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz

load_dotenv()

GRAPHQL_URL = os.getenv("GRAPHQL_ENDPOINT", "http://localhost:5000/graphql")

# Training examples
examples = [
    "Show my bookings",
    "What packages have I booked?",
    "Booking confirmation status",
    "Is my booking confirmed?",
    "Check if booking is pending",
    "Has my booking been cancelled?",
    "Tell me my rating and review",
    "What did I rate my trip?",
    "Show my feedback for the package",
]

labels = [
    "show_bookings",
    "show_bookings",
    "booking_status",
    "booking_status",
    "booking_pending",
    "booking_cancelled",
    "show_rating",
    "show_rating",
    "show_rating",
]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(examples)

def predict_intent(message):
    input_vec = vectorizer.transform([message])
    sim = cosine_similarity(input_vec, X)
    best_match = sim.argmax()
    return labels[best_match]

def fetch_user_bookings(user_id):
    query = """
    query GetBookingHistory($userId: ID!) {
      getBookingHistory(userId: $userId) {
        id
        date
        status
        rating
        review
        package {
          title
          destination
          price
        }
      }
    }
    """
    variables = {"userId": user_id}
    try:
        response = requests.post(GRAPHQL_URL, json={"query": query, "variables": variables})
        result = response.json()
        return result.get("data", {}).get("getBookingHistory", [])
    except Exception as e:
        return []

def handle(user_message, user_id):
    msg = user_message.lower()
    intent = predict_intent(user_message)

    if not user_id:
        return {"reply": "User ID is missing. Please log in again."}

    bookings = fetch_user_bookings(user_id)
    if not bookings:
        return {"reply": "You have no bookings at the moment."}

    # Respond to intent
    if intent == "show_bookings":
        reply = "📋 Your recent bookings:\n"
        for b in bookings:
            reply += f"- {b['package']['title']} | {b['package']['destination']} | ₹{b['package']['price']} | Status: {b['status']} | Date: {b['date']}\n"
        return {"reply": reply.strip()}

    elif intent == "booking_status":
        confirmed = [b for b in bookings if b["status"].lower() == "confirmed"]
        if confirmed:
            reply = "✅ Confirmed bookings:\n"
            for b in confirmed:
                reply += f"- {b['package']['title']} on {b['date']}\n"
        else:
            reply = "You don't have any confirmed bookings."
        return {"reply": reply.strip()}

    elif intent == "booking_pending":
        pending = [b for b in bookings if b["status"].lower() == "pending"]
        if pending:
            reply = "⏳ Pending bookings:\n"
            for b in pending:
                reply += f"- {b['package']['title']} on {b['date']}\n"
        else:
            reply = "You have no pending bookings."
        return {"reply": reply.strip()}

    elif intent == "booking_cancelled":
        cancelled = [b for b in bookings if b["status"].lower() == "cancelled"]
        if cancelled:
            reply = "❌ Cancelled bookings:\n"
            for b in cancelled:
                reply += f"- {b['package']['title']} on {b['date']}\n"
        else:
            reply = "You have no cancelled bookings."
        return {"reply": reply.strip()}

    elif intent == "show_rating":
        rated = [b for b in bookings if b.get("rating") is not None]
        if rated:
            reply = "⭐ Your reviews and ratings:\n"
            for b in rated:
                reply += f"- {b['package']['title']} ({b['rating']}⭐): \"{b['review']}\"\n"
        else:
            reply = "You haven't rated any trips yet."
        return {"reply": reply.strip()}

    else:
        return {"reply": "Sorry, I couldn’t understand your booking-related query. Try asking about booking status, pending trips, or your reviews."}
