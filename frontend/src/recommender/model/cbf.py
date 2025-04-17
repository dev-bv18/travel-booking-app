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

    # Create a corpus of text combining title, description, and destination for each package
    corpus = [
        f"{pkg.get('title', '')} {pkg.get('description', '')} {pkg.get('destination', '')}" 
        for pkg in all_packages
    ]

    # Initialize TF-IDF Vectorizer to compute the term frequency-inverse document frequency matrix
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Combine the user's preferred keywords into a query string
    query = ' '.join(preferred_keywords)
    query_vec = vectorizer.transform([query])

    # Compute cosine similarities between the query and all available packages
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

    # Define a threshold to filter out weakly similar packages
    threshold = 0.1

    # Sort the indices of the packages based on the similarity scores
    recommended_indices = similarities.argsort()[::-1]

    # Create a set of recommended package IDs (no duplicates)
    recommended_ids = set()

    for idx in recommended_indices:
        # If the similarity score is below the threshold, stop
        if similarities[idx] < threshold:
            break
        pkg_id = all_packages[idx]['id']

        # Add package ID to recommendations if it’s not in the user's already booked packages
        if pkg_id not in {p['id'] for p in user_packages}:
            recommended_ids.add(pkg_id)

    # Return the list of recommended package IDs (as a list)
    return list(recommended_ids)

