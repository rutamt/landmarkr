var map = L.map("map").setView([0, 0], 2);
var marker;

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

// Function to check if the intro modal should be shown
function showIntroModal() {
    const rounds = localStorage.getItem('rounds');
    if (!rounds) {
        const introModal = document.getElementById('intro-modal');
        introModal.style.display = 'block';
    }
}

// Function to handle the start button click
function handleStartButtonClick() {
    const roundsInput = document.getElementById('rounds-input');
    const rounds = parseInt(roundsInput.value);
    localStorage.setItem('rounds', rounds);

    // Close the intro modal
    const introModal = document.getElementById('intro-modal');
    introModal.style.display = 'none';

    // Start the game or perform any necessary actions based on the selected number of rounds
    startGame(rounds);
}

// Add event listener to the start button
const startButton = document.getElementById('start-button');
startButton.addEventListener('click', handleStartButtonClick);

// Call the showIntroModal function to check if the modal should be displayed
showIntroModal();
