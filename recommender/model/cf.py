from collections import defaultdict
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def collaborative_filtering_full(user_id, user_bookings, all_users_bookings, package_user_matrix, all_packages):
    """
    Full implementation of collaborative filtering using all available data
    
    Parameters:
    - user_id: ID of the user to recommend packages for
    - user_bookings: List of booking objects for the current user
    - all_users_bookings: Dict mapping user_id -> list of their bookings
    - package_user_matrix: Dict mapping package_id -> list of user_ids who booked it
    - all_packages: List of all available packages
    
    Returns:
    - list of recommended package IDs
    """
    logger.info(f"=== STARTING FULL COLLABORATIVE FILTERING ===")
    logger.info(f"Target user: {user_id}")
    logger.info(f"Available users: {len(all_users_bookings)}")
    logger.info(f"Available packages: {len(all_packages)}")
    
    # Extract current user's booked packages
    user_package_ids = set()
    for booking in user_bookings:
        if booking.get('package') and booking['package'].get('id'):
            user_package_ids.add(booking['package']['id'])
    
    logger.info(f"User has booked {len(user_package_ids)} packages")
    
    if len(user_package_ids) == 0:
        logger.info("User has no booking history - using popularity-based recommendations")
        return popularity_based_recommendations(package_user_matrix, user_package_ids, all_packages)
    
    # Try different collaborative filtering approaches
    recommendations = []
    
    # Approach 1: User-based collaborative filtering using booking history
    if all_users_bookings and len(all_users_bookings) > 1:
        logger.info("Trying user-based collaborative filtering...")
        user_based_recs = user_based_collaborative_filtering(
            user_id, user_package_ids, all_users_bookings, all_packages
        )
        recommendations.extend(user_based_recs)
        logger.info(f"User-based CF generated {len(user_based_recs)} recommendations")
    
    # Approach 2: Item-based collaborative filtering using package-user matrix
    if package_user_matrix:
        logger.info("Trying item-based collaborative filtering...")
        item_based_recs = item_based_collaborative_filtering(
            user_id, user_package_ids, package_user_matrix, all_packages
        )
        recommendations.extend(item_based_recs)
        logger.info(f"Item-based CF generated {len(item_based_recs)} recommendations")
    
    # Approach 3: Matrix factorization approach (if we have enough data)
    if len(all_users_bookings) > 3 and len(all_packages) > 5:
        logger.info("Trying matrix factorization approach...")
        matrix_recs = matrix_factorization_cf(
            user_id, user_package_ids, all_users_bookings, all_packages
        )
        recommendations.extend(matrix_recs)
        logger.info(f"Matrix factorization generated {len(matrix_recs)} recommendations")
    else:
        logger.info("Matrix factorization generated 0 recommendations")
    
    # Remove duplicates and filter out already booked packages
    unique_recommendations = []
    seen = set()
    
    for pkg_id in recommendations:
        if pkg_id not in seen and pkg_id not in user_package_ids:
            unique_recommendations.append(pkg_id)
            seen.add(pkg_id)
    
    # If no recommendations, fall back to popularity
    if not unique_recommendations:
        logger.info("No CF recommendations found, using popularity fallback")
        unique_recommendations = popularity_based_recommendations(
            package_user_matrix, user_package_ids, all_packages
        )
    
    logger.info(f"Final CF recommendations: {len(unique_recommendations)}")
    return unique_recommendations[:10]  # Limit to top 10

def user_based_collaborative_filtering(user_id, user_package_ids, all_users_bookings, all_packages):
    """User-based collaborative filtering"""
    logger.info("Running user-based collaborative filtering")
    
    # Build user-package matrix
    all_package_ids = [pkg['id'] for pkg in all_packages]
    user_ids = list(all_users_bookings.keys())
    
    # Create binary matrix: users x packages
    user_package_matrix = {}
    
    for uid in user_ids:
        user_vector = set()
        bookings = all_users_bookings.get(uid, [])
        
        for booking in bookings:
            if booking.get('package') and booking['package'].get('id'):
                user_vector.add(booking['package']['id'])
        
        user_package_matrix[uid] = user_vector
    
    # Calculate user similarities using Jaccard similarity
    user_similarities = {}
    target_user_packages = user_package_matrix.get(user_id, set())
    
    if not target_user_packages:
        logger.info("Target user has no packages in matrix")
        return []
    
    similar_users_found = 0
    for other_user_id in user_ids:
        if other_user_id == user_id:
            continue
            
        other_user_packages = user_package_matrix.get(other_user_id, set())
        
        if not other_user_packages:
            continue
        
        # Jaccard similarity
        intersection = len(target_user_packages & other_user_packages)
        union = len(target_user_packages | other_user_packages)
        
        if union > 0:
            similarity = intersection / union
            if similarity > 0.05:  # Lower threshold for sparse data
                user_similarities[other_user_id] = similarity
                similar_users_found += 1
    
    logger.info(f"Found {similar_users_found} similar users")
    
    if not user_similarities:
        return []
    
    # Get recommendations from similar users
    package_scores = defaultdict(float)
    
    for other_user_id, similarity in user_similarities.items():
        other_user_packages = user_package_matrix.get(other_user_id, set())
        
        for pkg_id in other_user_packages:
            if pkg_id not in user_package_ids:  # Don't recommend already booked packages
                package_scores[pkg_id] += similarity
    
    # Sort by score and return top recommendations
    sorted_packages = sorted(package_scores.items(), key=lambda x: x[1], reverse=True)
    recommendations = [pkg_id for pkg_id, score in sorted_packages[:10]]
    
    logger.info(f"User-based CF: Top recommendations with scores: {sorted_packages[:3]}")
    return recommendations

