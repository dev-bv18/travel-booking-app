from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from flask import Flask, request, jsonify
from flask_cors import CORS
from model.cf import collaborative_filtering
from model.cbf import content_based_filtering
from model import themes  # Make sure themes.py is properly created
import json
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# === Load dummy training data ===
with open("enhanced_cf_data.json", "r") as f:
    dummy_bookings = json.load(f)

dummy_bookings_dict = defaultdict(list)
for b in dummy_bookings:
    dummy_bookings_dict[b['user']['id']].append(b)

# === Helper function to extract all packages ===
def get_all_packages():
    return [b['package'] for b in dummy_bookings if b.get('package')]

# === Main User-Based Personalized Recommendation ===
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    user_id = data.get('user_id')
    auth_token = data.get('auth_token')

    if not user_id or not auth_token:
        return jsonify({'success': False, 'error': 'Missing user_id or auth_token'}), 400

    transport = RequestsHTTPTransport(
        url='http://localhost:4000/api',
        headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        },
        verify=True,
        retries=3,
    )

    client = Client(transport=transport, fetch_schema_from_transport=True)

    query = gql("""
    query ($userId: ID!) {
        getBookingHistory(userId: $userId) {
            id
            user {
                id
                username
            }
            package {
                id
                title
                description
                price
                duration
                destination
                availability
            }
            date
            status
        }
    }
    """)

    try:
        result = client.execute(query, variable_values={"userId": user_id})
        real_bookings = result["getBookingHistory"]

        all_bookings = real_bookings + dummy_bookings
        all_packages = [b['package'] for b in all_bookings if b.get('package')]
        package_map = {pkg['id']: pkg for pkg in all_packages}

        # If user has NO bookings yet
        if not real_bookings:
            rating_data = defaultdict(list)
            for b in all_bookings:
                if b.get('rating') and b['rating'] >= 3:
                    rating_data[b['package']['id']].append(b['rating'])

            avg_ratings = [(pkg_id, sum(r)/len(r)) for pkg_id, r in rating_data.items() if len(r) > 1 and sum(r)/len(r) >= 4]
            sorted_rated = sorted(avg_ratings, key=lambda x: x[1], reverse=True)
            recommendations = [package_map[pid] for pid, _ in sorted_rated[:4] if pid in package_map]

            return jsonify({
                "success": True,
                "user_id": user_id,
                "recommendations": recommendations
            }), 200

        # If user has bookings
        user_packages = [b['package'] for b in real_bookings if b.get('package')]
        booked_ids = {p['id'] for p in user_packages}

        # Collaborative + Content-Based
        cf_recs = collaborative_filtering(user_id, all_bookings)
        cbf_recs = content_based_filtering(user_packages, all_packages)

        intersection = list(set(cf_recs) & set(cbf_recs))
        combined_ids = intersection + list(set(cf_recs + cbf_recs) - booked_ids - set(intersection))

        recommendations = [package_map[pid] for pid in combined_ids if pid in package_map and pid not in booked_ids]

        return jsonify({
            "success": True,
            "user_id": user_id,
            "recommendations": recommendations[:4]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# === Theme Based Pretrained Recommendations ===
@app.route('/recommend-themes', methods=['GET'])
def recommend_themes():
    try:
        all_packages = get_all_packages()

        top_themes = {
            "beach": themes.get_top_5_beach(all_packages),
            "romantic": themes.get_top_5_romantic(all_packages),
            "cultural": themes.get_top_5_cultural(all_packages),
            "adventure": themes.get_top_5_adventure(all_packages),
            "luxury": themes.get_top_5_luxury(all_packages),
            "nature": themes.get_top_5_nature(all_packages),
        }

        return jsonify({
            "success": True,
            "themes": top_themes
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
