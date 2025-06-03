import logging

logger = logging.getLogger(__name__)

def handle(user_message, user_id=None):
    """
    Handle cancellation and refund requests
    """
    msg = user_message.lower()
    logger.info(f"Handling cancellation request from user {user_id}: '{msg}'")
    
    if any(word in msg for word in ["cancel", "cancellation", "stop"]):
        return {
            "reply": (
                "🛑 **Booking Cancellation**\n\n"
                "To cancel your booking, you have several options:\n\n"
                "1. **Online**: Visit 'My Bookings' in your account dashboard\n"
                "2. **Support**: Contact our team at support@tripify.com\n"
                "3. **Phone**: Call our helpline for immediate assistance\n\n"
                "📋 **Important Notes:**\n"
                "• Cancellations are subject to our cancellation policy\n"
                "• Refund processing time depends on your booking date\n"
                "• Early cancellations may qualify for full refunds\n\n"
                "Would you like me to help you with anything else regarding your cancellation?"
            )
        }
    elif any(word in msg for word in ["refund", "money back", "return"]):
        return {
            "reply": (
                "💸 **Refund Information**\n\n"
                "Here's what you need to know about refunds:\n\n"
                "🕒 **Processing Time**: 5-7 business days after cancellation approval\n"
                "💳 **Method**: Refunded to your original payment method\n"
                "📧 **Updates**: Check your registered email for refund status\n\n"
                "📋 **Refund Policy:**\n"
                "• Full refund: Cancellation 7+ days before trip\n"
                "• Partial refund: Cancellation 3-7 days before trip\n"
                "• No refund: Cancellation within 48 hours of trip\n\n"
                "For specific queries about your refund, please contact support@tripify.com"
            )
        }
    else:
        return {
            "reply": (
                "⚠️ **Cancellation & Refund Help**\n\n"
                "I can help you with:\n\n"
                "• **Booking Cancellation**: Cancel your upcoming trips\n"
                "• **Refund Status**: Check refund processing status\n"
                "• **Policy Information**: Learn about our cancellation terms\n\n"
                "Please specify if you want to:\n"
                "- Cancel a booking\n"
                "- Check refund status\n"
                "- Learn about our policies\n\n"
                "How can I assist you today?"
            )
        }
