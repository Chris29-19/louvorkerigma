// js/views/HomeView.js
import { SongModel } from '../models/SongModel.js';
import { slugify } from '../utils/helpers.js';

export class HomeView {
    constructor() {
        this.songsListAdoracao = document.getElementById('songsListAdoracao');
        this.adoracaoCount = document.getElementById('adoracaoCount');
        this.searchInputAdoracao = document.getElementById('searchInputAdoracao');
        this.clearSearchAdoracao = document.getElementById('clearSearchAdoracao');
        this.searchBarAdoracao = document.getElementById('searchBarAdoracao');

        this.songsListLouvor = document.getElementById('songsListLouvor');
        this.louvorCount = document.getElementById('louvorCount');
        this.searchInputLouvor = document.getElementById('searchInputLouvor');
        this.clearSearchLouvor = document.getElementById('clearSearchLouvor');
        this.searchBarLouvor = document.getElementById('searchBarLouvor');

        this.btnAddSong = document.getElementById('btnAddSong');
        this.btnThemeToggle = document.getElementById('btnThemeToggle');
        this.brandLogoImg = document.getElementById('brandLogoImg');
        this.brandLogoIcon = document.getElementById('brandLogoIcon');
        this.brandTitle = document.getElementById('brandTitle');

        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        this.currentVocalist = {};

        // Repertório da Semana
        this.periodoSelect = document.getElementById('periodoSelect');
        this.periodoDatePicker = document.getElementById('periodoDatePicker');
        this.btnCompartilhar = document.getElementById('btnCompartilhar');
        this.subTabBtns = document.querySelectorAll('.sub-tab-btn');
        this.subTabPanels = document.querySelectorAll('.sub-tab-panel');
        this.togglePosPalavra = document.getElementById('togglePosPalavra');
        this.toggleCeia = document.getElementById('toggleCeia');
        this.currentPeriodo = null;
        this.currentDia = 'quarta';
    }

    renderAdoracao(songs) {
        this.adoracaoCount.textContent = `${songs.length} música${songs.length !== 1 ? 's' : ''}`;
        this._renderToList(songs, this.songsListAdoracao);
    }

    renderLouvor(songs) {
        this.louvorCount.textContent = `${songs.length} música${songs.length !== 1 ? 's' : ''}`;
        this._renderToList(songs, this.songsListLouvor);
    }

