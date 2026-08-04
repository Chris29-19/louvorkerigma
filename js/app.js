// js/app.js
import { HomeView } from './views/HomeView.js';
import { SongFormView } from './views/SongFormView.js';
import { MainController } from './controllers/MainController.js';

function startApp() {
    try {
        const homeView = new HomeView();
        const formView = new SongFormView();
        const controller = new MainController(homeView, formView);
        controller.init();
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
