from flask import Flask, render_template, request, session
import folium
import random
import csv
import requests
from math import radians, sin, cos, sqrt, atan2

app = Flask(__name__)
app.secret_key = "your_secret_key"


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Get user's guess coordinates
        lat = float(request.form["lat"])
        lon = float(request.form["lon"])
        user_coords = (lat, lon)

        # Get the actual landmark coordinates
        actual_coords = session["coords"]

        # Calculate the distance between the user's guess and the actual landmark
        distance = calculate_distance(user_coords, actual_coords)

        # Create the map with the user's guess marker
        map = create_map()
        folium.Marker(location=user_coords, popup="Your guess").add_to(map)

        return render_template(
            "result.html",
            guess=user_coords,
            landmark=session["landmark"],
            distance=distance,
            map=map._repr_html_(),
        )

    else:
        # Get a random landmark
        landmark, coords = get_random_landmark()
        session["landmark"] = landmark
        session["coords"] = coords

        # Create the empty map
        map = create_map()
        map = map._repr_html_()

        return render_template("index.html", map=map)


def get_random_landmark():
    with open("landmarks.csv", "r") as file:
        reader = csv.reader(file)
        landmarks = list(reader)
        if len(landmarks) <= 1:
            return (
                None,
                None,
            )  # Handle the case when there are no landmarks (excluding the header row)
        random_landmark = random.choice(landmarks[1:])[0]
        random_coords = get_coordinates(random_landmark)
    return random_landmark, random_coords


def create_map():
    map = folium.Map(location=[0, 0], zoom_start=2)
    return map


def calculate_distance(coords1, coords2):
    lat1, lon1 = coords1
    lat2, lon2 = coords2

    # Radius of the Earth in kilometers
    R = 6371.0

    # Convert coordinates to radians
    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    # Calculate the differences between the coordinates
    dlon = lon2 - lon1
    dlat = lat2 - lat1

    # Apply the Haversine formula
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Calculate the distance in kilometers
    distance = R * c

    return distance


def get_coordinates(landmark):
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={landmark}&addressdetails=1&limit=1"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data:
            latitude = float(data[0].get("lat", ""))
            longitude = float(data[0].get("lon", ""))
            return (latitude, longitude)

    return None


@app.route("/result")
def result():
    return render_template("result.html")


if __name__ == "__main__":
    app.run(debug=True)
