from flask import Flask, render_template, request, session
import random
import csv
import requests
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


@app.route("/", methods=["GET", "POST"])
def index():
    landmark_name, landmark_lat, landmark_lon = get_random_landmark()
    return render_template(
        "index.html",
        landmark_name=landmark_name,
        landmark_lat=landmark_lat,
        landmark_lon=landmark_lon,
    )


if __name__ == "__main__":
    app.run(debug=True)
