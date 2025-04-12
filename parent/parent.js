let map;
let marker;

document.getElementById("trackNow").addEventListener("click", () => {
  // For now, simulate with mock data. Later: fetch from backend
  const mockLocation = {
    lat: 35.23245,
    lng: -106.64678,
    agl: 42.3,
    timestamp: new Date().toLocaleString()
  };

  updateDisplay(mockLocation);
  updateMap(mockLocation.lat, mockLocation.lng);
});

function updateDisplay({ lat, lng, agl, timestamp }) {
  document.getElementById("lat").textContent = lat;
  document.getElementById("lng").textContent = lng;
  document.getElementById("agl").textContent = agl;
  document.getElementById("timestamp").textContent = timestamp;
}

function initMap() {
  const initialPosition = { lat: 0, lng: 0 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: initialPosition,
    zoom: 2,
  });

  marker = new google.maps.Marker({
    position: initialPosition,
    map: map,
    title: "Child's Location",
  });
}

function updateMap(lat, lng) {
  const position = { lat, lng };
  marker.setPosition(position);
  map.setCenter(position);
  map.setZoom(15);
}
