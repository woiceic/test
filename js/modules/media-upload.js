export function init(container) {
    container.innerHTML = `
        <h2>Media Upload & Play</h2>
        <p>Upload image, audio, or video files to view/play them and see their details.</p>

        <div class="controls">
            <label for="media-input">Select File:</label>
            <input type="file" id="media-input" accept="image/*,audio/*,video/*">
        </div>

        <div id="media-preview" style="margin-top: 20px;"></div>
        <div id="media-details" class="result-box" style="display:none;"></div>
    `;

    const fileInput = container.querySelector('#media-input');
    const previewContainer = container.querySelector('#media-preview');
    const detailsContainer = container.querySelector('#media-details');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Clear previous content
        previewContainer.innerHTML = '';
        detailsContainer.style.display = 'block';
        detailsContainer.textContent = `File Name: ${file.name}\nFile Type: ${file.type}\nFile Size: ${formatBytes(file.size)}`;

        const objectUrl = URL.createObjectURL(file);

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = objectUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '400px';
            img.onload = () => {
                detailsContainer.textContent += `\nDimensions: ${img.naturalWidth}x${img.naturalHeight} px`;
            };
            previewContainer.appendChild(img);
        } else if (file.type.startsWith('audio/')) {
            const audio = document.createElement('audio');
            audio.src = objectUrl;
            audio.controls = true;
            audio.onloadedmetadata = () => {
                 detailsContainer.textContent += `\nDuration: ${audio.duration.toFixed(2)}s`;
            };
            previewContainer.appendChild(audio);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = objectUrl;
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '400px';
            video.onloadedmetadata = () => {
                 detailsContainer.textContent += `\nDuration: ${video.duration.toFixed(2)}s\nDimensions: ${video.videoWidth}x${video.videoHeight} px`;
            };
            previewContainer.appendChild(video);
        } else {
            previewContainer.textContent = 'Unsupported file type for preview.';
        }
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
