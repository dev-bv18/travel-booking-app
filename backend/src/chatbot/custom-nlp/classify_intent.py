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
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enhanced keywords for better intent classification
TASK_KEYWORDS = {
    "task1": [
        "package", "packages", "travel", "trip", "trips", "destination", "destinations", 
        "itinerary", "cost", "price", "prices", "duration", "slot", "slots", 
        "availability", "available", "explore", "see packages", "tour", "tours",
        "show me", "list", "view", "browse", "find", "search", "cheap", "expensive",
        "budget", "luxury", "under", "above", "between", "goa", "kerala", "rajasthan",
        "delhi", "mumbai", "bangalore", "chennai", "kolkata"
    ],
    "task2": [
        "my booking", "my bookings", "booking status", "booking history", "confirmed", 
        "pending", "cancelled", "cancel booking", "refunded", "confirmation", 
        "package booked", "when did i book", "book history", "reservation", 
        "reservations", "my trips", "my orders", "order status", "booking details"
    ],
    "task3": [
        "payment", "pay", "discount", "discounts", "login", "logout", "log in", 
        "log out", "help", "support", "contact", "customer care", "offers", 
        "complaint", "register", "registration", "account", "email", "sign up", 
        "signup", "faq", "frequently asked", "how to", "what is", "explain"
    ],
    "task4": [
        "rate", "rating", "review", "reviews", "feedback", "comment", "comments", 
        "opinion", "star", "stars", "rating system", "give feedback", "submit review"
    ],
    "task5": [
        "compare", "comparison", "difference", "differences", "better", "vs", 
        "versus", "which is better", "compare packages", "difference between"
    ],
    "task6": [
        "recommend", "recommendation", "suggest", "suggestion", "best", "ideal", 
        "suitable", "what should", "which package", "advise", "good for"
    ],
    "task7": [
        "cancel", "cancellation", "refund", "refunds", "money back", "revoke", 
        "stop trip", "stop booking", "cancel my", "want to cancel", "how to cancel"
    ]
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
}

# Initialize vectorizer with better parameters
try:
    task_descriptions = [" ".join(TASK_KEYWORDS[task]) for task in TASK_KEYWORDS]
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),  # Include bigrams for better context
        max_features=1000,
        stop_words='english'
    )
    vectorizer.fit(task_descriptions)
    task_vectors = vectorizer.transform(task_descriptions)
    logger.info("TF-IDF vectorizer initialized successfully")
except Exception as e:
    logger.error(f"Error initializing vectorizer: {e}")
    vectorizer = None
    task_vectors = None

# Session context for multi-step conversations
session_context = {}

def classify_intent(user_message, user_id="default"):
    """
    Classify user intent and route to appropriate handler
    """
    global session_context
    
    if not user_message:
        return {"reply": "I didn't receive any message. Could you please try again?"}
    
    msg = user_message.lower().strip()
    logger.info(f"Classifying intent for user {user_id}: '{msg}'")
    
    # Handle context-aware conversations (e.g., awaiting rating)
    if session_context.get(user_id) == "awaiting_rating":
        logger.info(f"User {user_id} is providing a rating")
        session_context.pop(user_id, None)  # Clear context
        return task4_feedback.capture_rating(user_message)
    
    # Fallback if vectorizer failed to initialize
    if vectorizer is None or task_vectors is None:
        return handle_fallback_classification(msg, user_id)
    
    try:
        # Transform user message to vector
        user_vector = vectorizer.transform([msg])
        
        # Compute cosine similarity with all task vectors
        similarities = cosine_similarity(user_vector, task_vectors).flatten()
        best_match_index = np.argmax(similarities)
        best_similarity = similarities[best_match_index]
        
        logger.info(f"Similarity scores: {dict(zip(TASK_KEYWORDS.keys(), similarities))}")
        logger.info(f"Best match: task{best_match_index + 1} with similarity {best_similarity}")
        
        # Use a threshold to determine if we have a confident match
        if best_similarity > 0.15:  # Adjusted threshold
            best_task = list(TASK_KEYWORDS.keys())[best_match_index]
            return route_to_handler(best_task, msg, user_id)
        else:
            # Try rule-based fallback for very low similarity
            fallback_task = rule_based_classification(msg)
            if fallback_task:
                return route_to_handler(fallback_task, msg, user_id)
            else:
                return get_default_response(msg)
                
    except Exception as e:
        logger.error(f"Error in intent classification: {e}")
        return {"reply": "I'm having trouble understanding your request. Could you please rephrase it?"}

def rule_based_classification(msg):
    """
    Fallback rule-based classification for edge cases
    """
    # Check for obvious patterns
    if any(word in msg for word in ["package", "trip", "travel", "destination"]):
        return "task1"
    elif any(word in msg for word in ["my booking", "booking status", "confirmed"]):
        return "task2"
    elif any(word in msg for word in ["help", "support", "payment", "login"]):
        return "task3"
    elif any(word in msg for word in ["rate", "review", "feedback", "star"]):
        return "task4"
    elif any(word in msg for word in ["compare", "vs", "versus", "difference"]):
        return "task5"
    elif any(word in msg for word in ["recommend", "suggest", "best"]):
        return "task6"
    elif any(word in msg for word in ["cancel", "refund"]):
        return "task7"
    
    return None

def route_to_handler(task, msg, user_id):
    """
    Route to appropriate task handler
    """
    try:
        logger.info(f"Routing to {task} handler")
        
        # Set context for feedback tasks
        if task == "task4":
            session_context[user_id] = "awaiting_rating"
        else:
            # Clear any existing context
            session_context.pop(user_id, None)
        
        # Call appropriate handler
        if task in TASK_HANDLERS:
            # Some handlers need user_id, others don't
            if task in ["task2", "task4", "task6", "task7"]:
                return TASK_HANDLERS[task](msg, user_id=user_id)
            else:
                return TASK_HANDLERS[task](msg)
        else:
            logger.error(f"No handler found for {task}")
            return {"reply": "Sorry, I cannot process your request at the moment."}
            
    except Exception as e:
        logger.error(f"Error in handler for {task}: {e}")
        return {"reply": "An error occurred while processing your request. Please try again later."}

def handle_fallback_classification(msg, user_id):
    """
    Handle classification when vectorizer is not available
    """
    logger.warning("Using fallback classification method")
    
    fallback_task = rule_based_classification(msg)
    if fallback_task:
        return route_to_handler(fallback_task, msg, user_id)
    else:
        return get_default_response(msg)

def get_default_response(msg):
    """
    Generate helpful default response with suggestions
    """
    suggestions = [
        "• Ask about travel packages: 'Show me packages to Goa'",
        "• Check your bookings: 'Show my booking status'", 
        "• Get help: 'How do I make payment?'",
        "• Compare destinations: 'Compare Goa and Kerala'",
        "• Get recommendations: 'Recommend budget packages'",
        "• Leave feedback: 'I want to rate my trip'"
    ]
    
    response = (
        "I'm sorry, I didn't understand that. Here are some things you can ask me:\n\n" + 
        "\n".join(suggestions) + 
        "\n\nPlease try rephrasing your question or use one of the examples above."
    )
    
    return {"reply": response}
