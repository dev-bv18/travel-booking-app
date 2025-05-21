from collections import defaultdict
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def collaborative_filtering(user_id, bookings):
    """
    Collaborative filtering algorithm adapted to work with your existing GraphQL schema
    
    Parameters:
    - user_id: ID of the user to recommend packages for
    - bookings: List of booking objects from getBookingHistory
    
    Returns:
    - list of recommended package IDs
    """
    logger.info(f"Starting collaborative filtering for user_id: {user_id}")
    logger.info(f"Total bookings in dataset: {len(bookings)}")
    
    # Convert list to dict mapping user IDs to their bookings
    all_users_bookings = defaultdict(list)
    for booking in bookings:
        if 'user' in booking and 'id' in booking['user']:
            all_users_bookings[booking['user']['id']].append(booking)
    
    logger.info(f"Number of unique users with bookings: {len(all_users_bookings)}")
    
    # Get the target user's booked package IDs
    user_bookings = set()
    if user_id in all_users_bookings:
        for booking in all_users_bookings[user_id]:
            if 'package' in booking and 'id' in booking['package']:
                user_bookings.add(booking['package']['id'])
    
    logger.info(f"User {user_id} has booked {len(user_bookings)} packages")
    
    if not user_bookings:
        logger.info(f"No booking history found for user {user_id}, cannot generate CF recommendations")
        return []
    
    # Build map of package → set of users who booked it
    package_user_map = defaultdict(set)
    for uid, user_bookings_list in all_users_bookings.items():
        for booking in user_bookings_list:
            if 'package' in booking and 'id' in booking['package']:
                package_user_map[booking['package']['id']].add(uid)
    
    # Calculate similarity score - without relying on rating
    user_similarity = defaultdict(int)
    for pkg_id in user_bookings:
        similar_users = package_user_map[pkg_id]
        logger.info(f"Package {pkg_id} has been booked by {len(similar_users)} users")
        
        for other_user in similar_users:
            if other_user != user_id:
                # Give a basic similarity score of 1 for each shared package
                user_similarity[other_user] += 1
    
    logger.info(f"Found {len(user_similarity)} similar users")
    
    # Recommend unbooked packages from similar users
    recommended_packages = set()
    for other_user, _ in sorted(user_similarity.items(), key=lambda x: x[1], reverse=True):
        for booking in all_users_bookings[other_user]:
            if 'package' in booking and 'id' in booking['package']:
                pkg_id = booking['package']['id']
                if pkg_id not in user_bookings and pkg_id not in recommended_packages:
                    recommended_packages.add(pkg_id)
                    logger.info(f"Added recommendation: {pkg_id} from similar user {other_user}")
    
    logger.info(f"Generated {len(recommended_packages)} collaborative filtering recommendations")
    return list(recommended_packages)