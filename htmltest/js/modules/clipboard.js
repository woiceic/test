export function init(container) {
    container.innerHTML = `
        <h2>Clipboard API</h2>
        <div class="controls">
            <button id="btn-copy-text">Copy Text</button>
            <button id="btn-read-text">Read Text</button>
            <button id="btn-copy-rich">Copy Rich Text</button>
            <button id="btn-read-image">Read Image</button>
        </div>

        <div style="margin-bottom: 1rem; display: flex; gap: 10px;">
            <div style="flex: 1;">
                <label>Plain Text Area:</label>
                <textarea id="clipboard-area" rows="4" style="width:100%; padding: 5px;">Hello, Clipboard!</textarea>
            </div>
            <div style="flex: 1;">
                 <label>Rich Text Area (ContentEditable):</label>
                 <div id="rich-text-area" contenteditable="true" style="border: 1px solid #ccc; min-height: 80px; padding: 5px; background: white;">
                    <b>Bold</b>, <i>Italic</i>, and <span style="color: red;">Red</span> Text
                 </div>
            </div>
        </div>

        <div id="clipboard-image-preview" style="border: 1px dashed #ccc; padding: 10px; min-height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
            Image Preview Area (Paste or Read Image)
        </div>

        <div id="clipboard-details" class="result-box" style="display:none;"></div>
    `;

    const btnCopyText = container.querySelector('#btn-copy-text');
    const btnReadText = container.querySelector('#btn-read-text');
    const btnCopyRich = container.querySelector('#btn-copy-rich');
    const btnReadImage = container.querySelector('#btn-read-image');
    const textArea = container.querySelector('#clipboard-area');
    const richTextArea = container.querySelector('#rich-text-area');
    const imagePreview = container.querySelector('#clipboard-image-preview');
    const details = container.querySelector('#clipboard-details');

    // --- Plain Text ---
    btnCopyText.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textArea.value);
            details.style.display = 'block';
            details.textContent = 'Plain text copied to clipboard successfully.';
        } catch (err) {
            details.style.display = 'block';
            details.textContent = `Failed to copy text: ${err.message}`;
        }
    });

    btnReadText.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textArea.value = text;
            details.style.display = 'block';
            details.textContent = `Text read from clipboard (${text.length} chars).`;
        } catch (err) {
            details.style.display = 'block';
            details.textContent = `Failed to read text: ${err.message}.`;
        }
    });

    // --- Rich Text ---
    btnCopyRich.addEventListener('click', async () => {
        try {
            const htmlContent = richTextArea.innerHTML;
            const textContent = richTextArea.innerText;

            const blobHtml = new Blob([htmlContent], { type: 'text/html' });
            const blobText = new Blob([textContent], { type: 'text/plain' });

            const data = [new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })];

            await navigator.clipboard.write(data);
            details.style.display = 'block';
            details.textContent = 'Rich text (HTML + Plain) copied to clipboard successfully.';
        } catch (err) {
            details.style.display = 'block';
            details.textContent = `Failed to copy rich text: ${err.message}`;
        }
    });

    // Paste handling for Rich Text is implicit in contenteditable, but we can intercept to show details
    richTextArea.addEventListener('paste', (e) => {
        // We let the browser handle the actual paste, but we log the types
        const types = e.clipboardData.types;
        details.style.display = 'block';
        details.textContent = `Paste event detected on Rich Text Area.\nAvailable types: ${JSON.stringify(types)}`;
    });

    // --- Image ---
    btnReadImage.addEventListener('click', async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            let imageFound = false;

            for (const clipboardItem of clipboardItems) {
                const imageType = clipboardItem.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await clipboardItem.getType(imageType);
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(blob);
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '300px';

                    imagePreview.innerHTML = '';
                    imagePreview.appendChild(img);

                    details.style.display = 'block';
                    details.textContent = `Image read from clipboard.\nType: ${imageType}\nSize: ${blob.size} bytes`;
                    imageFound = true;
                    break;
                }
            }

            if (!imageFound) {
                details.style.display = 'block';
                details.textContent = 'No image found in clipboard.';
            }

        } catch (err) {
            details.style.display = 'block';
            details.textContent = `Failed to read clipboard content: ${err.message}`;
        }
    });

    // Global Paste for Image Preview area or general body
    container.addEventListener('paste', async (e) => {
        // Avoid handling if pasting into the text areas, unless we want to intercept images there too
        if (e.target === textArea || e.target === richTextArea || richTextArea.contains(e.target)) return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '300px';
                    imagePreview.innerHTML = '';
                    imagePreview.appendChild(img);
                    details.style.display = 'block';
                    details.textContent = `Image pasted directly.\nType: ${item.type}\nSize: ${blob.size} bytes`;
                };
                reader.readAsDataURL(blob);
            }
        }
    });
}
