from flask import Flask, render_template, request, session
import folium
import random
from geopy.distance import geodesic
import csv
import requests

app = Flask(__name__)
app.secret_key = "secret"


def get_random_landmark():
    with open("landmarks.csv", "r") as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        landmarks = list(reader)

        landmark = random.choice(landmarks)
        landmark_name = landmark[0]

        endpoint = "https://nominatim.openstreetmap.org/search"
        params = {"q": landmark_name, "format": "json", "limit": 1}

        response = requests.get(endpoint, params=params)
        data = response.json()

        if data:
            landmark_lat = float(data[0]["lat"])
            landmark_lon = float(data[0]["lon"])
            coords = (landmark_lat, landmark_lon)
            return landmark_name, coords

    return None, None


def calculate_distance(coords1, coords2):
    return round(geodesic(coords1, coords2).kilometers, 2)


def create_map():
    return folium.Map(location=[0, 0], zoom_start=2)


# @app.route("/", methods=["GET", "POST"])
# def index():
#     if request.method == "POST":
#         # Get user's guess coordinates
#         lat = float(request.form["lat"])
#         lon = float(request.form["lon"])
#         user_coords = (lat, lon)

#         # Get the actual landmark coordinates
#         actual_coords = session["coords"]

#         # Calculate the distance between the user's guess and the actual landmark
#         distance = calculate_distance(user_coords, actual_coords)

#         # Create the map with the user's guess marker
#         map = create_map()
#         folium.Marker(location=user_coords, popup="Your guess").add_to(map)

#         return render_template(
#             "result.html",
#             guess=user_coords,
#             landmark=session["landmark"],
#             distance=distance,
#             map=map._repr_html_(),
#         )

#     else:
#         # Get a random landmark
#         landmark, coords = get_random_landmark()
#         session["landmark"] = landmark
#         session["coords"] = coords

#         # Create the empty map
#         map = create_map()

#         return render_template("index.html", map_header=map._repr_html_())


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        lat = request.form["latitude"]
        lon = request.form["longitude"]
        return f"You clicked at latitude: {lat}, longitude: {lon}"
    else:
        return render_template("index.html")


if __name__ == "__main__":
    app.run()
