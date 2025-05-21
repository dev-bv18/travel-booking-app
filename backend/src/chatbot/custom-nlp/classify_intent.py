import re
import logging
from task_handlers import task1_packages
from task_handlers import task2_bookings
from task_handlers import task3_faqs
from task_handlers import task4_feedback
from task_handlers import task5_compare
from task_handlers import task6_recommend
from task_handlers import task7_cancel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO)

# Define keywords for each task
TASK_KEYWORDS = {
    "task1": ["package", "travel", "trip", "destination", "itinerary", "cost", "price", "duration", "slot", "availability", "explore", "see packages", "tour"],
    "task2": ["my booking", "booking status", "confirmed", "pending", "cancelled", "cancel booking", "refunded", "confirmation", "package booked", "when did i book"],
    "task3": ["payment", "discount", "login", "logout", "help", "support", "contact", "customer care", "offers", "complaint", "register", "account", "email", "sign up"],
    "task4": ["rate", "review", "feedback", "comment", "opinion"],
    "task5": ["compare", "difference", "better", "vs", "versus"],
    "task6": ["recommend", "suggest", "best", "ideal", "suitable"],
    "task7": ["cancel", "refund", "money back", "revoke", "stop trip", "stop booking"],
    "task8": ["admin", "analytics", "stats", "dashboard", "report", "summary"]
}

# Map tasks to their handlers
TASK_HANDLERS = {
    "task1": task1_packages.handle,
    "task2": task2_bookings.handle,
    "task3": task3_faqs.handle,
    "task4": task4_feedback.handle,
    "task5": task5_compare.handle,
    "task6": task6_recommend.handle,
    "task7": task7_cancel.handle,
    # "task8": task8_admin.handle
}

# Precompute TF-IDF vectors for task keywords
vectorizer = TfidfVectorizer().fit([" ".join(TASK_KEYWORDS[task]) for task in TASK_KEYWORDS])
task_vectors = vectorizer.transform([" ".join(TASK_KEYWORDS[task]) for task in TASK_KEYWORDS])

# Session context to handle multi-step conversations like rating
session_context = {}

def classify_intent(user_message, user_id="default"):
    global session_context
    msg = user_message.lower()
    user_vector = vectorizer.transform([msg])

    # Handle context if expecting rating
    if session_context.get(user_id) == "awaiting_rating":
        logging.info("Expecting a rating from user...")
        session_context.pop(user_id, None)
        return task4_feedback.capture_rating(user_message)  # Extend with user_id if needed

    # Compute cosine similarity
    similarities = cosine_similarity(user_vector, task_vectors).flatten()
    best_match_index = similarities.argmax()

    logging.info(f"User message: {msg}")
    logging.info(f"Similarity scores: {similarities}")

    if similarities[best_match_index] > 0.1:
        best_task = list(TASK_KEYWORDS.keys())[best_match_index]
        logging.info(f"Selected task: {best_task}")

        try:
            # Set rating context
            if best_task == "task4":
                session_context[user_id] = "awaiting_rating"
            else:
                session_context.pop(user_id, None)

            # ➕ Pass user_id to handlers that need it
            if best_task in ["task2", "task4", "task6", "task7"]:
                return TASK_HANDLERS[best_task](msg, user_id=user_id)
            else:
                return TASK_HANDLERS[best_task](msg)

        except KeyError:
            logging.error(f"No handler found for {best_task}.")
            return {"reply": "Sorry, I cannot process your request at the moment."}
        except Exception as e:
            logging.error(f"Error in handler for {best_task}: {e}")
            return {"reply": "An error occurred while processing your request. Please try again later."}
    else:
        return {"reply": "I'm sorry, I didn't understand that. Could you please rephrase your question?"}