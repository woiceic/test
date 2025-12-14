export function init(container) {
    container.innerHTML = `
        <h2>Location API</h2>
        <div class="controls">
            <button id="btn-get-location">Get Current Location</button>
            <button id="btn-watch-location">Watch Location</button>
            <button id="btn-stop-watch" disabled>Stop Watching</button>
        </div>

        <div id="location-map" style="width: 100%; height: 300px; background: #eee; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
            Map Placeholder (Coordinates will appear here)
        </div>

        <div id="location-details" class="result-box" style="display:none;"></div>
    `;

    const btnGet = container.querySelector('#btn-get-location');
    const btnWatch = container.querySelector('#btn-watch-location');
    const btnStop = container.querySelector('#btn-stop-watch');
    const mapDiv = container.querySelector('#location-map');
    const details = container.querySelector('#location-details');

    let watchId = null;

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const timestamp = new Date(position.timestamp).toLocaleString();

        details.style.display = 'block';
        details.textContent = `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${accuracy} meters\nTimestamp: ${timestamp}`;

        // Simple visual representation
        mapDiv.innerHTML = `
            <div style="text-align: center;">
                <h3>Current Position</h3>
                <p>${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
                <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}" target="_blank" style="color: var(--accent-color);">View on OpenStreetMap</a>
            </div>
        `;
    }

    function showError(error) {
        details.style.display = 'block';
        let msg = '';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                msg = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                msg = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                msg = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                msg = "An unknown error occurred.";
                break;
        }
        details.textContent = `Error: ${msg} (${error.message})`;
    }

    btnGet.addEventListener('click', () => {
        if (!navigator.geolocation) {
            details.style.display = 'block';
            details.textContent = "Geolocation is not supported by this browser.";
            return;
        }

        details.style.display = 'block';
        details.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    });

    btnWatch.addEventListener('click', () => {
         if (!navigator.geolocation) {
            details.style.display = 'block';
            details.textContent = "Geolocation is not supported by this browser.";
            return;
        }

        if (watchId) return;

        details.style.display = 'block';
        details.textContent = "Started watching location...";

        watchId = navigator.geolocation.watchPosition((position) => {
             showPosition(position);
             details.textContent += "\n(Updated just now)";
        }, showError);

        btnWatch.disabled = true;
        btnStop.disabled = false;
    });

    btnStop.addEventListener('click', () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            btnWatch.disabled = false;
            btnStop.disabled = true;
            details.textContent += "\nStopped watching location.";
        }
    });
}
