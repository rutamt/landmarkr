var map = L.map("map").setView([0, 0], 2);
var marker;
var score = localStorage.getItem('score');
var rounds = localStorage.getItem('rounds');
var rounds = localStorage.getItem('rounds');

const totalScoreElement = document.getElementById('total-score');
const totalScore = localStorage.getItem('score');

if (rounds === null) {
    rounds = 1;
} else {
    rounds = parseInt(rounds);
}

console.log("Rounds", rounds)
var roundScore = 1000 * rounds;
console.log("RS ", roundScore);

console.log("Changing totalScore");
totalScoreElement.textContent = `Total Score: ${totalScore} / ${roundScore}`;

if (score === null) {
    score = 0;
} else {
    score = parseInt(score);
}


// Update and save the score
function updateScore(newScore) {
    var currentScore = parseInt(localStorage.getItem('score'));
    currentScore += newScore;
    localStorage.setItem('score', currentScore);
    var currentRounds = parseInt(localStorage.getItem('rounds')) + 1;
    localStorage.setItem('rounds', currentRounds);
    console.log("Rounds from US", localStorage.getItem('rounds'))
    document.getElementById('total-score').textContent = 'Score: ' + currentScore + ' / ' + 1000 * currentRounds;
}


// Clear the score from localStorage
function clearScore() {
    score = 0;
    rounds = 1;
    document.getElementById('total-score').textContent = 'Score: ' + score + ' / ' + 1000 * rounds;
    localStorage.setItem('score', score);
    localStorage.setItem('rounds', rounds);
    location.reload(); // Reload the page to update the displayed score
}


function onMapClick(e) {
    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker(e.latlng).addTo(map);
    $("#latitude").val(e.latlng.lat.toFixed(6));
    $("#longitude").val(e.latlng.lng.toFixed(6));
    $("#submit-btn").prop("disabled", false).show();
}

map.on("click", onMapClick);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

function calculateScore(lat, lon) {
    var latitude = marker.getLatLng().lat.toFixed(6);
    var longitude = marker.getLatLng().lng.toFixed(6);
    var landmark_lat = lat;
    var landmark_lon = lon;

    const guess_lat_rad = latitude * (Math.PI / 180);
    const guess_lon_rad = longitude * (Math.PI / 180);
    const real_lat_rad = landmark_lat * (Math.PI / 180);
    const real_lon_rad = landmark_lon * (Math.PI / 180);

    // Haversine formula
    const dlon = real_lon_rad - guess_lon_rad;
    const dlat = real_lat_rad - guess_lat_rad;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(guess_lat_rad) * Math.cos(real_lat_rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c;  // Earth's radius in km

    // Calculate the score
    const max_distance = 3000;  // Maximum possible distance between two points
    const score = Math.round(1000 * (1 - distance / max_distance));
    const formattedScore = Math.max(score, 0);  // Ensure the score is not negative

    // Display the score in a modal
    const scoreModal = document.getElementById('score-modal');
    const scoreText = document.getElementById('score-text');
    scoreText.textContent = `Score: ${formattedScore} out of 1000`;

    updateScore(parseInt(formattedScore));
    scoreModal.style.display = 'block';

    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    // Create a marker at the landmark's location with a different color
    const landmarkMarker = L.marker([landmark_lat, landmark_lon], { icon: greenIcon }).addTo(map);

    // Draw a dotted line between the two markers
    const line = L.polyline([[latitude, longitude], [landmark_lat, landmark_lon]], {
        dashArray: '5, 5',
        color: 'green'
    }).addTo(map);

    // Disable further marker placement
    map.off('click');
    marker.off('drag');

    // Hide the submit button
    const submitButton = document.getElementById('submit-btn');
    submitButton.style.display = 'none';
}


// Call the showIntroModal function to check if the modal should be displayed
