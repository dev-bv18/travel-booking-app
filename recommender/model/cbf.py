from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import re
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_text(text):
    """Clean and normalize text data"""
    if not text:
        return ""
    
    # Convert to lowercase and remove special characters
    text = re.sub(r'[^a-zA-Z\s]', ' ', str(text).lower())
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def extract_keywords(text, min_length=3, max_words=15):
    """Extract meaningful keywords from text"""
    if not text:
        return []
    
    # Common stop words to filter out
    stop_words = {
        'and', 'or', 'but', 'the', 'a', 'an', 'to', 'for', 'of', 'with', 
        'in', 'on', 'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were',
        'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'this', 'that', 'these', 'those'
    }
    
    words = clean_text(text).split()
    keywords = [word for word in words 
                if len(word) >= min_length and word not in stop_words]
    
    return keywords[:max_words]

def content_based_filtering(user_packages, all_packages):
    """
    Improved content-based filtering algorithm
    
    Parameters:
    - user_packages: List of packages the user has booked
    - all_packages: List of all available packages
    
    Returns:
    - list of recommended package IDs
    """
    logger.info("Starting improved content-based filtering")
    logger.info(f"User has booked {len(user_packages)} packages")
    logger.info(f"Total packages in system: {len(all_packages)}")
    
    if not user_packages or not all_packages:
        logger.warning("Insufficient data for content-based filtering")
        return []
    
    # Get IDs of packages user has already booked
    user_booked_ids = {pkg.get('id') for pkg in user_packages if pkg.get('id')}
    logger.info(f"User has booked package IDs: {user_booked_ids}")
    
    # Build user profile from booked packages
    user_profile_text = []
    user_destinations = set()
    user_price_range = []
    
    for pkg in user_packages:
        # Collect text features
        text_components = []
        
        if pkg.get('title'):
            text_components.append(pkg['title'])
        
        if pkg.get('description'):
            text_components.append(pkg['description'])
        
        if pkg.get('destination'):
            destination = clean_text(pkg['destination'])
            text_components.append(destination)
            # Extract destination components
            dest_parts = destination.split()
            user_destinations.update(dest_parts)
        
        if pkg.get('duration'):
            text_components.append(str(pkg['duration']))
        
        # Combine all text for this package
        package_text = ' '.join(text_components)
        user_profile_text.append(package_text)
        
        # Collect price information for price-based similarity
        if pkg.get('price'):
            try:
                price = float(pkg['price'])
                user_price_range.append(price)
            except (ValueError, TypeError):
                pass
    
    if not user_profile_text:
        logger.warning("No meaningful text features extracted from user packages")
        return []
    
    # Create user profile
    user_profile = ' '.join(user_profile_text)
    logger.info(f"Built user profile with {len(user_profile)} characters")
    
    # Calculate user's average price preference
    avg_user_price = np.mean(user_price_range) if user_price_range else None
    
    # Create corpus for all packages
    corpus = []
    package_metadata = []
    
    for pkg in all_packages:
        # Skip packages the user has already booked
        if pkg.get('id') in user_booked_ids:
            continue
            
        text_components = []
        
        if pkg.get('title'):
            text_components.append(pkg['title'])
        
        if pkg.get('description'):
            text_components.append(pkg['description'])
        
        if pkg.get('destination'):
            text_components.append(pkg['destination'])
        
        if pkg.get('duration'):
            text_components.append(str(pkg['duration']))
        
        package_text = ' '.join(text_components)
        corpus.append(package_text)
        
        # Store metadata for additional scoring
        package_metadata.append({
            'id': pkg.get('id'),
            'price': pkg.get('price'),
            'destination': clean_text(pkg.get('destination', '')),
            'availability': pkg.get('availability', True)
        })
    
    if not corpus:
        logger.warning("No packages available for recommendation")
        return []
    
    logger.info(f"Created corpus with {len(corpus)} packages")
    
    # Create TF-IDF vectors
    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,  # Reduced for better performance
            ngram_range=(1, 2),  # Include both unigrams and bigrams
            min_df=1,
            max_df=0.95,  # Ignore terms that appear in >95% of documents
            sublinear_tf=True  # Use sublinear tf scaling
        )
        
        # Fit on corpus and transform both user profile and corpus
        all_texts = [user_profile] + corpus
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        logger.info(f"Created TF-IDF matrix with shape: {tfidf_matrix.shape}")
        
        # User profile is the first vector, packages are the rest
        user_vector = tfidf_matrix[0:1]
        package_vectors = tfidf_matrix[1:]
        
        # Calculate cosine similarities
        similarities = cosine_similarity(user_vector, package_vectors).flatten()
        
        # Create recommendations with additional scoring
        recommendations = []
        
        for i, (similarity, metadata) in enumerate(zip(similarities, package_metadata)):
            if similarity <= 0:  # Skip packages with no similarity
                continue
            
            score = similarity
            
            # Boost score for destination similarity
            if user_destinations and metadata['destination']:
                dest_words = set(metadata['destination'].split())
                if dest_words.intersection(user_destinations):
                    score *= 1.2  # 20% boost for destination match
                    logger.debug(f"Destination boost applied to package {metadata['id']}")
            
            # Boost score for price similarity (if we have price data)
            if avg_user_price and metadata['price']:
                try:
                    pkg_price = float(metadata['price'])
                    price_diff_ratio = abs(pkg_price - avg_user_price) / avg_user_price
                    if price_diff_ratio <= 0.5:  # Within 50% of user's average
                        price_boost = 1.1 - (price_diff_ratio * 0.2)  # Up to 10% boost
                        score *= price_boost
                        logger.debug(f"Price boost {price_boost:.2f} applied to package {metadata['id']}")
                except (ValueError, TypeError):
                    pass
            
            # Penalize unavailable packages
            if not metadata.get('availability', True):
                score *= 0.7  # 30% penalty for unavailable packages
            
            recommendations.append({
                'id': metadata['id'],
                'score': score,
                'base_similarity': similarity
            })
        
        # Sort by score (highest first) and get top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        # Apply dynamic threshold
        if recommendations:
            max_score = recommendations[0]['score']
            # Dynamic threshold: at least 20% of max score, but minimum 0.05
            threshold = max(0.05, max_score * 0.2)
            
            # Filter by threshold and limit results
            filtered_recommendations = [
                rec for rec in recommendations 
                if rec['score'] >= threshold
            ][:10]  # Limit to top 10
            
            recommended_ids = [rec['id'] for rec in filtered_recommendations]
            
            logger.info(f"Generated {len(recommended_ids)} content-based recommendations")
            logger.info(f"Score range: {recommendations[0]['score']:.4f} to {recommendations[-1]['score']:.4f}")
            logger.info(f"Applied threshold: {threshold:.4f}")
            
            # Log top recommendations for debugging
            for i, rec in enumerate(filtered_recommendations[:5]):
                logger.info(f"Top {i+1}: ID={rec['id']}, Score={rec['score']:.4f}, Base={rec['base_similarity']:.4f}")
            
            return recommended_ids
        else:
            logger.info("No recommendations above threshold")
            return []
            
    except Exception as e:
        logger.error(f"Error in content-based filtering: {str(e)}")
        import traceback
        traceback.print_exc()
        return []