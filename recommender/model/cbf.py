from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def content_based_filtering(user_packages, all_packages):
    """
    Content-based filtering algorithm adapted to work with your existing GraphQL schema
    
    Parameters:
    - user_packages: List of packages the user has booked
    - all_packages: List of all available packages
    
    Returns:
    - list of recommended package IDs
    """
    logger.info(f"Starting content-based filtering")
    logger.info(f"User has booked {len(user_packages)} packages")
    logger.info(f"Total packages in system: {len(all_packages)}")
    
    if not user_packages:
        logger.info("No user packages found, cannot generate recommendations")
        return []
    
    # Get IDs of packages user has already booked
    user_booked_ids = set()
    for pkg in user_packages:
        if 'id' in pkg:
            user_booked_ids.add(pkg['id'])
    
    logger.info(f"User has booked these package IDs: {user_booked_ids}")
    
    # Create a more comprehensive feature set from user's packages
    user_features = set()
    
    for pkg in user_packages:
        # Add title words
        if 'title' in pkg and pkg['title']:
            title_words = pkg['title'].lower().split()
            user_features.update(title_words)
        
        # Add destination
        if 'destination' in pkg and pkg['destination']:
            destination_parts = pkg['destination'].lower().split(',')
            for part in destination_parts:
                user_features.update(part.strip().split())
        
        # Add key words from description
        if 'description' in pkg and pkg['description']:
            desc_words = pkg['description'].lower().split()
            # Filter out common words
            significant_words = [w for w in desc_words if len(w) > 4]
            user_features.update(significant_words[:10])  # Take up to 10 significant words
    
    logger.info(f"Extracted {len(user_features)} features from user's packages")
    
    if not user_features:
        logger.info("No meaningful features extracted, cannot generate recommendations")
        return []
    
    # Create a corpus including all available text data
    corpus = []
    for pkg in all_packages:
        text_features = [
            pkg.get('title', ''),
            pkg.get('description', ''),
            pkg.get('destination', ''),
            pkg.get('duration', ''),
        ]
        corpus.append(' '.join(filter(None, text_features)))
    
    # Initialize TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=5000,
        ngram_range=(1, 2),  # Include bigrams
        min_df=1  # Term must appear in at least 1 document
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        logger.info(f"Created TF-IDF matrix with shape: {tfidf_matrix.shape}")
        
        # Create query from user features
        query = ' '.join(user_features)
        query_vec = vectorizer.transform([query])
        
        # Compute cosine similarity
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        
        # Use a lower threshold
        threshold = 0.05  # Lower threshold means more recommendations
        
        recommended_indices = similarities.argsort()[::-1]
        
        recommended_ids = []
        
        for idx in recommended_indices:
            if similarities[idx] < threshold:
                logger.info(f"Stopping at similarity {similarities[idx]:.4f} (below threshold {threshold})")
                break
                
            pkg_id = all_packages[idx]['id']
            if pkg_id not in user_booked_ids and pkg_id not in recommended_ids:
                recommended_ids.append(pkg_id)
                logger.info(f"Added recommendation: {pkg_id} with similarity {similarities[idx]:.4f}")
                
            # Limit to top 10 recommendations
            if len(recommended_ids) >= 10:
                break
        
        logger.info(f"Generated {len(recommended_ids)} content-based recommendations")
        return recommended_ids
        
    except Exception as e:
        logger.error(f"Error in content-based filtering: {str(e)}")
        import traceback
        traceback.print_exc()
        return []