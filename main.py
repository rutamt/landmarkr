from flask import Flask, render_template
import random
import csv
import requests
import html
import os

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = "secret"
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY")


def get_place_info(place_name):
    # Retrieve place summary from Wikipedia API
    wikipedia_endpoint = (
        f"https://en.wikipedia.org/api/rest_v1/page/summary/{place_name}"
    )
    response = requests.get(wikipedia_endpoint)
    if response.status_code == 200:
        data = response.json()
        summary = data.get("extract", "")
    else:
        summary = ""

    # Retrieve place photo from Pexels API
    pexels_endpoint = "https://api.pexels.com/v1/search"
    headers = {"Authorization": PEXELS_API_KEY}
    params = {"query": place_name, "per_page": 1}
    response = requests.get(pexels_endpoint, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        if data.get("total_results", 0) > 0:
            photo = data["photos"][0]["src"]["large"]
        else:
            photo = ""
    else:
        photo = ""

    return summary, photo


def get_random_landmark():
    with open("landmarks.csv", "r", encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        landmarks = list(reader)

        landmark = random.choice(landmarks)
        landmark_name = landmark[0].strip("'")
        landmark_name = html.unescape(landmark_name)
        endpoint = "https://nominatim.openstreetmap.org/search"

        params = {"q": landmark_name, "format": "json"}
        response = requests.get(endpoint, params=params)
        data = response.json()
        sorted_results = sorted(data, key=lambda x: x["importance"], reverse=True)

        if sorted_results:
            new_data = sorted_results[0]
        else:
            bad_params = {"q": landmark_name, "format": "json", "limit": "1"}
            response = requests.get(endpoint, params=bad_params)
            new_data = response.json()

        if new_data:
            landmark_lat = float(new_data["lat"])
            landmark_lon = float(new_data["lon"])
            return landmark_name, landmark_lat, landmark_lon

    return get_random_landmark()


@app.route("/", methods=["GET", "POST"])
def index():
    landmark_name, landmark_lat, landmark_lon = get_random_landmark()
    summary, photo = get_place_info(landmark_name)

    return render_template(
        "index.html",
        landmark_name=landmark_name,
        landmark_lat=landmark_lat,
        landmark_lon=landmark_lon,
        summary=summary,
        photo=photo,
    )


if __name__ == "__main__":
    app.run(debug=True)
