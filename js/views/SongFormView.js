// js/views/SongFormView.js

export class SongFormView {
    constructor() {
        this.modal = document.getElementById('songModal');
        this.form = document.getElementById('songForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.btnCloseModal = document.getElementById('btnCloseModal');
        this.btnCancelSong = document.getElementById('btnCancelSong');
        
        this.inputId = document.getElementById('songId');
        this.inputTitle = document.getElementById('songTitle');
        this.inputCategory = document.getElementById('songCategory');
        this.inputArtist = document.getElementById('songArtist');
        this.inputLyrics = document.getElementById('songLyrics');
        this.inputYoutube = document.getElementById('songYoutube');
        this.btnSearchYoutube = document.getElementById('btnSearchYoutube');
        this.btnFetchLyrics = document.getElementById('btnFetchLyrics');
        this.btnExpandLyrics = document.getElementById('btnExpandLyrics');
        this.inputCifraUrl = document.getElementById('songCifraUrl');
        
        this.vocalConfigsList = document.getElementById('vocalConfigsList');
        this.btnAddVocalConfig = document.getElementById('btnAddVocalConfig');
        
        this.btnAddVocalConfig.addEventListener('click', () => this.addVocalConfigRow());
    }

    addVocalConfigRow(vocalist = '', key = '') {
        const row = document.createElement('div');
        row.className = 'vocal-config-row';
        row.innerHTML = `
            <button type="button" class="btn-icon vc-move-up" title="Mover para cima"><i class="ph ph-caret-up"></i></button>
            <button type="button" class="btn-icon vc-move-down" title="Mover para baixo"><i class="ph ph-caret-down"></i></button>
            <input type="text" class="vc-vocalist" placeholder="Vocalista" value="${this._esc(vocalist)}">
            <select class="vc-key">
                <option value="">Tom</option>
                <option value="C"${key==='C'?' selected':''}>C</option>
                <option value="Cm"${key==='Cm'?' selected':''}>Cm</option>
                <option value="C#"${key==='C#'?' selected':''}>C#</option>
                <option value="C#m"${key==='C#m'?' selected':''}>C#m</option>
                <option value="Db"${key==='Db'?' selected':''}>Db</option>
                <option value="Dbm"${key==='Dbm'?' selected':''}>Dbm</option>
                <option value="D"${key==='D'?' selected':''}>D</option>
                <option value="Dm"${key==='Dm'?' selected':''}>Dm</option>
                <option value="D#"${key==='D#'?' selected':''}>D#</option>
                <option value="D#m"${key==='D#m'?' selected':''}>D#m</option>
                <option value="Eb"${key==='Eb'?' selected':''}>Eb</option>
                <option value="Ebm"${key==='Ebm'?' selected':''}>Ebm</option>
                <option value="E"${key==='E'?' selected':''}>E</option>
                <option value="Em"${key==='Em'?' selected':''}>Em</option>
                <option value="F"${key==='F'?' selected':''}>F</option>
                <option value="Fm"${key==='Fm'?' selected':''}>Fm</option>
                <option value="F#"${key==='F#'?' selected':''}>F#</option>
                <option value="F#m"${key==='F#m'?' selected':''}>F#m</option>
                <option value="Gb"${key==='Gb'?' selected':''}>Gb</option>
                <option value="Gbm"${key==='Gbm'?' selected':''}>Gbm</option>
                <option value="G"${key==='G'?' selected':''}>G</option>
                <option value="Gm"${key==='Gm'?' selected':''}>Gm</option>
                <option value="G#"${key==='G#'?' selected':''}>G#</option>
                <option value="G#m"${key==='G#m'?' selected':''}>G#m</option>
                <option value="Ab"${key==='Ab'?' selected':''}>Ab</option>
                <option value="Abm"${key==='Abm'?' selected':''}>Abm</option>
                <option value="A"${key==='A'?' selected':''}>A</option>
                <option value="Am"${key==='Am'?' selected':''}>Am</option>
                <option value="A#"${key==='A#'?' selected':''}>A#</option>
                <option value="A#m"${key==='A#m'?' selected':''}>A#m</option>
                <option value="Bb"${key==='Bb'?' selected':''}>Bb</option>
                <option value="Bbm"${key==='Bbm'?' selected':''}>Bbm</option>
                <option value="B"${key==='B'?' selected':''}>B</option>
                <option value="Bm"${key==='Bm'?' selected':''}>Bm</option>
            </select>
            <button type="button" class="btn-icon vc-remove" title="Remover"><i class="ph ph-x"></i></button>
        `;
        row.querySelector('.vc-remove').addEventListener('click', () => row.remove());
        row.querySelector('.vc-move-up').addEventListener('click', () => {
            const prev = row.previousElementSibling;
            if (prev) this.vocalConfigsList.insertBefore(row, prev);
        });
        row.querySelector('.vc-move-down').addEventListener('click', () => {
            const next = row.nextElementSibling;
            if (next) this.vocalConfigsList.insertBefore(next, row);
        });
        this.vocalConfigsList.appendChild(row);
    }

    getVocalConfigs() {
        const rows = this.vocalConfigsList.querySelectorAll('.vocal-config-row');
        const configs = [];
        rows.forEach(row => {
            const vocalist = row.querySelector('.vc-vocalist').value.trim();
            const key = row.querySelector('.vc-key').value;
            if (vocalist) {
                configs.push({ vocalist, key });
            }
        });
        return configs;
    }

    openModal(song = null, defaultCategory = 'louvor') {
        this.vocalConfigsList.innerHTML = '';
        
        if (song) {
            this.modalTitle.textContent = 'Editar Música';
            this.inputId.value = song.id;
            this.inputTitle.value = song.title || '';
            this.inputCategory.value = song.type || defaultCategory;
            this.inputArtist.value = song.artist || '';
            this.inputLyrics.value = song.lyrics || '';
            this.inputYoutube.value = song.youtubeUrl || '';
            this.inputCifraUrl.value = song.cifraUrl || '';
            
            if (song.vocalConfigs && song.vocalConfigs.length > 0) {
                song.vocalConfigs.forEach(vc => {
                    this.addVocalConfigRow(vc.vocalist, vc.key);
                });
            } else if (song.vocal || song.key) {
                this.addVocalConfigRow(song.vocal || '', song.key || '');
            }
        } else {
            this.modalTitle.textContent = 'Nova Música';
            this.form.reset();
            this.inputId.value = '';
            this.inputCategory.value = defaultCategory;
            this.addVocalConfigRow();
        }
        
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => this.inputTitle.focus(), 150);
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        this.form.reset();
        this.inputId.value = '';
        this.vocalConfigsList.innerHTML = '';
    }

