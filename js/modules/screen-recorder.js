export function init(container) {
    container.innerHTML = `
        <h2>Screen Recorder</h2>
        <div class="controls">
            <button id="btn-start-share">Start Screen Share/Record</button>
            <button id="btn-stop-share" disabled>Stop Recording</button>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap: 20px;">
            <div>
                <h3>Live Preview</h3>
                <video id="screen-preview" autoplay playsinline muted style="background:black; width: 480px; height: 270px; border: 1px solid #ccc;"></video>
            </div>
            <div>
                <h3>Recorded Playback</h3>
                <video id="screen-playback" controls style="background:black; width: 480px; height: 270px; border: 1px solid #ccc;"></video>
            </div>
        </div>

        <div id="screen-details" class="result-box" style="display:none;"></div>
    `;

    const btnStart = container.querySelector('#btn-start-share');
    const btnStop = container.querySelector('#btn-stop-share');
    const preview = container.querySelector('#screen-preview');
    const playback = container.querySelector('#screen-playback');
    const details = container.querySelector('#screen-details');

    let mediaRecorder = null;
    let recordedChunks = [];
    let stream = null;
    let startTime = 0;

    btnStart.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });

            preview.srcObject = stream;

            // Set up recorder
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                playback.src = URL.createObjectURL(blob);

                // Stop tracks if not already stopped (e.g. by user clicking "Stop sharing" in browser UI)
                stream.getTracks().forEach(track => track.stop());

                btnStart.disabled = false;
                btnStop.disabled = true;

                const duration = (Date.now() - startTime) / 1000;
                details.textContent += `\nRecording finished.\nDuration: ${duration.toFixed(2)}s\nSize: ${blob.size} bytes`;
            };

            // Handle user stopping via browser UI
            stream.getVideoTracks()[0].onended = () => {
                 if (mediaRecorder.state !== 'inactive') {
                     mediaRecorder.stop();
                 }
                 btnStart.disabled = false;
                 btnStop.disabled = true;
            };

            mediaRecorder.start();
            startTime = Date.now();

            btnStart.disabled = true;
            btnStop.disabled = false;

            details.style.display = 'block';
            const settings = stream.getVideoTracks()[0].getSettings();
            details.textContent = `Screen sharing started.\nResolution: ${settings.width}x${settings.height}`;

        } catch (err) {
            console.error("Error: " + err);
            details.style.display = 'block';
            details.textContent = `Error starting screen capture: ${err.message}`;
        }
    });

    btnStop.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    });
}
