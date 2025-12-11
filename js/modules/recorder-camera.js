export function init(container) {
    container.innerHTML = `
        <h2>Recorder & Camera</h2>
        <div class="controls">
            <button id="btn-camera">Open Camera</button>
            <button id="btn-record-start" disabled>Start Recording</button>
            <button id="btn-record-stop" disabled>Stop Recording</button>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap: 20px;">
            <div>
                <h3>Preview</h3>
                <video id="camera-preview" autoplay playsinline muted style="background:black; width: 320px; height: 240px;"></video>
            </div>
            <div>
                <h3>Recorded Playback</h3>
                <video id="recorded-video" controls style="background:black; width: 320px; height: 240px;"></video>
            </div>
        </div>

        <div id="recorder-details" class="result-box" style="display:none;"></div>
    `;

    const btnCamera = container.querySelector('#btn-camera');
    const btnRecordStart = container.querySelector('#btn-record-start');
    const btnRecordStop = container.querySelector('#btn-record-stop');
    const preview = container.querySelector('#camera-preview');
    const playback = container.querySelector('#recorded-video');
    const details = container.querySelector('#recorder-details');

    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let startTime = 0;

    btnCamera.addEventListener('click', async () => {
        try {
            if (stream) {
                // Stop existing stream
                stream.getTracks().forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            preview.srcObject = stream;

            btnCamera.textContent = 'Restart Camera';
            btnRecordStart.disabled = false;

            details.style.display = 'block';
            const videoTrack = stream.getVideoTracks()[0];
            const settings = videoTrack.getSettings();
            details.textContent = `Camera initialized.\nResolution: ${settings.width}x${settings.height}\nFrame Rate: ${settings.frameRate}`;

        } catch (err) {
            console.error(err);
            details.style.display = 'block';
            details.textContent = `Error accessing camera: ${err.message}`;
        }
    });

    btnRecordStart.addEventListener('click', () => {
        if (!stream) return;

        recordedChunks = [];
        try {
            mediaRecorder = new MediaRecorder(stream);
        } catch (e) {
             details.textContent += `\nError creating MediaRecorder: ${e.message}`;
             return;
        }

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            playback.src = URL.createObjectURL(blob);
            const duration = (Date.now() - startTime) / 1000;
            details.textContent += `\nRecording finished.\nDuration: ${duration.toFixed(2)}s\nSize: ${blob.size} bytes`;
        };

        mediaRecorder.start();
        startTime = Date.now();
        btnRecordStart.disabled = true;
        btnRecordStop.disabled = false;
        details.textContent += `\nRecording started...`;
    });

    btnRecordStop.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            btnRecordStart.disabled = false;
            btnRecordStop.disabled = true;
        }
    });
}
