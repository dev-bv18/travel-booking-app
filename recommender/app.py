from flask import Flask, request, jsonify
from flask_cors import CORS
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from model.cf import collaborative_filtering_full
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

    try:
        print("=== FETCHING ALL DATA FOR COLLABORATIVE FILTERING ===")
        
        # 1. Get all users with their booking counts
        all_users_query = gql("""
        query {
            getUsersWithBookingCounts {
                id
                username
                email
                bookingCount
            }
        }
        """)
        
        print("Fetching all users...")
        users_result = client.execute(all_users_query)
        all_users = users_result.get("getUsersWithBookingCounts", [])
        print(f"Found {len(all_users)} users in system")

        # 2. Get all available packages
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
        
        print("Fetching all packages...")
        packages_result = client.execute(all_packages_query)
        all_packages = packages_result.get("getPackages", [])
        print(f"Found {len(all_packages)} packages in system")

        # 3. Get current user's booking history
        user_booking_query = gql("""
        query ($userId: ID!) {
            getBookingHistory(userId: $userId) {
                id
                user {
                    id
                    username
                    email
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
        
        print(f"Fetching booking history for user {user_id}...")
        user_bookings_result = client.execute(user_booking_query, variable_values={"userId": user_id})
        user_bookings = user_bookings_result.get("getBookingHistory", [])
        print(f"Found {len(user_bookings)} bookings for user")

        # 4. Build comprehensive booking data for all users
        print("Building comprehensive user-package matrix...")
        all_users_bookings = {}
        
        # Add current user's bookings
        all_users_bookings[user_id] = user_bookings
        
        # 5. CORRECTED: Build package-user matrix using getUsersByPackage
        print("Building package-user relationships...")
        package_user_matrix = {}
        
        # For each package, get users who booked it using the correct query
        for package in all_packages:
            package_id = package['id']
            try:
                # Use the correct GraphQL query that exists in your schema
                package_users_query = gql("""
                query ($packageId: ID!) {
                    getUsersByPackage(packageId: $packageId) {
                        id
                        username
                        email
                    }
                }
                """)
                
                users_for_package_result = client.execute(package_users_query, 
                                                        variable_values={"packageId": package_id})
                users_for_package = users_for_package_result.get("getUsersByPackage", [])
                
                # Extract user IDs who booked this package
                user_ids_for_package = [user['id'] for user in users_for_package if user.get('id')]
                
                package_user_matrix[package_id] = user_ids_for_package
                print(f"Package {package.get('title', package_id)}: {len(user_ids_for_package)} users")
                
            except Exception as e:
                print(f"Could not fetch users for package {package_id}: {str(e)}")
                package_user_matrix[package_id] = []

        # 6. Build more comprehensive user-package data from package-user matrix
        print("Building user-package relationships from package data...")
        
        # Reconstruct user bookings from package-user relationships
        for package_id, user_ids in package_user_matrix.items():
            package_obj = next((pkg for pkg in all_packages if pkg['id'] == package_id), None)
            
            if not package_obj:
                continue
                
            for uid in user_ids:
                if uid not in all_users_bookings:
                    all_users_bookings[uid] = []
                
                # Create a mock booking object for collaborative filtering
                # Check if this booking already exists
                existing_booking = any(
                    booking.get('package', {}).get('id') == package_id 
                    for booking in all_users_bookings[uid]
                )
                
                if not existing_booking:
                    mock_booking = {
                        'id': f"mock_{uid}_{package_id}",
                        'package': package_obj,
                        'user': {'id': uid},
                        'status': 'completed'  # Assume completed for CF purposes
                    }
                    all_users_bookings[uid].append(mock_booking)

        print(f"Built comprehensive booking data for {len(all_users_bookings)} users")
        
        # 7. Run Collaborative Filtering
        print("\n=== RUNNING COLLABORATIVE FILTERING ===")
        try:
            cf_recommendations = collaborative_filtering_full(
                user_id=user_id,
                user_bookings=user_bookings,
                all_users_bookings=all_users_bookings,
                package_user_matrix=package_user_matrix,
                all_packages=all_packages
            )
            print(f"Collaborative Filtering generated {len(cf_recommendations)} recommendations")
        except Exception as e:
            print(f"Collaborative filtering failed: {str(e)}")
            import traceback
            traceback.print_exc()
            cf_recommendations = []

        # 8. Run Content-Based Filtering
        print("\n=== RUNNING CONTENT-BASED FILTERING ===")
        try:
            # Extract user's packages for CBF
            user_packages = []
            for booking in user_bookings:
                if booking.get('package'):
                    user_packages.append(booking['package'])
            
            cbf_recommendations = content_based_filtering(user_packages, all_packages)
            print(f"Content-Based Filtering generated {len(cbf_recommendations)} recommendations")
        except Exception as e:
            print(f"Content-based filtering failed: {str(e)}")
            import traceback
            traceback.print_exc()
            cbf_recommendations = []

        # 9. Combine recommendations
        print("\n=== COMBINING RECOMMENDATIONS ===")
        
        # Combine and deduplicate
        combined_ids = list(set(cf_recommendations + cbf_recommendations))
        print(f"Combined unique recommendations: {len(combined_ids)}")

        # Get user's already booked package IDs
        user_booked_ids = set()
        for booking in user_bookings:
            if booking.get('package') and booking['package'].get('id'):
                user_booked_ids.add(booking['package']['id'])

        # Filter out already booked packages
        filtered_recommendations = [pkg_id for pkg_id in combined_ids if pkg_id not in user_booked_ids]
        print(f"After filtering out booked packages: {len(filtered_recommendations)}")

        # 10. Fallback if no recommendations
        if not filtered_recommendations:
            print("No recommendations generated, using popularity fallback...")
            
            # Use packages with most bookings as fallback
            package_popularity = {}
            for pkg_id, users in package_user_matrix.items():
                package_popularity[pkg_id] = len(users)
            
            # Sort by popularity and exclude user's booked packages
            popular_packages = sorted(package_popularity.items(), key=lambda x: x[1], reverse=True)
            for pkg_id, popularity in popular_packages:
                if pkg_id not in user_booked_ids:
                    filtered_recommendations.append(pkg_id)
                    if len(filtered_recommendations) >= 4:
                        break
            
            print(f"Popularity fallback generated {len(filtered_recommendations)} recommendations")

        # 11. Get full package details
        package_map = {pkg["id"]: pkg for pkg in all_packages}
        final_recommendations = []
        
        for pkg_id in filtered_recommendations[:6]:  # Limit to 6
            if pkg_id in package_map:
                final_recommendations.append(package_map[pkg_id])

        print(f"\n=== FINAL RESULTS ===")
        print(f"Returning {len(final_recommendations)} recommendations:")
        for pkg in final_recommendations:
            print(f"  - {pkg.get('title', 'Unknown')} (ID: {pkg.get('id')})")

        return jsonify({
            "success": True,
            "user_id": user_id,
            "recommendations": final_recommendations,
            "debug_info": {
                "total_users": len(all_users),
                "total_packages": len(all_packages),
                "user_bookings_count": len(user_bookings),
                "cf_recommendations": len(cf_recommendations),
                "cbf_recommendations": len(cbf_recommendations),
                "combined_before_filter": len(combined_ids),
                "final_count": len(final_recommendations)
            }
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Check if it's an authentication/authorization error
        error_msg = str(e).lower()
        if 'signed in' in error_msg or 'authorized' in error_msg or 'authentication' in error_msg:
            return jsonify({
                "success": False,
                "error": "Authentication/Authorization error. Please check your auth token."
            }), 401
        
        return jsonify({
            "success": False,
            "error": f"Internal Server Error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)