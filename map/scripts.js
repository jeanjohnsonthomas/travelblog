document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = L.map('map', { 
        center: [22.5937, 78.9629], 
        zoom: 4,
        zoomControl: false // Hide default zoom control
    });

    // Set up the OSM layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Function to add a marker
    function addMarker(lat, lng, info) {
        const marker = L.marker([lat, lng]);
        marker.bindPopup(info);
        return marker;
    }

    // Store markers in an array
    const markers = [];

    // Add routes to the map
    routes.forEach(route => {
        const waypoints = route.waypoints.map(wp => L.latLng(wp.lat, wp.lng));

        L.Routing.control({
            waypoints: waypoints,
            createMarker: function() { return null; }, // Remove default markers
            lineOptions: {
                styles: [{ color: route.color, weight: 5, opacity: 0.7 }]
            },
            plan: L.Routing.plan(waypoints, {
                createMarker: function() { return null; }, // Remove default markers
                show: false
            }),
            routeWhileDragging: false,
            show: false
        }).addTo(map);

        // Add place pins
        route.waypoints.forEach(wp => {
            const marker = addMarker(wp.lat, wp.lng, wp.info);
            marker.addTo(map);
            markers.push(marker);
        });
    });

    // Add individual location pins
    locations.forEach(location => {
        const marker = addMarker(location.lat, location.lng, location.info);
        marker.addTo(map);
        markers.push(marker);
    });

    // Toggle pins visibility
    let pinsVisible = true;
    document.getElementById('togglePins').addEventListener('click', () => {
        pinsVisible = !pinsVisible;
        markers.forEach(marker => {
            if (pinsVisible) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    });
});