    _renderToList(songs, container) {
        if (songs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-music-note-simple"></i>
                    <p>Nenhuma música encontrada.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'song-item table-grid-layout';
            item.dataset.id = song.id;

            const vc = song.vocalConfigs || [];
            const hasSelection = this.currentVocalist.hasOwnProperty(song.id);
            const idx = hasSelection ? this.currentVocalist[song.id] : -1;
            const currentVocal = idx >= 0 && vc[idx] ? vc[idx] : null;
            const displayKey = currentVocal ? currentVocal.key : (song.key || '-');

            let vocalCell = '';
            if (vc.length > 0) {
                vocalCell = `
                    <div class="col-vocal vocal-selector" data-id="${song.id}" data-idx="${idx}" style="cursor:pointer; position:relative;">
                        <span class="vocal-name ${!hasSelection ? 'placeholder' : ''}">${hasSelection && currentVocal ? this._esc(currentVocal.vocalist) : 'Selecione'}</span>
                        <i class="ph ph-caret-down" style="font-size:0.7rem; margin-left:2px;"></i>
                        <div class="vocal-dropdown" style="display:none; position:absolute; top:100%; left:0; background:var(--color-bg-surface); border:1px solid var(--color-border); border-radius:4px; z-index:20; box-shadow:var(--shadow-2); min-width:140px;">
                            <div class="vocal-option vocal-option-reset ${idx===-1?'selected':''}" data-idx="-1" style="padding:6px 10px; cursor:pointer; font-size:0.85rem; color:var(--color-text-muted); font-style:italic; ${idx===-1?'background:var(--color-brand-primary); color:#fff;':''}">Selecione</div>
                            ${vc.map((v, i) => `<div class="vocal-option" data-idx="${i}" style="padding:6px 10px; cursor:pointer; font-size:0.85rem; ${i===idx?'background:var(--color-brand-primary); color:#fff;':''}">${this._esc(v.vocalist)} (${this._esc(v.key)})</div>`).join('')}
                        </div>
                    </div>
                `;
            } else {
                vocalCell = `<div class="col-vocal song-meta-text">-</div>`;
            }

            const youtubeId = song.youtubeUrl ? SongModel.extractYouTubeId(song.youtubeUrl) : null;
            const hasYoutube = !!youtubeId;
            const hasLyrics = !!(song.lyrics && song.lyrics.trim());
            const cifraUrl = song.cifraUrl || `https://www.cifraclub.com.br/${slugify(song.artist)}/${slugify(song.title)}`;

            item.innerHTML = `
                <div class="col-index">${index + 1}</div>
                <div class="col-title song-title">${this._esc(song.title)}</div>
                <div class="col-artist song-artist">${this._esc(song.artist)}</div>
                ${vocalCell}
                <div class="col-key song-meta-text vocal-key" data-id="${song.id}">${this._esc(displayKey)}</div>
                <div class="col-youtube" data-id="${song.id}">
                    ${(hasYoutube || hasLyrics) ? `
                    <div class="youtube-btn-wrapper" data-id="${song.id}" data-video="${youtubeId || ''}" data-has-lyrics="${hasLyrics}" data-song-title="${this._esc(song.title)}" data-song-artist="${this._esc(song.artist)}">
                        <button class="btn-youtube" title="Ações" aria-label="Ações">
                            <i class="ph ph-dots-three-vertical"></i>
                        </button>
                        <div class="actions-dropdown" style="display:none;">
                            ${hasYoutube ? `
                            <div class="action-option action-watch" data-video="${youtubeId}">
                                <i class="ph-fill ph-play-circle"></i> Assistir
                            </div>
                            ` : ''}
                            ${hasLyrics ? `
                            <div class="action-option action-lyrics" data-song-id="${song.id}">
                                <i class="ph ph-text-align-left"></i> Letra
                            </div>
                            ` : ''}
                            <a class="action-option action-cifra" href="${cifraUrl}" target="_blank" rel="noopener">
                                <i class="ph ph-link"></i> Cifra
                            </a>
                        </div>
                    </div>
                    ` : `
                    <div class="youtube-btn-wrapper" data-id="${song.id}">
                        <button class="btn-youtube" title="Ações" aria-label="Ações">
                            <i class="ph ph-dots-three-vertical"></i>
                        </button>
                        <div class="actions-dropdown" style="display:none;">
                            <a class="action-option action-cifra" href="${cifraUrl}" target="_blank" rel="noopener">
                                <i class="ph ph-link"></i> Cifra
                            </a>
                        </div>
                    </div>
                    `}
                </div>
                <div class="col-actions song-actions admin-only">
                    <button class="btn-icon btn-secondary btn-duplicate" aria-label="Duplicar" data-id="${song.id}" title="Duplicar">
                        <i class="ph ph-copy"></i>
                    </button>
                    <button class="btn-icon btn-secondary btn-edit" aria-label="Editar" data-id="${song.id}" title="Editar">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="btn-icon btn-danger btn-delete" aria-label="Excluir" data-id="${song.id}" title="Excluir">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            `;

            container.appendChild(item);
        });
    }

    updateLogo(base64Image) {
        if (base64Image) {
            this.brandLogoImg.src = base64Image;
            this.brandLogoImg.style.display = 'block';
            this.brandLogoIcon.style.display = 'none';
        } else {
            this.brandLogoImg.src = '';
            this.brandLogoImg.style.display = 'none';
            this.brandLogoIcon.style.display = 'block';
        }
    }

    _updateClearButton(input, searchBar) {
        if (input && searchBar) {
            if (input.value.length > 0) {
                searchBar.classList.add('has-text');
            } else {
                searchBar.classList.remove('has-text');
            }
        }
    }

    bindEvents(handlers) {
        if (this.searchInputAdoracao) {
            this.searchInputAdoracao.addEventListener('input', () => {
                this._updateClearButton(this.searchInputAdoracao, this.searchBarAdoracao);
                handlers.onSearchAdoracao(this.searchInputAdoracao.value);
            });
        }
        if (this.clearSearchAdoracao) {
            this.clearSearchAdoracao.addEventListener('click', () => {
                this.searchInputAdoracao.value = '';
                this._updateClearButton(this.searchInputAdoracao, this.searchBarAdoracao);
                handlers.onSearchAdoracao('');
                this.searchInputAdoracao.focus();
            });
        }

        if (this.searchInputLouvor) {
            this.searchInputLouvor.addEventListener('input', () => {
                this._updateClearButton(this.searchInputLouvor, this.searchBarLouvor);
                handlers.onSearchLouvor(this.searchInputLouvor.value);
            });
        }
        if (this.clearSearchLouvor) {
            this.clearSearchLouvor.addEventListener('click', () => {
                this.searchInputLouvor.value = '';
                this._updateClearButton(this.searchInputLouvor, this.searchBarLouvor);
                handlers.onSearchLouvor('');
                this.searchInputLouvor.focus();
            });
        }

        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.tab;
                this.tabBtns.forEach(b => b.classList.remove('active'));
                this.tabPanels.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(targetId).classList.add('active');
            });
        });

        if (this.btnThemeToggle) {
            this.btnThemeToggle.addEventListener('click', () => handlers.onThemeToggle());
        }
        if (this.btnAddSong) {
            this.btnAddSong.addEventListener('click', () => handlers.onAddSongClick());
        }

        if (this.songsListAdoracao) this._bindListActions(this.songsListAdoracao, handlers);
        if (this.songsListLouvor) this._bindListActions(this.songsListLouvor, handlers);

        this._bindVocalSelectors(handlers);

        // Repertório da Semana
        if (this.periodoSelect) {
            this.periodoSelect.addEventListener('change', () => {
                if (this.periodoSelect.value) {
                    handlers.onPeriodoChange(this.periodoSelect.value);
                }
            });
        }
        if (this.periodoDatePicker) {
            this.periodoDatePicker.addEventListener('change', () => {
                const selectedDate = this.periodoDatePicker.value;
                if (selectedDate) {
                    handlers.onDatePickerChange(selectedDate);
                }
            });
        }
        if (this.btnCompartilhar) {
            this.btnCompartilhar.addEventListener('click', () => handlers.onCompartilhar());
        }

        this.subTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateSubTabContent(btn.dataset.subtab);
            });
        });

        if (this.togglePosPalavra) {
            this.togglePosPalavra.addEventListener('change', () => {
                this._toggleSecao('pos-palavra', this.togglePosPalavra.checked);
                handlers.onToggleChange('pos-palavra', this.togglePosPalavra.checked);
            });
        }
        if (this.toggleCeia) {
            this.toggleCeia.addEventListener('change', () => {
                this._toggleSecao('ceia', this.toggleCeia.checked);
                handlers.onToggleChange('ceia', this.toggleCeia.checked);
            });
        }

        // Botões adicionar música no repertório
        document.querySelectorAll('.btn-add-song-repertorio').forEach(btn => {
            btn.addEventListener('click', () => {
                handlers.onAddSongRepertorio(btn.dataset.dia, btn.dataset.secao);
            });
        });

        // Botões remover música do repertório
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.btn-remove-song');
            if (removeBtn) {
                e.stopPropagation();
                handlers.onRemoveSongRepertorio(
                    removeBtn.dataset.dia,
                    removeBtn.dataset.secao,
                    parseInt(removeBtn.dataset.index)
                );
            }
        });

        // Dropdowns de vocal e tom no repertório
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('rep-vocal-select') || e.target.classList.contains('rep-key-select')) {
                const select = e.target;
                handlers.onRepertorioFieldChange(
                    select.dataset.dia,
                    select.dataset.secao,
                    parseInt(select.dataset.index),
                    select.classList.contains('rep-vocal-select') ? 'vocalista' : 'tom',
                    select.value
                );
            }
        });
    }

    _bindVocalSelectors(handlers) {
        document.addEventListener('click', (e) => {
            // === Vocal dropdown logic ===
            const option = e.target.closest('.vocal-option');
            if (option) {
                e.stopPropagation();
                const idx = parseInt(option.dataset.idx);
                const selector = option.closest('.vocal-selector');
                const songId = selector.dataset.id;
                selector.dataset.idx = idx;

                if (idx === -1) {
                    delete this.currentVocalist[songId];
                    const nameEl = selector.querySelector('.vocal-name');
                    nameEl.textContent = 'Selecione';
                    nameEl.classList.add('placeholder');
                    const keyEl = selector.closest('.song-item').querySelector('.vocal-key');
                    const song = this._getSongById(songId);
                    if (keyEl && song) keyEl.textContent = song.key || '-';
                } else {
                    this.currentVocalist[songId] = idx;
                    const song = this._getSongById(songId);
                    if (song && song.vocalConfigs && song.vocalConfigs[idx]) {
                        const nameEl = selector.querySelector('.vocal-name');
                        nameEl.textContent = song.vocalConfigs[idx].vocalist;
                        nameEl.classList.remove('placeholder');
                        const keyEl = selector.closest('.song-item').querySelector('.vocal-key');
                        if (keyEl) keyEl.textContent = song.vocalConfigs[idx].key;
                    }
                }

                selector.querySelectorAll('.vocal-option').forEach((opt, i) => {
                    const optIdx = parseInt(opt.dataset.idx);
                    opt.style.background = optIdx === idx ? 'var(--color-brand-primary)' : '';
                    opt.style.color = optIdx === idx ? '#fff' : '';
                });

                option.closest('.vocal-dropdown').style.display = 'none';

                if (handlers.onVocalistChange) {
                    handlers.onVocalistChange(songId, idx);
                }
                return;
            }

            const selector = e.target.closest('.vocal-selector');
            if (selector) {
                e.stopPropagation();
                const dropdown = selector.querySelector('.vocal-dropdown');
                document.querySelectorAll('.vocal-dropdown').forEach(d => {
                    if (d !== dropdown) { d.style.display = 'none'; d.style.position = 'absolute'; d.style.top = '100%'; }
                });
                if (dropdown.style.display === 'none') {
                    const rect = selector.getBoundingClientRect();
                    dropdown.style.position = 'fixed';
                    dropdown.style.top = (rect.bottom + 2) + 'px';
                    dropdown.style.left = rect.left + 'px';
                    dropdown.style.zIndex = '9999';
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                    dropdown.style.position = 'absolute';
                    dropdown.style.top = '100%';
                }
                return;
            }

            document.querySelectorAll('.vocal-dropdown').forEach(d => d.style.display = 'none');

            // === Actions dropdown logic (YouTube + Letra) ===
            const actBtn = e.target.closest('.btn-youtube');
            if (actBtn) {
                e.stopPropagation();
                const wrapper = actBtn.closest('.youtube-btn-wrapper');
                const dropdown = wrapper.querySelector('.actions-dropdown');
                document.querySelectorAll('.actions-dropdown').forEach(d => {
                    if (d !== dropdown) d.style.display = 'none';
                });
                if (dropdown.style.display === 'none') {
                    const rect = wrapper.getBoundingClientRect();
                    dropdown.style.position = 'fixed';
                    dropdown.style.zIndex = '9999';
                    dropdown.style.display = 'block';

                    const ddWidth = dropdown.offsetWidth;
                    const ddHeight = dropdown.offsetHeight;
                    const vw = window.innerWidth;
                    const vh = window.innerHeight;

                    let left = rect.left;
                    if (left + ddWidth > vw - 8) {
                        left = rect.right - ddWidth;
                    }
                    if (left < 8) left = 8;

                    let top = rect.bottom + 2;
                    if (top + ddHeight > vh - 8) {
                        top = rect.top - ddHeight - 2;
                    }

                    dropdown.style.top = top + 'px';
                    dropdown.style.left = left + 'px';
                } else {
                    dropdown.style.display = 'none';
                }
                return;
            }

            const actOption = e.target.closest('.action-option');
            if (actOption) {
                e.stopPropagation();
                actOption.closest('.actions-dropdown').style.display = 'none';
                if (actOption.classList.contains('action-watch')) {
                    const videoId = actOption.dataset.video;
                    if (handlers.onYoutubeWatch) handlers.onYoutubeWatch(videoId);
                } else if (actOption.classList.contains('action-lyrics')) {
                    const songId = actOption.dataset.songId;
                    if (handlers.onViewLyrics) handlers.onViewLyrics(songId);
                }
                return;
            }

            document.querySelectorAll('.actions-dropdown').forEach(d => d.style.display = 'none');
        });
    }

    _getSongById(id) {
        const item = document.querySelector(`.song-item[data-id="${id}"]`);
        if (!item) return null;
        return this._songCache && this._songCache.find(s => s.id === id) || null;
    }

    setSongCache(songs) {
        this._songCache = songs;
    }

    _bindListActions(listEl, handlers) {
        listEl.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const duplicateBtn = e.target.closest('.btn-duplicate');

            if (editBtn) {
                e.stopPropagation();
                handlers.onEditSongClick(editBtn.dataset.id);
            } else if (deleteBtn) {
                e.stopPropagation();
                handlers.onDeleteSongClick(deleteBtn.dataset.id);
            } else if (duplicateBtn) {
                e.stopPropagation();
                handlers.onDuplicateSongClick(duplicateBtn.dataset.id);
            }
        });
    }

    setThemeIcon(isDark) {
        if(this.btnThemeToggle) {
            this.btnThemeToggle.innerHTML = isDark ? '<i class="ph-fill ph-sun"></i>' : '<i class="ph-fill ph-moon"></i>';
        }
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    _esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Repertório da Semana
    renderPeriodos(periodos) {
        if (!this.periodoSelect) return;
        const currentValue = this.periodoSelect.value;
        this.periodoSelect.innerHTML = '<option value="">Períodos salvos</option>';
        periodos.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.periodo;
            if (p.id === currentValue) option.selected = true;
            this.periodoSelect.appendChild(option);
        });
    }

    setSelectedPeriodo(periodoId) {
        this.currentPeriodo = periodoId;
        if (this.periodoSelect) {
            this.periodoSelect.value = periodoId;
        }
    }

    renderRepertorio(repertorio) {
        if (!repertorio) return;

        const dias = ['quarta', 'sabado', 'ebd', 'domingo'];
        const secoes = ['adoracao', 'oferta', 'louvor'];

        dias.forEach(dia => {
            secoes.forEach(secao => {
                const containerId = `rep${this._capitalize(dia)}${this._capitalize(secao)}`;
                const container = document.getElementById(containerId);
                if (container) {
                    const musicas = repertorio[dia]?.[secao] || [];
                    this._renderRepertorioList(musicas, container, dia, secao);
                }
            });
        });

        // Domingo tem seções extras
        const domPosPalavra = document.getElementById('repDomPosPalavra');
        const domCeia = document.getElementById('repDomCeia');
        const btnAddPosPalavra = document.getElementById('btnAddPosPalavra');
        const btnAddCeia = document.getElementById('btnAddCeia');

        if (domPosPalavra) {
            const musicas = repertorio.domingo?.['pos-palavra'] || [];
            this._renderRepertorioList(musicas, domPosPalavra, 'domingo', 'pos-palavra');
        }
        if (domCeia) {
            const musicas = repertorio.domingo?.ceia || [];
            this._renderRepertorioList(musicas, domCeia, 'domingo', 'ceia');
        }

        // Toggles
        if (this.togglePosPalavra) {
            this.togglePosPalavra.checked = repertorio.domingo?.posPalavraAtivo || false;
            this._toggleSecao('pos-palavra', this.togglePosPalavra.checked);
        }
        if (this.toggleCeia) {
            this.toggleCeia.checked = repertorio.domingo?.ceiaAtivo || false;
            this._toggleSecao('ceia', this.toggleCeia.checked);
        }
    }

    _renderRepertorioList(musicas, container, dia, secao) {
        if (!container) return;

        if (musicas.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>Nenhuma música adicionada</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        musicas.forEach((musica, index) => {
            const item = document.createElement('div');
            item.className = 'song-item-repertorio';
            item.dataset.dia = dia;
            item.dataset.secao = secao;
            item.dataset.index = index;

            const vc = musica.vocalConfigs || [];
            const hasVocalConfigs = vc.length > 0;

            let vocalSelect = '';
            if (hasVocalConfigs) {
                vocalSelect = `
                    <select class="rep-vocal-select" data-dia="${dia}" data-secao="${secao}" data-index="${index}">
                        <option value="">Selecione</option>
                        ${vc.map(v => `<option value="${this._esc(v.vocalist)}" ${musica.vocalista === v.vocalist ? 'selected' : ''}>${this._esc(v.vocalist)}</option>`).join('')}
                    </select>
                `;
            } else {
                vocalSelect = `<span class="rep-meta-text">${this._esc(musica.vocalista || '-')}</span>`;
            }

            const keyOptions = ['', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
            let tomSelect = `
                <select class="rep-key-select" data-dia="${dia}" data-secao="${secao}" data-index="${index}">
                    <option value="">Tom</option>
                    ${keyOptions.filter(k => k).map(k => `<option value="${k}" ${musica.tom === k ? 'selected' : ''}>${k}</option>`).join('')}
                </select>
            `;

            item.innerHTML = `
                <div class="song-info-repertorio">
                    <span class="song-number">${index + 1}</span>
                    <div class="song-details">
                        <span class="song-title-repertorio">${this._esc(musica.titulo)}</span>
                        <span class="song-artist-repertorio">${this._esc(musica.artista || '')}</span>
                    </div>
                </div>
                <div class="song-vocal-key-repertorio">
                    ${vocalSelect}
                    ${tomSelect}
                </div>
                <div class="song-actions-repertorio">
                    <button class="btn-icon btn-sm btn-remove-song" data-dia="${dia}" data-secao="${secao}" data-index="${index}" title="Remover">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
            `;

            container.appendChild(item);
        });
    }

    _toggleSecao(secao, ativo) {
        const containers = document.querySelectorAll(`[data-secao="${secao}"] .songs-list-repertorio, [data-secao="${secao}"] .btn-add-song-repertorio`);
        containers.forEach(el => {
            el.style.display = ativo ? 'block' : 'none';
        });
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    updateSubTabContent(activeSubTab) {
        this.subTabPanels.forEach(panel => panel.classList.remove('active'));
        const target = document.getElementById(activeSubTab);
        if (target) target.classList.add('active');

        this.subTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.subtab === activeSubTab);
        });

        this.currentDia = activeSubTab.replace('subtab-', '');
    }
}
