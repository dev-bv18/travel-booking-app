from collections import Counter
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def popularity_based_recommendations(user_id, bookings, max_recommendations=5):
    """
    Generate recommendations based on package popularity as a fallback
    
    Parameters:
    - user_id: ID of the user to recommend packages for
    - bookings: List of booking objects
    - max_recommendations: Maximum number of recommendations to return
    
    Returns:
    - list of popular package IDs the user hasn't booked yet
    """
    logger.info(f"Starting popularity-based recommendations for user_id: {user_id}")
    
    # Get user's already booked packages
    user_booked_ids = set()
    for booking in bookings:
        if booking['user']['id'] == user_id and 'package' in booking and 'id' in booking['package']:
            user_booked_ids.add(booking['package']['id'])
    
    logger.info(f"User {user_id} has already booked {len(user_booked_ids)} packages")
    
    # Count package booking frequency
    package_counter = Counter()
    for booking in bookings:
        if 'package' in booking and 'id' in booking['package']:
            package_counter[booking['package']['id']] += 1
    
    logger.info(f"Found {len(package_counter)} unique packages in the system")
    
    # Get most popular packages
    popular_packages = []
    for pkg_id, count in package_counter.most_common():
        if pkg_id not in user_booked_ids and pkg_id not in popular_packages:
            popular_packages.append(pkg_id)
            logger.info(f"Added popular package: {pkg_id} with {count} bookings")
            
            if len(popular_packages) >= max_recommendations:
                break
    
    logger.info(f"Generated {len(popular_packages)} popularity-based recommendations")
    return popular_packages