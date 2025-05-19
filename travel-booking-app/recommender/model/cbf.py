from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def content_based_filtering(user_packages, all_packages):
    if not user_packages:
        return []

    # Creating a set of user preferred keywords based on titles and destinations
    user_titles = {pkg['title'].lower() for pkg in user_packages if 'title' in pkg and pkg['title']}
    user_destinations = {pkg['destination'].lower() for pkg in user_packages if 'destination' in pkg and pkg['destination']}

    # Combine both title and destination preferences
    preferred_keywords = list(user_titles | user_destinations)

    # If there are no preferred keywords, return an empty list
    if not preferred_keywords:
        return []

    # Create a corpus including reviews for semantic enhancement
    corpus = [
        f"{pkg.get('title', '')} {pkg.get('description', '')} {pkg.get('destination', '')} {pkg.get('review', '')}"
        for pkg in all_packages
    ]

    # Initialize TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Repeat keywords to add weight (basic query boosting)
    query = ' '.join(preferred_keywords * 3)
    query_vec = vectorizer.transform([query])

    # Compute cosine similarity
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

    threshold = 0.1
    recommended_indices = similarities.argsort()[::-1]

    recommended_ids = set()
    user_booked_ids = {p['id'] for p in user_packages}

    for idx in recommended_indices:
        if similarities[idx] < threshold:
            break
        pkg_id = all_packages[idx]['id']
        if pkg_id not in user_booked_ids:
            recommended_ids.add(pkg_id)

    return list(recommended_ids)
