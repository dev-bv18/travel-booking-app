from flask import Flask, request, jsonify
from classify_intent import classify_intent
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/custom-nlp', methods=['POST'])
def nlp_handler():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        user_input = data.get("message", "").strip()
        user_id = data.get("userId", "default")

        if not user_input:
            return jsonify({"error": "No input message provided"}), 400

        logger.info(f"Processing message: '{user_input}' for user: {user_id}")
        
        # Pass both message and user_id to classifier
        response = classify_intent(user_input, user_id=user_id)
        
        # Ensure response has the expected format
        if not isinstance(response, dict) or 'reply' not in response:
            response = {"reply": "Sorry, I encountered an error processing your request."}
            
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in nlp_handler: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "custom-nlp"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5006, host='0.0.0.0')
