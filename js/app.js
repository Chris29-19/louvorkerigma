// js/app.js
import { HomeView } from './views/HomeView.js';
import { SongFormView } from './views/SongFormView.js';
import { MainController } from './controllers/MainController.js';
import { CURRENT_VERSION, CHANGELOG } from './changelog.js';

function checkChangelog() {
    const lastSeen = localStorage.getItem('louvorapp_lastSeenVersion');

    if (lastSeen === CURRENT_VERSION) return;
    if (!CHANGELOG[CURRENT_VERSION]) return;

    const modal = document.getElementById('changelogModal');
    const versionEl = document.getElementById('changelogVersion');
    const bodyEl = document.getElementById('changelogBody');
    const btnDismiss = document.getElementById('btnDismissChangelog');

    if (!modal || !versionEl || !bodyEl || !btnDismiss) return;

    versionEl.textContent = `Versão ${CURRENT_VERSION}`;

    const items = CHANGELOG[CURRENT_VERSION];
    bodyEl.innerHTML = `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const dismiss = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        localStorage.setItem('louvorapp_lastSeenVersion', CURRENT_VERSION);
    };

    btnDismiss.addEventListener('click', dismiss);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) dismiss();
    });
}

function startApp() {
    try {
        const homeView = new HomeView();
        const formView = new SongFormView();
        const controller = new MainController(homeView, formView);
        controller.init().then(() => {
            checkChangelog();
        });
    } catch (e) {
        console.error("Erro ao iniciar o app:", e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
