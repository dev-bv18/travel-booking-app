from collections import defaultdict

def collaborative_filtering(user_id, all_users_bookings):
    # Ensure all_users_bookings is in the correct format: a dictionary with user_ids as keys
    if isinstance(all_users_bookings, list):
        # If it's a list, convert it to a dictionary where user_id is the key
        all_users_bookings_dict = defaultdict(list)
        for booking in all_users_bookings:
            all_users_bookings_dict[booking['user']['id']].append(booking)
        all_users_bookings = all_users_bookings_dict

    # Print the data to check its structure
    print("All Users' Bookings Data:", all_users_bookings)

    # Get the set of packages booked by the target user
    user_bookings = set()
    if user_id in all_users_bookings:
        for booking in all_users_bookings[user_id]:
            user_bookings.add(booking['package']['id'])

    print("User Bookings for User ID", user_id, ":", user_bookings)
    
    # Build a mapping from package IDs to users who booked them
    package_user_map = defaultdict(set)
    for uid, bookings in all_users_bookings.items():
        for booking in bookings:
            package_user_map[booking['package']['id']].add(uid)

    print("Package to User Map:", dict(package_user_map))

    # Calculate user similarity based on shared bookings
    user_similarity = defaultdict(int)
    for pkg_id in user_bookings:
        for other_user in package_user_map[pkg_id]:
            if other_user != user_id:  # Avoid comparing the user to themselves
                user_similarity[other_user] += 1

    print("User Similarity Scores:", dict(user_similarity))

    # Gather recommended packages based on similar users' preferences
    recommended_packages = set()
    for other_user, sim_score in sorted(user_similarity.items(), key=lambda x: x[1], reverse=True):
        for booking in all_users_bookings[other_user]:
            pkg_id = booking['package']['id']
            if pkg_id not in user_bookings:  # Only recommend packages that the user hasn't booked yet
                recommended_packages.add(pkg_id)

    print("Recommended Packages (after filtering):", recommended_packages)

    # Return the recommended package IDs as a list
    return list(recommended_packages)
