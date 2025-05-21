from collections import defaultdict

# Define keywords per theme
THEME_KEYWORDS = {
    "beach": ["beach", "island", "coast", "goa", "andaman", "kerala cruise", "bali"],
    "romantic": ["romantic", "love", "couples", "honeymoon", "paris", "greece"],
    "cultural": ["cultural", "heritage", "temples", "tradition", "varanasi", "rajasthan", "odisha"],
    "adventure": ["adventure", "safari", "trek", "desert", "leh", "ladakh", "kashmir", "dubai"],
    "luxury": ["luxury", "resort", "premium", "exclusive", "switzerland", "europe"],
    "nature": ["nature", "green", "wildlife", "rainforest", "amazon", "kerala", "mountains", "swiss"]
}

def filter_top_packages_by_theme(theme, packages, top_n=5):
    keywords = THEME_KEYWORDS[theme]
    package_dict = {}

    for pkg in packages:
        title = pkg.get("title", "").lower()
        desc = pkg.get("description", "").lower()
        rating = pkg.get("rating", 0)
        pid = pkg.get("id")

        if not pid or rating < 3:
            continue

        if any(kw in title or kw in desc for kw in keywords):
            if pid not in package_dict:
                package_dict[pid] = {"pkg": pkg, "ratings": [rating]}
            else:
                package_dict[pid]["ratings"].append(rating)

    # Compute average ratings
    for entry in package_dict.values():
        entry["pkg"]["rating"] = round(sum(entry["ratings"]) / len(entry["ratings"]), 1)

    unique_packages = [entry["pkg"] for entry in package_dict.values()]
    unique_packages.sort(key=lambda x: x["rating"], reverse=True)

    # Return at least one package if available
    return unique_packages[:top_n] if unique_packages else []

def get_top_5_beach(packages):
    return filter_top_packages_by_theme("beach", packages)

def get_top_5_romantic(packages):
    return filter_top_packages_by_theme("romantic", packages)

def get_top_5_cultural(packages):
    return filter_top_packages_by_theme("cultural", packages)

def get_top_5_adventure(packages):
    return filter_top_packages_by_theme("adventure", packages)

def get_top_5_luxury(packages):
    return filter_top_packages_by_theme("luxury", packages)

def get_top_5_nature(packages):
    return filter_top_packages_by_theme("nature", packages)