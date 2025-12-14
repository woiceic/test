// Main application entry point

const modules = {
    'media-upload': () => import('./modules/media-upload.js'),
    'recorder-camera': () => import('./modules/recorder-camera.js'),
    'clipboard': () => import('./modules/clipboard.js'),
    'location': () => import('./modules/location.js'),
    'screen-recorder': () => import('./modules/screen-recorder.js')
};

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links li');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinksFade = document.querySelectorAll('.nav-links li');
    const appContent = document.getElementById('app-content');

    // Toggle Nav
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinksFade.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', async () => {
            const target = link.getAttribute('data-target');
            if (modules[target]) {
                // Close mobile menu if open
                if(nav.classList.contains('nav-active')) {
                    nav.classList.remove('nav-active');
                    navLinksFade.forEach(link => link.style.animation = '');
                }

                appContent.innerHTML = '<div class="module-container" id="module-root">Loading...</div>';
                const moduleRoot = document.getElementById('module-root');

                try {
                    const module = await modules[target]();
                    module.init(moduleRoot);
                } catch (error) {
                    console.error('Error loading module:', error);
                    moduleRoot.innerHTML = `<p style="color:red">Error loading module: ${error.message}</p>`;
                }
            }
        });
    });
});
