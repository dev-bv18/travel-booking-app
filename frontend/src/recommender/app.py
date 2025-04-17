from flask import Flask, request, jsonify
from flask_cors import CORS
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from model.cf import collaborative_filtering
from model.cbf import content_based_filtering

app = Flask(__name__)
CORS(app, resources={
    r"/recommend": {
        "origins": "*",
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/recommend', methods=['POST'])
def recommend():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({'success': True}), 200

    # Check content type
    content_type = request.headers.get('Content-Type')
    if content_type not in ['application/json', 'application/json; charset=utf-8']:
        return jsonify({
            "success": False,
            "error": f"Unsupported Media Type: {content_type}. Content-Type must be application/json."
        }), 415

    try:
        data = request.get_json()
        print(f"Request Data: {data}")  # Debug: log request data
    except Exception as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400

    user_id = data.get('user_id')
    auth_token = data.get('auth_token')

    if not user_id or not auth_token:
        return jsonify({
            'success': False,
            'error': 'Missing user_id or auth_token'
        }), 400

    # Setup GraphQL client
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
        print(f"Executing GraphQL query for user_id: {user_id}")  # Debug: log GraphQL query execution
        result = client.execute(query, variable_values={"userId": user_id})
        print(f"GraphQL Response: {result}")  # Debug: log GraphQL response

        # Debug: Check the type of the 'getBookingHistory' part of the response
        if isinstance(result, dict):
            print("Response is a dictionary")
            bookings = result["getBookingHistory"]
        else:
            print("Response is not a dictionary")
            return jsonify({'error': 'Unexpected GraphQL response format.'}), 500

        # Log and check if bookings is a list
        if isinstance(bookings, list):
            print(f"Booking History (List): {bookings}")
        else:
            print(f"Booking History is not a list, it is: {type(bookings)}")
            return jsonify({'error': 'Booking history is not in the expected list format.'}), 500

        if not bookings:
            return jsonify({'error': 'No booking history found for the given user.'}), 404

        # Run recommendation algorithms
        print("Running Collaborative Filtering...")  # Debug: log CF algorithm start
        cf_recs = collaborative_filtering(user_id, bookings)
        print(f"Collaborative Filtering Recommendations: {cf_recs}")  # Debug: log CF results

        print("Running Content-Based Filtering...")  # Debug: log CBF algorithm start
        cbf_recs = content_based_filtering(user_id, bookings)
        print(f"Content-Based Filtering Recommendations: {cbf_recs}")  # Debug: log CBF results

        # Combine recommendations
        combined_ids = list(set(cf_recs + cbf_recs))
        print(f"Combined Recommendations: {combined_ids}")  # Debug: log combined recommendations

        package_map = {b['package']['id']: b['package'] for b in bookings}
        recommendations = [package_map[pid] for pid in combined_ids if pid in package_map]

        return jsonify({
            "success": True,
            "user_id": user_id,
            "recommendations": recommendations[:4]  # Sending the list of recommended packages
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")  # Debug: log the error
        return jsonify({
            "success": False,
            "error": f"Internal Server Error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
