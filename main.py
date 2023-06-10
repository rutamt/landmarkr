from flask import Flask, render_template, request, session
import random
import csv
import requests
from math import radians, sin, cos, sqrt, atan2
import html

app = Flask(__name__)
app.secret_key = "secret"


def get_random_landmark():
    with open("landmarks.csv", "r", encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        landmarks = list(reader)

        landmark = random.choice(landmarks)
        landmark_name = landmark[0].strip("'")
        landmark_name = html.unescape(landmark_name)
        endpoint = "https://nominatim.openstreetmap.org/search"
        params = {"q": landmark_name, "format": "json", "limit": 1}

        response = requests.get(endpoint, params=params)
        data = response.json()

        if data:
            landmark_lat = float(data[0]["lat"])
            landmark_lon = float(data[0]["lon"])
            return landmark_name, landmark_lat, landmark_lon

    return None, None, None


def calculate_score(guess_lat, guess_lon, real_lat, real_lon):
    # Convert coordinates to radians
    guess_lat_rad = radians(guess_lat)
    guess_lon_rad = radians(guess_lon)
    real_lat_rad = radians(real_lat)
    real_lon_rad = radians(real_lon)

    # Haversine formula
    dlon = real_lon_rad - guess_lon_rad
    dlat = real_lat_rad - guess_lat_rad
    a = sin(dlat / 2) ** 2 + cos(guess_lat_rad) * cos(real_lat_rad) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = 6371 * c  # Earth's radius in km

    # Calculate the score
    max_distance = 20000  # Maximum possible distance between two points
    score = round(1000 * (1 - distance / max_distance))
    return max(score, 0)  # Ensure the score is not negative


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        guess_lat = float(request.form["latitude"])
        guess_lon = float(request.form["longitude"])
        landmark_lat = float(request.form["landmark_lat"])
        landmark_lon = float(request.form["landmark_lon"])
        print(
            f"g_lat: {guess_lat}, g_long: {guess_lon}, landmark lat: {landmark_lat}, landmark long: {landmark_lon}"
        )
        score = calculate_score(guess_lat, guess_lon, landmark_lat, landmark_lon)
        print(score)
        return render_template("index.html", score=score)

    else:
        landmark_name, landmark_lat, landmark_lon = get_random_landmark()
        return render_template(
            "index.html",
            landmark_name=landmark_name,
            landmark_lat=landmark_lat,
            landmark_lon=landmark_lon,
        )


if __name__ == "__main__":
    app.run(debug=True)
