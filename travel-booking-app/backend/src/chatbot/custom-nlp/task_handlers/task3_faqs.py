import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Sample FAQs
FAQ_DATA = {
    "payment": "You can make secure payments using debit/credit cards, net banking, or UPI methods.",
    "discounts": "We regularly offer exciting discounts! Check the 'Offers' section for the latest deals.",
    "login": "If you're facing issues logging in, try resetting your password. If the problem persists, contact support.",
    "register": "To register, click on 'Sign Up' at the top-right corner and fill in your details.",
    "support": "Our support team is available 24/7. You can reach out to us via the 'Contact Us' page.",
    "contact": "You can contact our customer care through email (support@tripify.com) or call our helpline number."
}

# Examples for training
examples = [
    "How do I make payment?",
    "Is my payment secure?",
    "Are there any discounts available?",
    "Tell me about offers.",
    "I cannot login.",
    "Login not working",
    "How do I sign up?",
    "I want to create an account",
    "How can I contact support?",
    "Customer care help"
]

labels = [
    "payment",
    "payment",
    "discounts",
    "discounts",
    "login",
    "login",
    "register",
    "register",
    "support",
    "contact"
]

# Vectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(examples)

def predict_intent(message):
    input_vec = vectorizer.transform([message])
    sim = cosine_similarity(input_vec, X)
    best_match = sim.argmax()
    return labels[best_match]

def handle(user_message):
    intent = predict_intent(user_message.lower())
    answer = FAQ_DATA.get(intent, "I'm sorry, I don't have an answer to that right now.")
    
    # Beautiful styling for chatbot
    styled_answer = f"🌟 **FAQ Response:**\n{answer}\n\n_If you need more assistance, please contact our support team._"
    return {"reply": styled_answer}
