var map = L.map("map").setView([0, 0], 2);
var marker;
var score = localStorage.getItem('score');
var rounds = localStorage.getItem('rounds');
let distance = parseFloat(localStorage.getItem('distance'));

const totalScoreElement = document.getElementById('total-score');
const totalScore = localStorage.getItem('score');
const statsElement = document.getElementById('stats');

var finalTextElement = document.getElementById('final-score-text');
var scoreModal = document.getElementById('final-modal');
var resetButton = document.getElementById('reset-score-btn');
const submitButton = document.getElementById('submit-btn');
const lookingFor = document.getElementById('landmark-info');
const introModal = document.getElementById('intro-modal');

// console.log("Rounds", rounds)
var roundScore = 1000 * rounds - 1000;
// console.log("RS ", roundScore);
const guessAcuracy = (totalScore / roundScore) * 100;

// Filling in the game statistics when page is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Handling the intro modal
    if (score === 0) {
        introModal.style.display = 'block';
        resetButton.style.display = 'none';
        lookingFor.style.display = 'none';
        map.off('click');
    }
    // Call the function once the document has finished loading
    statsElement.innerHTML = `<pre>Rounds: ${rounds}\nAverage distance: ${Math.round((distance / rounds) * 100) / 100} Km\nAccuracy: ${Math.round(guessAcuracy * 100) / 100}%</pre>`;

});

if (rounds === null) {
    rounds = 1;
} else {
    rounds = parseInt(rounds);
}

if (isNaN(distance)) {
    localStorage.setItem('distance', 0);
    distance = 0;
} else {
    distance = parseInt(distance);
}

function startGame() {
    introModal.style.display = 'none';
    resetButton.style.display = 'block';
    lookingFor.style.display = 'block';
    map.on("click", onMapClick);
}

console.log("Changing totalScore");
totalScoreElement.textContent = `Total Score: ${totalScore} / ${roundScore}`;

if (score === null) {
    score = 0;
} else {
    score = parseInt(score);
}


// Update and save the score
function updateScore(newScore, newDistance) {
    var currentScore = parseInt(localStorage.getItem('score'));
    currentScore += newScore;
    localStorage.setItem('score', currentScore);

    var currentRounds = parseInt(localStorage.getItem('rounds'));

    var currentDistance = parseInt(localStorage.getItem('distance'));
    currentDistance += newDistance;
    localStorage.setItem('distance', currentDistance);
    console.log(`CD: ${currentDistance}, td = ${distance}`);

    console.log("Rounds from US", localStorage.getItem('rounds'))
    document.getElementById('total-score').textContent = 'Score: ' + currentScore + ' / ' + 1000 * currentRounds;
    localStorage.setItem('rounds', currentRounds + 1);

}


// Clear the score from localStorage
function clearScore() {
    scoreModal.style.display = 'block';
    submitButton.style.display = 'none';
    resetButton.style.display = 'none';
    lookingFor.style.display = 'none';
    map.off('click');
    finalTextElement.innerHTML = `<pre>Rounds: ${rounds}\nAverage distance: ${Math.round((distance / rounds) * 100) / 100} Km\nAccuracy: ${Math.round(guessAcuracy * 100) / 100}%</pre>`;

    score = 0;
    rounds = 1;
    document.getElementById('total-score').textContent = 'Score: ' + score + ' / ' + 1000 * rounds;
    localStorage.setItem('score', score);
    localStorage.setItem('distance', score);

    localStorage.setItem('rounds', rounds);
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

    const distanceText = document.getElementById('distance-from-point');
    const meterDistance = (Math.round((distance * 1000) * 100) / 100);
    const formattedDistance = (Math.round(distance * 100) / 100);

    distanceText.textContent = `${meterDistance >= 1000 ? `${(Math.round(distance * 100) / 100).toLocaleString("en-US")}KM (${(Math.round((distance * 0.621371) * 100) / 100).toLocaleString("en-US")}Mi)` : `${meterDistance.toLocaleString("en-US")}M (${(Math.round((meterDistance * 3.2808) * 100) / 100).toLocaleString("en-US")}ft)`}`;

    const congratsLine = document.getElementById('congrats-text');
    if (score === 1000) { congratsLine.textContent = `Perfect score! Can you do it again?` }
    else if (score >= 750) {
        congratsLine.textContent = `Great job! Only ${1000 - score} point${1000 - score == 1 ? "" : "s"} from perfection!`
    }

    updateScore(parseInt(formattedScore), formattedDistance);
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


function showModal() {
    document.getElementById('stats-modal').classList.add('active');
}

function hideModal() {
    document.getElementById('stats-modal').classList.remove('active');
}

var img = document.getElementById('landmark-photo');

img.addEventListener('load', function () {
    var maxWidth = 600;
    var maxHeight = 500;

    if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
        var aspectRatio = img.naturalWidth / img.naturalHeight;
        var width = img.naturalWidth;
        var height = img.naturalHeight;

        if (aspectRatio > 1) {
            // Landscape image
            if (img.naturalWidth > maxWidth) {
                width = maxWidth;
                height = maxWidth / aspectRatio;
            }
        } else {
            // Portrait image
            if (img.naturalHeight > maxHeight) {
                height = maxHeight;
                width = maxHeight * aspectRatio;
            }
        }

        img.width = width;
        img.height = height;
    }
});
