import re
import logging

logger = logging.getLogger(__name__)

def handle(user_message, user_id=None):
    """
    Handle feedback/rating requests
    """
    logger.info(f"Handling feedback request from user {user_id}")
    
    # Check if message already contains a rating
    rating_match = re.search(r'\b([1-5])\b', user_message)
    if rating_match:
        return capture_rating(user_message)
    
    return {
        "reply": (
            "📝 I'd love to hear your feedback! \n\n"
            "You can:\n"
            "• Rate your experience (1-5 stars): Just type a number like '4' or '5 stars'\n"
            "• Share detailed feedback: Tell me about your trip experience\n"
            "• Leave a review: Describe what you liked or didn't like\n\n"
            "How would you rate your overall experience?"
        )
    }

def capture_rating(user_message):
    """
    Capture and process user rating
    """
    msg = user_message.lower()
    
    # Look for star ratings (1-5)
    rating_match = re.search(r'\b([1-5])\b', user_message)
    
    if rating_match:
        stars = int(rating_match.group(1))
        
        # Generate response based on rating
        if stars >= 4:
            emoji = "🌟✨"
            response = f"Wonderful! Thank you for the {stars}-star rating! {emoji}"
        elif stars == 3:
            emoji = "👍"
            response = f"Thanks for the {stars}-star rating! {emoji} We appreciate your feedback."
        else:
            emoji = "😔"
            response = f"Thank you for the {stars}-star rating. {emoji} We're sorry your experience wasn't perfect."
        
        return {
            "reply": (
                f"{response}\n\n"
                "Your feedback helps us improve our services. "
                "Is there anything specific you'd like to tell us about your experience?"
            )
        }
    else:
        # Handle text feedback without explicit rating
        positive_words = ["good", "great", "excellent", "amazing", "wonderful", "love", "perfect"]
        negative_words = ["bad", "terrible", "awful", "disappointing", "poor", "hate", "worst"]
        
        has_positive = any(word in msg for word in positive_words)
        has_negative = any(word in msg for word in negative_words)
        
        if has_positive and not has_negative:
            response = "😊 Thank you for the positive feedback! We're thrilled you enjoyed your experience!"
        elif has_negative and not has_positive:
            response = "😔 Thank you for your feedback. We're sorry to hear about your experience and will work to improve."
        else:
            response = "📝 Thank you for sharing your feedback with us!"
        
        return {
            "reply": (
                f"{response}\n\n"
                "If you'd like to give a star rating (1-5), please let me know. "
                "Your feedback is valuable to us!"
            )
        }