def item_based_collaborative_filtering(user_id, user_package_ids, package_user_matrix, all_packages):
    """Item-based collaborative filtering using package-user relationships"""
    logger.info("Running item-based collaborative filtering")
    
    if not user_package_ids:
        return []
    
    # Find packages similar to what the user has booked
    similar_packages = defaultdict(float)
    
    for user_pkg_id in user_package_ids:
        users_who_booked_this = set(package_user_matrix.get(user_pkg_id, []))
        
        if len(users_who_booked_this) < 1:  # Need at least 1 user
            continue
        
        # Find other packages booked by these users
        for other_pkg_id, other_users in package_user_matrix.items():
            if other_pkg_id == user_pkg_id or other_pkg_id in user_package_ids:
                continue
            
            other_users_set = set(other_users)
            
            if len(other_users_set) < 1:
                continue
            
            # Calculate Jaccard similarity between packages based on users
            intersection = len(users_who_booked_this & other_users_set)
            union = len(users_who_booked_this | other_users_set)
            
            if union > 0 and intersection > 0:
                similarity = intersection / union
                similar_packages[other_pkg_id] += similarity
    
    # Sort by similarity score
    sorted_similar = sorted(similar_packages.items(), key=lambda x: x[1], reverse=True)
    recommendations = [pkg_id for pkg_id, score in sorted_similar[:10]]
    
    logger.info(f"Item-based CF: Top recommendations with scores: {sorted_similar[:3]}")
    return recommendations

def matrix_factorization_cf(user_id, user_package_ids, all_users_bookings, all_packages):
    """Matrix factorization approach using SVD-like decomposition"""
    logger.info("Running matrix factorization collaborative filtering")
    
    try:
        # Create user-item matrix
        all_package_ids = [pkg['id'] for pkg in all_packages]
        user_ids = list(all_users_bookings.keys())
        
        # Create mapping from IDs to indices
        user_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
        pkg_to_idx = {pid: idx for idx, pid in enumerate(all_package_ids)}
        
        # Build sparse matrix
        rows, cols, data = [], [], []
        
        for uid, bookings in all_users_bookings.items():
            if uid not in user_to_idx:
                continue
                
            user_idx = user_to_idx[uid]
            
            for booking in bookings:
                if booking.get('package') and booking['package'].get('id'):
                    pkg_id = booking['package']['id']
                    if pkg_id in pkg_to_idx:
                        pkg_idx = pkg_to_idx[pkg_id]
                        rows.append(user_idx)
                        cols.append(pkg_idx)
                        data.append(1.0)  # Binary rating (booked = 1)
        
        if not rows:
            logger.info("No data for matrix factorization")
            return []
        
        # Create sparse matrix
        matrix = csr_matrix((data, (rows, cols)), shape=(len(user_ids), len(all_package_ids)))
        
        # Convert to dense for cosine similarity (if not too large)
        if matrix.shape[0] < 500 and matrix.shape[1] < 500:
            dense_matrix = matrix.toarray()
            
            # Find target user index
            if user_id not in user_to_idx:
                logger.info("Target user not in matrix")
                return []
            
            target_user_idx = user_to_idx[user_id]
            target_user_vector = dense_matrix[target_user_idx].reshape(1, -1)
            
            # Calculate user similarities
            similarities = cosine_similarity(target_user_vector, dense_matrix)[0]
            
            # Find most similar users (excluding self)
            similar_user_indices = np.argsort(similarities)[::-1]
            similar_user_indices = [idx for idx in similar_user_indices 
                                  if idx != target_user_idx and similarities[idx] > 0.05][:10]
            
            # Get recommendations from similar users
            target_user_bookings = set(np.where(dense_matrix[target_user_idx] > 0)[0])
            recommendations = []
            
            for similar_user_idx in similar_user_indices:
                similar_user_bookings = set(np.where(dense_matrix[similar_user_idx] > 0)[0])
                
                # Recommend packages this similar user booked but target user hasn't
                for pkg_idx in similar_user_bookings:
                    if pkg_idx not in target_user_bookings:
                        pkg_id = all_package_ids[pkg_idx]
                        if pkg_id not in recommendations:
                            recommendations.append(pkg_id)
            
            logger.info(f"Matrix factorization found {len(similar_user_indices)} similar users")
            return recommendations[:10]
        
        else:
            logger.info("Matrix too large for dense operations")
            return []
            
    except Exception as e:
        logger.error(f"Matrix factorization failed: {str(e)}")
        return []

def popularity_based_recommendations(package_user_matrix, user_package_ids, all_packages):
    """Fallback: popularity-based recommendations"""
    logger.info("Using popularity-based recommendations")
    
    # Count how many users booked each package
    package_popularity = {}
    for pkg_id, users in package_user_matrix.items():
        if pkg_id not in user_package_ids:  # Don't recommend already booked
            package_popularity[pkg_id] = len(users)
    
    # Sort by popularity
    sorted_by_popularity = sorted(package_popularity.items(), key=lambda x: x[1], reverse=True)
    recommendations = [pkg_id for pkg_id, count in sorted_by_popularity[:10]]
    
    logger.info(f"Popularity-based recommendations: {len(recommendations)}")
    return recommendations