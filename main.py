from flask import Flask, render_template, request, session
import folium
import random
import csv
import requests
import geopy.distance

app = Flask(__name__)
app.secret_key = "secret"


def get_random_landmark():
    with open("landmarks.csv", "r", encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        landmarks = list(reader)

        landmark = random.choice(landmarks)
        landmark_name = landmark[0].strip("'")

        endpoint = "https://nominatim.openstreetmap.org/search"
        params = {"q": landmark_name, "format": "json", "limit": 1}

        response = requests.get(endpoint, params=params)
        data = response.json()

        if data:
            landmark_lat = float(data[0]["lat"])
            landmark_lon = float(data[0]["lon"])
            return landmark_name, landmark_lat, landmark_lon

    return None, None


def calculate_distance(lat1, lon1, lat2, lon2):
    coords_1 = (lat1, lon1)
    coords_2 = (lat2, lon2)
    distance = geopy.distance.distance(coords_1, coords_2).km
    return distance


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        guess_lat = float(request.form["latitude"])
        guess_lon = float(request.form["longitude"])
        landmark_lat = float(request.form["landmark_lat"])
        landmark_lon = float(request.form["landmark_lon"])

        distance = calculate_distance(guess_lat, guess_lon, landmark_lat, landmark_lon)
        score = max(0, 10 - distance)

        return render_template("index.html", landmark_name=landmark_name, score=score)

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