    setLyrics(text) {
        if (this.inputLyrics) {
            this.inputLyrics.value = text;
        }
    }

    getFormData() {
        return {
            id: this.inputId.value || null,
            title: this.inputTitle.value.trim(),
            type: this.inputCategory.value,
            artist: this.inputArtist.value.trim(),
            vocalConfigs: this.getVocalConfigs(),
            lyrics: this.inputLyrics.value.trim(),
            youtubeUrl: this.inputYoutube.value.trim(),
            cifraUrl: this.inputCifraUrl.value.trim() || null
        };
    }

    bindEvents(handlers) {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const songData = this.getFormData();
            handlers.onSaveSong(songData);
        });

        this.btnCloseModal.addEventListener('click', () => this.closeModal());
        this.btnCancelSong.addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        if (this.btnSearchYoutube) {
            this.btnSearchYoutube.addEventListener('click', () => {
                handlers.onSearchYoutube({
                    title: this.inputTitle.value.trim(),
                    artist: this.inputArtist.value.trim()
                });
            });
        }

        if (this.btnFetchLyrics) {
            this.btnFetchLyrics.addEventListener('click', () => {
                handlers.onFetchLyrics({
                    title: this.inputTitle.value.trim(),
                    artist: this.inputArtist.value.trim()
                });
            });
        }

        if (this.btnExpandLyrics) {
            this.btnExpandLyrics.addEventListener('click', () => {
                handlers.onExpandLyrics();
            });
        }
    }

    _esc(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;');
    }
}
