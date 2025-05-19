import re

def handle(user_message):
    return {
        "reply": "📝 We'd love to hear your feedback! Please provide a rating (1-5 stars) or share your thoughts."
    }

def capture_rating(user_message):
    rating_match = re.search(r'\b([1-5])\b', user_message)
    if rating_match:
        stars = rating_match.group(1)
        return {
            "reply": f"🌟 Thank you for rating us {stars} star(s)! Your feedback helps us improve! ✨"
        }
    else:
        return {
            "reply": "⚡ Please provide a valid rating between 1 and 5 stars."
        }
