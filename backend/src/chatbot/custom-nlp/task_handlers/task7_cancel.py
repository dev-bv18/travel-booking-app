def handle(user_message):
    msg = user_message.lower()

    if "cancel" in msg:
        return {
            "reply": "🛑 To cancel your booking, please visit 'My Bookings' section in your account or contact our support team at support@tripify.com. Cancellations are subject to our policy."
        }
    elif "refund" in msg or "money back" in msg:
        return {
            "reply": "💸 Refunds are processed within 5-7 business days after successful cancellation. Please check your registered email for refund updates or reach out to our support."
        }
    else:
        return {
            "reply": "⚠️ Could you please clarify if you want to cancel or request a refund? I'm here to assist you!"
        }