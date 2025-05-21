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

    # Get booking history
    booking_history_query = gql("""
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

    # Get all available packages
    all_packages_query = gql("""
    query {
        getPackages {
            id
            title
            description
            price
            duration
            destination
            availability
        }
    }
    """)

    try:
        print(f"Executing booking history query for user_id: {user_id}")
        booking_result = client.execute(booking_history_query, variable_values={"userId": user_id})
        
        print(f"Executing packages query")
        packages_result = client.execute(all_packages_query)

        # Extract booking history
        if "getBookingHistory" in booking_result:
            bookings = booking_result["getBookingHistory"]
            print(f"Found {len(bookings)} bookings in history")
        else:
            print("No booking history found in response")
            bookings = []
        
        # Extract all packages
        if "getPackages" in packages_result:
            all_packages = packages_result["getPackages"]
            print(f"Found {len(all_packages)} total packages")
        else:
            print("No packages found in response")
            all_packages = []

        # Prepare data structures for recommendation algorithms
        # Add a default rating value for bookings
        for booking in bookings:
            booking['rating'] = 5  # Assume all bookings are highly rated

        # Run recommendation algorithms
        print("Running Collaborative Filtering...")
        cf_recs = collaborative_filtering(user_id, bookings)
        print(f"Collaborative Filtering Recommendations: {cf_recs}")

        # For content-based filtering, we need user's booked packages and all packages
        user_packages = []
        user_booked_ids = set()
        
        for booking in bookings:
            if booking['user']['id'] == user_id and 'package' in booking:
                pkg = booking['package']
                if 'id' in pkg:
                    user_packages.append(pkg)
                    user_booked_ids.add(pkg['id'])
        
        print("Running Content-Based Filtering...")
        cbf_recs = content_based_filtering(user_packages, all_packages)
        print(f"Content-Based Filtering Recommendations: {cbf_recs}")

        # Combine recommendations
        combined_ids = list(set(cf_recs + cbf_recs))
        print(f"Combined Recommendations: {combined_ids}")

        # If no recommendations were generated, use popularity-based fallback
        if not combined_ids:
            print("No recommendations generated, using popularity fallback")
            # Create a simple popularity ranking based on which packages appear most in bookings
            package_frequency = {}
            for booking in bookings:
                pkg_id = booking['package']['id']
                package_frequency[pkg_id] = package_frequency.get(pkg_id, 0) + 1
            
            # Get popular packages not booked by the user
            popular_packages = []
            for pkg_id, _ in sorted(package_frequency.items(), key=lambda x: x[1], reverse=True):
                if pkg_id not in user_booked_ids:
                    popular_packages.append(pkg_id)
            
            combined_ids = popular_packages
            print(f"Fallback Recommendations: {combined_ids}")
            
            # If still no recommendations, just take any packages the user hasn't booked
            if not combined_ids:
                print("No popular packages found, using any available package")
                for pkg in all_packages:
                    if pkg['id'] not in user_booked_ids:
                        combined_ids.append(pkg['id'])
                        if len(combined_ids) >= 4:
                            break

        # Create a dictionary mapping package IDs to package objects
        package_map = {pkg["id"]: pkg for pkg in all_packages}
        
        # Get full package details for recommendations
        recommendations = []
        for pkg_id in combined_ids:
            if pkg_id in package_map:
                recommendations.append(package_map[pkg_id])
        
        # Limit to 4 recommendations
        recommendations = recommendations[:4]
        
        print(f"Final recommendations: {[pkg.get('title', 'Unknown') for pkg in recommendations]}")

        return jsonify({
            "success": True,
            "user_id": user_id,
            "recommendations": recommendations
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Internal Server Error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
