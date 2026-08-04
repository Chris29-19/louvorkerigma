/* js/mobile-test.js - Injeta botão ⋮ em cada música */

(function() {
    'use strict';

    function init() {
        const observer = new MutationObserver(() => injectMoreButtons());
        observer.observe(document.body, { childList: true, subtree: true });
        injectMoreButtons();
    }

    function injectMoreButtons() {
        const songs = document.querySelectorAll('.song-item');
        songs.forEach(song => {
            if (song.querySelector('.btn-more-actions')) return;

            const songId = song.dataset.id;
            const btn = document.createElement('div');
            btn.className = 'col-more-actions';
            btn.innerHTML = `
                <button class="btn-more-actions" data-id="${songId}" title="Mais opções" aria-label="Mais opções">⋮</button>
                <div class="more-actions-dropdown" style="display:none;" data-id="${songId}">
                    <div class="more-actions-option action-duplicate" data-id="${songId}">
                        <i class="ph ph-copy"></i> Duplicar
                    </div>
                    <div class="more-actions-option action-edit" data-id="${songId}">
                        <i class="ph ph-pencil-simple"></i> Editar
                    </div>
                    <div class="more-actions-divider"></div>
                    <div class="more-actions-option action-delete danger" data-id="${songId}">
                        <i class="ph ph-trash"></i> Excluir
                    </div>
                </div>
            `;
            song.appendChild(btn);
        });
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-more-actions');
        if (btn) {
            e.stopPropagation();
            const dropdown = btn.nextElementSibling;
            const isOpen = dropdown.style.display === 'block';

            document.querySelectorAll('.more-actions-dropdown').forEach(d => {
                d.style.display = 'none';
            });

            if (!isOpen) {
                const rect = btn.getBoundingClientRect();
                dropdown.style.position = 'fixed';
                dropdown.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
                dropdown.style.left = Math.max(8, rect.left - 140) + 'px';
                dropdown.style.display = 'block';
            }
            return;
        }

        const option = e.target.closest('.more-actions-option');
        if (option) {
            e.stopPropagation();
            const id = option.dataset.id;
            const action = option.classList.contains('action-duplicate') ? 'duplicate'
                         : option.classList.contains('action-edit') ? 'edit'
                         : option.classList.contains('action-delete') ? 'delete'
                         : null;

            document.querySelectorAll('.more-actions-dropdown').forEach(d => d.style.display = 'none');

            if (action === 'duplicate') handleAction(id, '.btn-duplicate');
            else if (action === 'edit') handleAction(id, '.btn-edit');
            else if (action === 'delete') handleAction(id, '.btn-delete');
            return;
        }

        document.querySelectorAll('.more-actions-dropdown').forEach(d => d.style.display = 'none');
    });

    function handleAction(id, selector) {
        const btn = document.querySelector('.song-item[data-id="' + id + '"] ' + selector);
        if (btn) btn.click();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
