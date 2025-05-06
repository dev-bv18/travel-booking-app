from collections import defaultdict

def collaborative_filtering(user_id, all_users_bookings):
    # Convert list to dict if needed
    if isinstance(all_users_bookings, list):
        all_users_bookings_dict = defaultdict(list)
        for booking in all_users_bookings:
            all_users_bookings_dict[booking['user']['id']].append(booking)
        all_users_bookings = all_users_bookings_dict

    # Get the target user's booked package IDs
    user_bookings = set()
    if user_id in all_users_bookings:
        for booking in all_users_bookings[user_id]:
            user_bookings.add(booking['package']['id'])

    # Build map of package → set of users who booked it
    package_user_map = defaultdict(set)
    for uid, bookings in all_users_bookings.items():
        for booking in bookings:
            package_user_map[booking['package']['id']].add(uid)

    # Calculate similarity score weighted by rating
    user_similarity = defaultdict(int)
    for pkg_id in user_bookings:
        for other_user in package_user_map[pkg_id]:
            if other_user != user_id:
                for booking in all_users_bookings[other_user]:
                    if booking['package']['id'] == pkg_id:
                        user_similarity[other_user] += booking.get('rating', 3)

    # Recommend unbooked packages from similar users (rating ≥ 4)
    recommended_packages = set()
    for other_user, _ in sorted(user_similarity.items(), key=lambda x: x[1], reverse=True):
        for booking in all_users_bookings[other_user]:
            pkg_id = booking['package']['id']
            if pkg_id not in user_bookings and booking.get('rating', 3) >= 4:
                recommended_packages.add(pkg_id)

    return list(recommended_packages)
