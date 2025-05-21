from flask import Flask, request, jsonify
from classify_intent import classify_intent
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/custom-nlp', methods=['POST'])
def nlp_handler():
    try:
        user_input = request.json.get("message", "")
        user_id = request.json.get("userId", None)  # <-- Accept userId

        if not user_input:
            return jsonify({"error": "No input message provided"}), 400

        # 🔁 Pass both message and user_id
        response = classify_intent(user_input, user_id=user_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5006)