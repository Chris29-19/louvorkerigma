// js/controllers/MainController.js
import { SongModel } from '../models/SongModel.js';
import { debounce, showToast, normalizeText, fetchLyrics } from '../utils/helpers.js';
import { dbOperations } from '../db/firebase.js';

export class MainController {
    /**
     * @param {import('../views/HomeView.js').HomeView} homeView 
     * @param {import('../views/SongFormView.js').SongFormView} formView 
     */
    constructor(homeView, formView) {
        this.homeView = homeView;
        this.formView = formView;
        
        // Current state
        this.currentSearch = '';
        this.isDarkTheme = localStorage.getItem('theme') === 'dark';

        this.initTheme();

        // Auth Modals
        this.btnAdmin = document.getElementById('btnAdmin');
        this.authModal = document.getElementById('authModal');
        this.authForm = document.getElementById('authForm');
        this.btnCloseAuth = document.getElementById('btnCloseAuth');
        this.btnCancelAuth = document.getElementById('btnCancelAuth');
        this.adminPassword = document.getElementById('adminPassword');
        
        // Admin Panel Modals
        this.adminPanelModal = document.getElementById('adminPanelModal');
        this.btnCloseAdminPanel = document.getElementById('btnCloseAdminPanel');
        this.btnCancelAdminPanel = document.getElementById('btnCancelAdminPanel');
        this.btnLogoutAdmin = document.getElementById('btnLogoutAdmin');
        this.btnExportData = document.getElementById('btnExportData');
        this.btnImportData = document.getElementById('btnImportData');
        this.fileImportData = document.getElementById('fileImportData');
        
        // Excel Import
        this.btnImportExcel = document.getElementById('btnImportExcel');
        this.fileImportExcel = document.getElementById('fileImportExcel');
        this.importCategory = document.getElementById('importCategory');
        
        // Logo Upload
        this.fileLogoUpload = document.getElementById('fileLogoUpload');
        this.btnUploadLogo = document.getElementById('btnUploadLogo');
        this.btnRemoveLogo = document.getElementById('btnRemoveLogo');
        
        // Colors
        this.colorBrand = document.getElementById('colorBrand');
        this.colorHeader = document.getElementById('colorHeader');
        this.btnResetColors = document.getElementById('btnResetColors');

        // Vocal Presets
        this.presetList = document.getElementById('presetList');
        this.presetVocalist = document.getElementById('presetVocalist');
        this.presetKey = document.getElementById('presetKey');
        this.btnSavePreset = document.getElementById('btnSavePreset');

        // YouTube Player Modal
        this.youtubeModal = document.getElementById('youtubeModal');
        this.youtubePlayerTitle = document.getElementById('youtubePlayerTitle');
        this.youtubePlayerFrame = document.getElementById('youtubePlayerFrame');
        this.btnCloseYoutube = document.getElementById('btnCloseYoutube');
        this.btnCloseYoutubePlayer = document.getElementById('btnCloseYoutubePlayer');
        this.btnOpenYoutubeApp = document.getElementById('btnOpenYoutubeApp');

        // YouTube API Key
        this.youtubeApiKeyInput = document.getElementById('youtubeApiKey');
        this.btnSaveYoutubeApiKey = document.getElementById('btnSaveYoutubeApiKey');
        this.youTubeApiKey = '';

        // Gemini AI Key
        this.geminiApiKeyInput = document.getElementById('geminiApiKey');
        this.btnSaveGeminiApiKey = document.getElementById('btnSaveGeminiApiKey');
        this.geminiApiKey = localStorage.getItem('geminiApiKey') || '';
        this._aiChatHistory = [];

        // Identity (Brand Title + Footer)
        this.brandTitleInput = document.getElementById('brandTitleInput');
        this.footerTextInput = document.getElementById('footerTextInput');
        this.btnSaveIdentity = document.getElementById('btnSaveIdentity');
        this.brandTitle = document.getElementById('brandTitle');
        this.footerText = document.getElementById('footerText');

        // Bind events
        this.homeView.bindEvents({
            onSearchAdoracao: debounce(this.handleSearchAdoracao.bind(this), 300),
            onSearchLouvor: debounce(this.handleSearchLouvor.bind(this), 300),
            onThemeToggle: this.handleThemeToggle.bind(this),
            onAddSongClick: this.handleAddSongClick.bind(this),
            onEditSongClick: this.handleEditSongClick.bind(this),
            onDeleteSongClick: this.handleDeleteSongClick.bind(this),
            onDuplicateSongClick: this.handleDuplicateSongClick.bind(this),
            onYoutubeWatch: this.handleYoutubeWatch.bind(this),
            onYoutubeOpenApp: this.handleYoutubeOpenApp.bind(this),
            onViewLyrics: this.handleViewLyrics.bind(this),
            onPeriodoChange: this.handlePeriodoChange.bind(this),
            onSalvarPeriodo: this.handleSalvarPeriodo.bind(this),
            onDeletarPeriodo: this.handleDeletarPeriodo.bind(this),
            onCompartilhar: this.handleCompartilhar.bind(this),
            onShowToast: (msg, type) => showToast(msg, type),
            onToggleChange: this.handleToggleChange.bind(this),
            onAddSongRepertorio: this.handleAddSongRepertorio.bind(this),
            onRemoveSongRepertorio: this.handleRemoveSongRepertorio.bind(this),
            onReplaceSongRepertorio: this.handleReplaceSongRepertorio.bind(this),
            onRepertorioFieldChange: this.handleRepertorioFieldChange.bind(this)
        });

        this.formView.bindEvents({
            onSaveSong: this.handleSaveSong.bind(this),
            onSearchYoutube: this.handleSearchYoutube.bind(this),
            onFetchLyrics: this.handleFetchLyrics.bind(this),
            onExpandLyrics: this.handleExpandLyrics.bind(this)
        });
        
        this.bindAuthEvents();
        this.bindFooterEvents();
    }

    bindFooterEvents() {
        const btnSugestoes = document.getElementById('btnSugestoes');
        const sugestoesModal = document.getElementById('sugestoesModal');
        const btnCloseSugestoes = document.getElementById('btnCloseSugestoes');
        const btnEnviarSugestao = document.getElementById('btnEnviarSugestao');
        const obrigadoModal = document.getElementById('obrigadoModal');
        const maisModal = document.getElementById('maisModal');
        const btnMais = document.getElementById('btnMais');
        const btnSobre = document.getElementById('btnSobre');
        const sobreModal = document.getElementById('sobreModal');
        const btnCloseSobre = document.getElementById('btnCloseSobre');
        const btnFooterAddSong = document.getElementById('btnFooterAddSong');
        const btnCloseAdminSugestoes = document.getElementById('btnCloseAdminSugestoes');
        const adminSugestoesModal = document.getElementById('adminSugestoesModal');

        // Hide footer + by default
        if (btnFooterAddSong) btnFooterAddSong.style.display = 'none';

        // Sugestões open/close
        if (btnSugestoes) btnSugestoes.addEventListener('click', () => sugestoesModal.classList.add('active'));
        if (btnCloseSugestoes) btnCloseSugestoes.addEventListener('click', () => sugestoesModal.classList.remove('active'));
        if (sugestoesModal) sugestoesModal.addEventListener('click', (e) => {
            if (e.target === sugestoesModal) sugestoesModal.classList.remove('active');
        });

        // Enviar sugestão
        if (btnEnviarSugestao) {
            btnEnviarSugestao.addEventListener('click', async () => {
                const nome = document.getElementById('sugestaoNome').value.trim();
                const texto = document.getElementById('sugestaoTexto').value.trim();
                if (!texto) { showToast("Escreva sua sugestão", "error"); return; }
                try {
                    await SongModel.addSugestao(nome || 'Anônimo', texto);
                    sugestoesModal.classList.remove('active');
                    document.getElementById('sugestaoNome').value = '';
                    document.getElementById('sugestaoTexto').value = '';
                    obrigadoModal.classList.add('active');
                    setTimeout(() => obrigadoModal.classList.remove('active'), 2000);
                } catch (err) { showToast("Erro ao enviar", "error"); }
            });
        }

        // Obrigado close on click
        if (obrigadoModal) obrigadoModal.addEventListener('click', () => obrigadoModal.classList.remove('active'));

        // Mais open/close
        if (btnMais) btnMais.addEventListener('click', () => maisModal.classList.add('active'));
        if (maisModal) maisModal.addEventListener('click', (e) => {
            if (e.target === maisModal) maisModal.classList.remove('active');
        });

        // Sobre open/close
        if (btnSobre) {
            btnSobre.addEventListener('click', () => {
                maisModal.classList.remove('active');
                sobreModal.classList.add('active');
            });
        }
        if (btnCloseSobre) btnCloseSobre.addEventListener('click', () => sobreModal.classList.remove('active'));
        if (sobreModal) sobreModal.addEventListener('click', (e) => {
            if (e.target === sobreModal) sobreModal.classList.remove('active');
        });

        // Admin sugestões close
        if (btnCloseAdminSugestoes) btnCloseAdminSugestoes.addEventListener('click', () => adminSugestoesModal.classList.remove('active'));
        if (adminSugestoesModal) adminSugestoesModal.addEventListener('click', (e) => {
            if (e.target === adminSugestoesModal) adminSugestoesModal.classList.remove('active');
        });

        // Footer + button triggers same as header add song
        if (btnFooterAddSong) {
            btnFooterAddSong.addEventListener('click', () => {
                this.formView.openModal();
                setTimeout(() => document.getElementById('musicName')?.focus(), 100);
            });
        }
    }

    bindAuthEvents() {
        // Gear Button click
        if (this.btnAdmin) {
            this.btnAdmin.addEventListener('click', () => {
                if (this.isAdmin) {
                    this.adminPanelModal.classList.add('active');
                } else {
                    this.authModal.classList.add('active');
                    setTimeout(() => this.adminPassword.focus(), 100);
                }
            });
        }

        // Auth Form submit
        if (this.authForm) {
            this.authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.adminPassword.value === 'admin123') { // Senha hardcoded
                    this.setAdminMode(true);
                    this.authModal.classList.remove('active');
                    this.authForm.reset();
                    showToast("Modo Administrador ativado!");
                } else {
                    showToast("Senha incorreta", "error");
                }
            });
        }

        // Auth close buttons
        const closeAuth = () => { this.authModal.classList.remove('active'); this.authForm.reset(); };
        if (this.btnCloseAuth) this.btnCloseAuth.addEventListener('click', closeAuth);
        if (this.btnCancelAuth) this.btnCancelAuth.addEventListener('click', closeAuth);
        
        // Admin Panel Close
        const closePanel = () => { this.adminPanelModal.classList.remove('active'); };
        if (this.btnCloseAdminPanel) this.btnCloseAdminPanel.addEventListener('click', closePanel);
        if (this.btnCancelAdminPanel) this.btnCancelAdminPanel.addEventListener('click', closePanel);

        // Logout
        if (this.btnLogoutAdmin) {
            this.btnLogoutAdmin.addEventListener('click', () => {
                this.setAdminMode(false);
                closePanel();
                showToast("Sessão encerrada");
            });
        }

        // Bulk Fetch Lyrics
        const btnBulkFetch = document.getElementById('btnBulkFetchLyrics');
        if (btnBulkFetch) {
            btnBulkFetch.addEventListener('click', () => {
                if (confirm("Buscar letras automaticamente para todas as músicas sem letra? Isso pode levar alguns minutos.")) {
                    this.handleBulkFetchLyrics();
                }
            });
        }

        // Close Lyrics Expand Modal
        const closeExpand = () => {
            document.getElementById('lyricsExpandModal').classList.remove('active');
            document.getElementById('lyricsExpandModal').setAttribute('aria-hidden', 'true');
        };
        const btnCloseExpand = document.getElementById('btnCloseLyricsExpand');
        const btnCloseExpandFooter = document.getElementById('btnCloseLyricsExpandFooter');
        if (btnCloseExpand) btnCloseExpand.addEventListener('click', closeExpand);
        if (btnCloseExpandFooter) btnCloseExpandFooter.addEventListener('click', closeExpand);
        const expandModal = document.getElementById('lyricsExpandModal');
        if (expandModal) {
            expandModal.addEventListener('click', (e) => {
                if (e.target === expandModal) closeExpand();
            });
        }

        // Close Lyrics View Modal
        const closeView = () => {
            document.getElementById('lyricsViewModal').classList.remove('active');
            document.getElementById('lyricsViewModal').setAttribute('aria-hidden', 'true');
        };
        const btnCloseView = document.getElementById('btnCloseLyricsView');
        const btnCloseViewFooter = document.getElementById('btnCloseLyricsViewFooter');
        if (btnCloseView) btnCloseView.addEventListener('click', closeView);
        if (btnCloseViewFooter) btnCloseViewFooter.addEventListener('click', closeView);
        const viewModal = document.getElementById('lyricsViewModal');
        if (viewModal) {
            viewModal.addEventListener('click', (e) => {
                if (e.target === viewModal) closeView();
            });
        }

        // Export Backup
        if (this.btnExportData) {
            this.btnExportData.addEventListener('click', async () => {
                try {
                    const jsonStr = await SongModel.exportData();
                    const blob = new Blob([jsonStr], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup-louvor-${new Date().toISOString().slice(0,10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                } catch (error) {
                    showToast("Erro ao exportar", "error");
                }
            });
        }

        // Import Backup Click
        if (this.btnImportData) {
            this.btnImportData.addEventListener('click', () => {
                if(confirm("ATENÇÃO: Importar um backup irá apagar todas as músicas atuais e substituí-las. Deseja continuar?")) {
                    this.fileImportData.click();
                }
            });
        }

        // File Input Change
        if (this.fileImportData) {
            this.fileImportData.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        await SongModel.importData(event.target.result);
                        showToast("Backup importado com sucesso!");
                        this.fileImportData.value = '';
                        closePanel();
                        await this.loadData();
                    } catch (err) {
                        showToast("Falha ao importar backup. Arquivo inválido.", "error");
                    }
                };
                reader.readAsText(file);
            });
        }

        // Excel Import Click
        if (this.btnImportExcel) {
            this.btnImportExcel.addEventListener('click', () => {
                this.fileImportExcel.click();
            });
        }

        // Excel File Change (Read with SheetJS)
        if (this.fileImportExcel) {
            this.fileImportExcel.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const data = new Uint8Array(event.target.result);
                        if (typeof XLSX === 'undefined') {
                            showToast("Carregando biblioteca Excel...", "info");
                            try {
                                await new Promise((resolve, reject) => {
                                    const s = document.createElement('script');
                                    s.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
                                    s.onload = resolve;
                                    s.onerror = reject;
                                    document.head.appendChild(s);
                                });
                            } catch {
                                showToast("Falha ao carregar biblioteca Excel.", "error");
                                return;
                            }
                        }
                        
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", header: 1 });
                        
                        if (rows.length === 0) {
                            showToast("A planilha está vazia.", "error");
                            return;
                        }

                        // Detecta a linha de cabeçalho (procura por palavras-chave)
                        const headerKeywords = ['nome', 'música', 'musica', 'titulo', 'title', 'hino'];
                        let headerRowIndex = -1;
                        let headers = [];

                        for (let i = 0; i < Math.min(rows.length, 5); i++) {
                            const row = rows[i];
                            const rowStr = row.join(' ').toLowerCase();
                            if (headerKeywords.some(kw => rowStr.includes(kw))) {
                                headerRowIndex = i;
                                headers = row.map(h => String(h).trim().toLowerCase());
                                break;
                            }
                        }

                        // Se não achou cabeçalho, assume a primeira linha
                        if (headerRowIndex === -1) {
                            headerRowIndex = 0;
                            headers = rows[0].map(h => String(h).trim().toLowerCase());
                        }

                        const dataRows = rows.slice(headerRowIndex + 1);

                        // Mapeia colunas por palavras-chave
                        const findCol = (keywords) => {
                            const idx = headers.findIndex(h => keywords.some(kw => h.includes(kw)));
                            return idx >= 0 ? idx : -1;
                        };

                        const colTitle = findCol(['nome', 'música', 'musica', 'titulo', 'title', 'hino']);
                        const colArtist = findCol(['cantor', 'banda', 'artista', 'artist', 'autor']);
                        const colVocal = findCol(['vocal', 'quem canta', 'ministro', 'vocalista']);
                        const colKey = findCol(['tom', 'nota', 'key']);
                        const colBpm = findCol(['bpm', 'velocidade', 'tempo']);
                        const colLyrics = findCol(['letra', 'lyrics', 'cifra']);

                        if (colTitle === -1) {
                            showToast("Não encontrei a coluna de título. Verifique se a planilha tem uma coluna com 'Nome', 'Música' ou 'Título'.", "error");
                            return;
                        }

                        let importCount = 0;
                        const selectedCategory = this.importCategory ? this.importCategory.value : 'louvor';

                        for (const row of dataRows) {
                            if (!row || row.length === 0) continue;

                            const title = colTitle >= 0 ? String(row[colTitle] || '').trim() : '';
                            if (!title) continue;

                            const getVal = (colIdx) => colIdx >= 0 ? String(row[colIdx] || '').trim() : '';

                            await SongModel.addSong({
                                title: title,
                                type: selectedCategory,
                                artist: getVal(colArtist),
                                vocal: getVal(colVocal),
                                key: getVal(colKey).toUpperCase(),
                                bpm: getVal(colBpm),
                                lyrics: getVal(colLyrics),
                            });
                            importCount++;
                        }

                        showToast(`${importCount} músicas importadas em "${selectedCategory === 'adoracao' ? 'Adoração' : 'Louvor'}"!`);
                        this.fileImportExcel.value = '';
                        closePanel();
                        await this.loadData();

                    } catch (err) {
                        console.error(err);
                        showToast("Falha ao ler o arquivo Excel.", "error");
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        // Logo Upload Click
        if (this.btnUploadLogo) {
            this.btnUploadLogo.addEventListener('click', () => {
                this.fileLogoUpload.click();
            });
        }

        // Logo File Change (Read as Base64)
        if (this.fileLogoUpload) {
            this.fileLogoUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                    showToast("A imagem deve ter no máximo 2MB", "error");
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    const base64Str = event.target.result;
                    await dbOperations.saveSettings({ customLogo: base64Str });
                    this.homeView.updateLogo(base64Str);
                    if (this.btnRemoveLogo) this.btnRemoveLogo.style.display = 'block';
                    showToast("Logomarca atualizada com sucesso!");
                    this.fileLogoUpload.value = '';
                };
                reader.readAsDataURL(file);
            });
        }

        // Remove Logo
        if (this.btnRemoveLogo) {
            this.btnRemoveLogo.addEventListener('click', async () => {
                await dbOperations.saveSettings({ customLogo: null });
                this.homeView.updateLogo(null);
                this.btnRemoveLogo.style.display = 'none';
                showToast("Logomarca removida!");
            });
        }

        // Theme Colors
        if (this.colorBrand) {
            this.colorBrand.addEventListener('input', async (e) => {
                const color = e.target.value;
                document.documentElement.style.setProperty('--color-brand-primary', color);
                await dbOperations.saveSettings({ customColorBrand: color });
            });
        }

        if (this.colorHeader) {
            this.colorHeader.addEventListener('input', async (e) => {
                const color = e.target.value;
                document.documentElement.style.setProperty('--color-table-header-bg', color);
                document.documentElement.style.setProperty('--color-table-header-text', '#FFFFFF');
                await dbOperations.saveSettings({ customColorHeader: color });
            });
        }

        if (this.btnResetColors) {
            this.btnResetColors.addEventListener('click', async () => {
                await dbOperations.saveSettings({ customColorBrand: null, customColorHeader: null });
                document.documentElement.style.removeProperty('--color-brand-primary');
                document.documentElement.style.removeProperty('--color-table-header-bg');
                document.documentElement.style.removeProperty('--color-table-header-text');
                if (this.colorBrand) this.colorBrand.value = '#6366F1';
                if (this.colorHeader) this.colorHeader.value = '#F1F5F9';
                showToast("Cores restauradas para o padrão!");
            });
        }

        // Vocal Presets
        if (this.btnSavePreset) {
            this.btnSavePreset.addEventListener('click', async () => {
                const vocalist = this.presetVocalist.value.trim();
                const key = this.presetKey.value;
                if (!vocalist || !key) {
                    showToast("Preencha o vocalista e o tom.", "error");
                    return;
                }
                await SongModel.savePreset(vocalist, key);
                showToast(`Predefinição salva: ${vocalist} → ${key}`);
                this.presetVocalist.value = '';
                this.presetKey.value = '';
                await this.loadPresets();
            });
        }

        // Save YouTube API Key
        if (this.btnSaveYoutubeApiKey) {
            this.btnSaveYoutubeApiKey.addEventListener('click', async () => {
                const key = this.youtubeApiKeyInput.value.trim();
                await dbOperations.saveSettings({ youtubeApiKey: key });
                this.youTubeApiKey = key;
                showToast("Chave da API YouTube salva!");
            });
        }

        // Save Gemini API Key
        if (this.btnSaveGeminiApiKey) {
            this.btnSaveGeminiApiKey.addEventListener('click', async () => {
                const key = this.geminiApiKeyInput.value.trim();
                this.geminiApiKey = key;
                localStorage.setItem('geminiApiKey', key);
                await dbOperations.saveSettings({ geminiApiKey: key });
                showToast(key ? "Chave Gemini salva! IA pronta para uso." : "Chave Gemini removida.");
                this._updateAiKeyWarning();
            });
        }

        // Save Identity (Brand Title + Footer)
        if (this.btnSaveIdentity) {
            this.btnSaveIdentity.addEventListener('click', async () => {
                const title = this.brandTitleInput.value.trim();
                const footer = this.footerTextInput.value.trim();
                if (title) {
                    await dbOperations.saveSettings({ brandTitle: title });
                    this.brandTitle.textContent = title;
                }
                if (footer !== '') {
                    await dbOperations.saveSettings({ footerText: footer });
                    this.footerText.textContent = footer;
                }
                showToast("Identidade salva com sucesso!");
            });
        }

        // View Sugestões (admin)
        const btnViewSugestoes = document.getElementById('btnViewSugestoes');
        if (btnViewSugestoes) {
            btnViewSugestoes.addEventListener('click', async () => {
                this.adminPanelModal.classList.remove('active');
                const modal = document.getElementById('adminSugestoesModal');
                const list = document.getElementById('adminSugestoesList');
                list.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Carregando...</p>';
                modal.classList.add('active');
                try {
                    const sugestoes = await SongModel.getSugestoes();
                    if (!sugestoes || sugestoes.length === 0) {
                        list.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Nenhuma sugestão ainda.</p>';
                        return;
                    }
                    list.innerHTML = sugestoes.map(s => `
                        <div style="background: var(--color-bg-elevated); border-radius: var(--radius-md); padding: 12px; margin-bottom: 8px; position: relative;">
                            <strong style="font-size: 0.85rem; color: var(--color-text-primary);">${s.nome || 'Anônimo'}</strong>
                            <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--color-text-muted);">${s.texto}</p>
                            <p style="margin: 6px 0 0; font-size: 0.65rem; color: var(--color-text-muted); opacity: 0.6;">${s.criadoEm ? new Date(s.criadoEm).toLocaleString('pt-BR') : ''}</p>
                            <button class="btn-delete-sugestao" data-id="${s.id}" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--color-danger); cursor: pointer; font-size: 1rem;">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    `).join('');
                    list.querySelectorAll('.btn-delete-sugestao').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const id = btn.getAttribute('data-id');
                            await SongModel.deleteSugestao(id);
                            btn.closest('div').remove();
                            if (list.children.length === 0) {
                                list.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Nenhuma sugestão ainda.</p>';
                            }
                        });
                    });
                } catch (err) {
                    list.innerHTML = '<p style="color: var(--color-danger); text-align: center;">Erro ao carregar sugestões.</p>';
                }
            });
        }
    }

    setAdminMode(active) {
        this.isAdmin = active;
        const btnFooterAddSong = document.getElementById('btnFooterAddSong');
        
        if (active) {
            document.body.classList.add('admin-mode');
            localStorage.setItem('isAdmin', 'true');
            if (btnFooterAddSong) btnFooterAddSong.style.display = 'flex';
        } else {
            document.body.classList.remove('admin-mode');
            localStorage.removeItem('isAdmin');
            if (btnFooterAddSong) btnFooterAddSong.style.display = 'none';
        }
    }

    async loadPresets() {
        try {
            const presets = await SongModel.getPresets();
            this.vocalPresets = presets;
            this.renderPresets(presets);
        } catch (err) {
            console.error("Failed to load presets", err);
        }
    }

    renderPresets(presets) {
        if (!this.presetList) return;
        if (presets.length === 0) {
            this.presetList.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.8rem;">Nenhuma predefinição salva.</p>';
            return;
        }
        this.presetList.innerHTML = '';
        presets.forEach(p => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-bottom:1px solid var(--color-border); font-size:0.85rem;';
            item.innerHTML = `
                <span><strong>${p.vocalist}</strong> → ${p.key}</span>
                <button class="btn-icon" style="width:28px;height:28px;font-size:0.9rem;" data-id="${p.id}" title="Excluir">
                    <i class="ph ph-x"></i>
                </button>
            `;
            item.querySelector('button').addEventListener('click', async () => {
                await SongModel.deletePreset(p.id);
                await this.loadPresets();
                showToast("Predefinição removida!");
            });
            this.presetList.appendChild(item);
        });
    }

    async init() {
        // Load settings from Firestore
        try {
            const settings = await dbOperations.getSettings();
            
            // Load Custom Logo
            if (settings.customLogo) {
                this.homeView.updateLogo(settings.customLogo);
                if(this.btnRemoveLogo) this.btnRemoveLogo.style.display = 'block';
            }

            // Load Custom Colors
            if (settings.customColorBrand) {
                document.documentElement.style.setProperty('--color-brand-primary', settings.customColorBrand);
                if(this.colorBrand) this.colorBrand.value = settings.customColorBrand;
            }
            
            if (settings.customColorHeader) {
                document.documentElement.style.setProperty('--color-table-header-bg', settings.customColorHeader);
                document.documentElement.style.setProperty('--color-table-header-text', '#FFFFFF');
                if(this.colorHeader) this.colorHeader.value = settings.customColorHeader;
            }

            // Load Brand Title
            if (settings.brandTitle && this.brandTitle) {
                this.brandTitle.textContent = settings.brandTitle;
                if (this.brandTitleInput) this.brandTitleInput.value = settings.brandTitle;
            }

            // Load Footer Text
            if (settings.footerText !== null && settings.footerText !== undefined && this.footerText) {
                this.footerText.textContent = settings.footerText;
                if (this.footerTextInput) this.footerTextInput.value = settings.footerText;
            }

            // Load YouTube API Key
            if (settings.youtubeApiKey) {
                this.youTubeApiKey = settings.youtubeApiKey;
                if (this.youtubeApiKeyInput) this.youtubeApiKeyInput.value = settings.youtubeApiKey;
            }

            // Load Gemini API Key (also stored locally for speed)
            if (settings.geminiApiKey) {
                this.geminiApiKey = settings.geminiApiKey;
                localStorage.setItem('geminiApiKey', settings.geminiApiKey);
                if (this.geminiApiKeyInput) this.geminiApiKeyInput.value = settings.geminiApiKey;
            } else if (this.geminiApiKey && this.geminiApiKeyInput) {
                // Show what was found in localStorage
                this.geminiApiKeyInput.value = this.geminiApiKey;
            }
        } catch (error) {
            console.error("Failed to load settings from Firestore", error);
        }

        // Check admin state on load
        if (localStorage.getItem('isAdmin') === 'true') {
            this.setAdminMode(true);
        }

        // Load version from changelog into Sobre modal
        try {
            const sobreVersion = document.getElementById('sobreVersion');
            if (sobreVersion && window.CHANGELOG) {
                sobreVersion.textContent = `Versão ${window.CHANGELOG.version}`;
            }
            const sobreAppName = document.getElementById('sobreAppName');
            if (sobreAppName && settings.brandTitle) {
                sobreAppName.textContent = settings.brandTitle;
            }
            const sobreLogoImg = document.getElementById('sobreLogoImg');
            const sobreLogoIcon = document.getElementById('sobreLogoIcon');
            if (settings.customLogo && sobreLogoImg) {
                sobreLogoImg.src = settings.customLogo;
                sobreLogoImg.style.display = 'block';
                if (sobreLogoIcon) sobreLogoIcon.style.display = 'none';
            }
        } catch (e) { /* changelog not loaded */ }

        await this.loadData();
        await this.loadPresets();
        this.bindYouTubeModalEvents();
        this.bindAiChatEvents();

        // Check URL for shared repertório link
        const urlParams = new URLSearchParams(window.location.search);
        const repParam = urlParams.get('rep');
        if (repParam) {
            await this.loadPeriodos();
            this.homeView.setSelectedPeriodo(repParam);
            await this.handlePeriodoChange(repParam);
            
            // Switch to repertório tab
            const repTab = document.getElementById('tabBtnRepertorio');
            if (repTab) {
                this.homeView.tabBtns.forEach(b => b.classList.remove('active'));
                this.homeView.tabPanels.forEach(p => p.classList.remove('active'));
                repTab.classList.add('active');
                document.getElementById('tab-repertorio').classList.add('active');
            }
        }

        // Auto-fill Tom when Vocalist changes
        const vocalInput = document.getElementById('songVocal');
        const keySelect = document.getElementById('songKey');
        if (vocalInput && keySelect) {
            vocalInput.addEventListener('input', () => {
                const val = vocalInput.value.trim().toLowerCase();
                if (this.vocalPresets && val) {
                    const match = this.vocalPresets.find(p => p.vocalist.toLowerCase() === val);
                    if (match) {
                        keySelect.value = match.key;
                    }
                }
            });
        }

        // Hide skeleton and show app
        const skeleton = document.getElementById('appSkeleton');
        const appContainer = document.querySelector('.app-loading');
        if (skeleton) {
            skeleton.classList.add('hidden');
            setTimeout(() => skeleton.remove(), 400);
        }
        if (appContainer) {
            appContainer.classList.remove('app-loading');
        }

        // Scroll to top button
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
            });
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    initTheme() {
        if (this.isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            // Check OS preference if no localStorage
            if(!localStorage.getItem('theme') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.isDarkTheme = true;
            }
            document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
        }
        this.homeView.setThemeIcon(this.isDarkTheme);
    }

    handleThemeToggle() {
        this.isDarkTheme = !this.isDarkTheme;
        document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
        this.homeView.setThemeIcon(this.isDarkTheme);
    }

    async loadData() {
        try {
            await this.renderAllTabs();
            await this.loadPeriodos();
        } catch (error) {
            console.error("Failed to load data", error);
            showToast("Erro ao carregar dados", "error");
        }
    }

    async renderAllTabs() {
        const allSongs = await SongModel.getAllSongs();
        this.homeView.setSongCache(allSongs);
        const adoracao = allSongs.filter(s => s.type === 'adoracao');
        const louvor = allSongs.filter(s => s.type === 'louvor');

        const qA = normalizeText(this.currentSearchAdoracao || '');
        const qL = normalizeText(this.currentSearchLouvor || '');

        this.homeView.renderAdoracao(qA ? adoracao.filter(s =>
            normalizeText(s.title).includes(qA) || normalizeText(s.artist).includes(qA)
        ) : adoracao);

        this.homeView.renderLouvor(qL ? louvor.filter(s =>
            normalizeText(s.title).includes(qL) || normalizeText(s.artist).includes(qL)
        ) : louvor);
    }

    handleSearchAdoracao(query) {
        this.currentSearchAdoracao = query;
        this.renderAllTabs();
    }

    handleSearchLouvor(query) {
        this.currentSearchLouvor = query;
        this.renderAllTabs();
    }

    handleAddSongClick() {
        const activeTab = document.querySelector('.tab-btn.active');
        const defaultCategory = activeTab?.dataset.tab === 'tab-adoracao' ? 'adoracao' : 'louvor';
        this.formView.openModal(null, defaultCategory);
    }

    async renderAllTabs() {
        const allSongs = await SongModel.getAllSongs();
        this.homeView.setSongCache(allSongs);
        const adoracao = allSongs.filter(s => s.type === 'adoracao');
        const louvor = allSongs.filter(s => s.type === 'louvor');

        const qA = normalizeText(this.currentSearchAdoracao || '');
        const qL = normalizeText(this.currentSearchLouvor || '');

        this.homeView.renderAdoracao(qA ? adoracao.filter(s =>
            normalizeText(s.title).includes(qA) || normalizeText(s.artist).includes(qA)
        ) : adoracao);

        this.homeView.renderLouvor(qL ? louvor.filter(s =>
            normalizeText(s.title).includes(qL) || normalizeText(s.artist).includes(qL)
        ) : louvor);
    }

    async handleEditSongClick(id) {
        try {
            const song = await SongModel.getSong(id);
            if (song) {
                this.formView.openModal(song);
            }
        } catch (error) {
            showToast("Erro ao carregar a música para edição", "error");
        }
    }

    async handleSaveSong(songData) {
        try {
            // ── Verificação de duplicata (apenas ao CRIAR nova música) ──
            if (!songData.id) {
                const allSongs = await SongModel.getAllSongs();
                const normalizeForDup = str => str
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .trim();

                const titleNorm = normalizeForDup(songData.title || '');
                const categoryLabel = songData.type === 'adoracao' ? 'Adoração' : 'Louvor';

                const duplicate = allSongs.find(s =>
                    s.type === songData.type &&
                    normalizeForDup(s.title || '') === titleNorm
                );

                if (duplicate) {
                    const confirmado = confirm(
                        `⚠️ Música duplicada!\n\n` +
                        `A música "${duplicate.title}" já existe em ${categoryLabel}.\n\n` +
                        `Deseja salvar mesmo assim?`
                    );
                    if (!confirmado) return;
                }
            }

            // Auto-fetch lyrics if empty
            if (!songData.lyrics && songData.title && songData.artist) {
                showToast("Buscando letra automaticamente...", "success");
                const lyrics = await fetchLyrics(songData.title, songData.artist);
                if (lyrics) {
                    songData.lyrics = lyrics;
                    showToast("Letra encontrada e salva!");
                }
            }

            if (songData.id) {
                await SongModel.updateSong(songData);
                showToast("Música atualizada com sucesso!");
            } else {
                delete songData.id;
                await SongModel.addSong(songData);
                showToast("Música adicionada com sucesso!");
            }
            this.formView.closeModal();
            await this.loadData(); // Reloads options and applies filters

        } catch (error) {
            console.error("Failed to save song", error);
            showToast("Erro ao salvar a música", "error");
        }
    }

    async handleDuplicateSongClick(id) {
        try {
            const song = await SongModel.getSong(id);
            if (song) {
                delete song.id; // ensure it creates a new one
                song.title = `${song.title} (Cópia)`;
                await SongModel.addSong(song);
                showToast("Música duplicada!");
                await this.loadData();
            }
        } catch (error) {
            console.error("Failed to duplicate song", error);
            showToast("Erro ao duplicar a música", "error");
        }
    }

    async handleDeleteSongClick(id) {
        if (confirm("Tem certeza que deseja excluir esta música?")) {
            try {
                await SongModel.deleteSong(id);
                showToast("Música excluída!");
                await this.loadData();
            } catch (error) {
                console.error("Failed to delete song", error);
                showToast("Erro ao excluir a música", "error");
            }
        }
    }

    // === YouTube Methods ===

    handleYoutubeWatch(videoId) {
        this.youtubePlayerFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        this.youtubeModal.classList.add('active');
        this.youtubeModal.setAttribute('aria-hidden', 'false');
    }

    handleYoutubeOpenApp(videoId) {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        window.open(url, '_blank');
    }

    async handleSearchYoutube({ title, artist }) {
        if (!this.youTubeApiKey) {
            showToast("Configure a chave da API do YouTube no Painel Admin", "error");
            return;
        }
        if (!title && !artist) {
            showToast("Preencha título ou artista para buscar", "error");
            return;
        }
        const query = encodeURIComponent(`${artist ? artist + ' - ' : ''}${title}`);
        try {
            const res = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${this.youTubeApiKey}`
            );
            if (!res.ok) {
                showToast("Erro na busca do YouTube. Verifique a API Key.", "error");
                return;
            }
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                const url = `https://www.youtube.com/watch?v=${videoId}`;
                this.formView.inputYoutube.value = url;
                showToast("Vídeo encontrado! Verifique o link.");
            } else {
                showToast("Nenhum vídeo encontrado para esta música.", "error");
            }
        } catch (err) {
            console.error("YouTube search failed", err);
            showToast("Erro ao buscar no YouTube", "error");
        }
    }

    async handleFetchLyrics({ title, artist }) {
        if (!title) {
            showToast("Preencha o título da música primeiro", "error");
            return;
        }
        if (!artist) {
            showToast("Preencha o artista/banda primeiro", "error");
            return;
        }

        showToast("Buscando letra...", "success");
        try {
            const lyrics = await fetchLyrics(title, artist);
            if (lyrics) {
                this.formView.setLyrics(lyrics);
                showToast("Letra encontrada e preenchida!");
            } else {
                showToast("Letra não encontrada. Tente preencher manualmente.", "error");
            }
        } catch (err) {
            console.error("Fetch lyrics failed", err);
            showToast("Erro ao buscar letra", "error");
        }
    }

    async handleExpandLyrics() {
        const textarea = document.getElementById('songLyrics');
        const text = textarea ? textarea.value.trim() : '';
        const title = document.getElementById('songTitle') ? document.getElementById('songTitle').value.trim() : 'Letra da Música';

        const modal = document.getElementById('lyricsExpandModal');
        const body = document.getElementById('lyricsExpandBody');
        const titleEl = document.getElementById('lyricsExpandTitle');

        if (!text) {
            showToast("Não há letra para exibir", "error");
            return;
        }

        titleEl.textContent = title;
        body.textContent = text;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    async handleViewLyrics(songId) {
        const song = await SongModel.getSong(songId);
        if (!song || !song.lyrics || !song.lyrics.trim()) {
            showToast("Esta música não possui letra cadastrada", "error");
            return;
        }

        const modal = document.getElementById('lyricsViewModal');
        const body = document.getElementById('lyricsViewBody');
        const titleEl = document.getElementById('lyricsViewTitle');
        const artistEl = document.getElementById('lyricsViewArtist');

        titleEl.textContent = song.title;
        artistEl.textContent = song.artist || '';
        body.textContent = song.lyrics;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    async handleBulkFetchLyrics() {
        const btn = document.getElementById('btnBulkFetchLyrics');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="ph ph-spinner" style="margin-right: 8px;"></i> Buscando...';
        }

        try {
            const allSongs = await SongModel.getAllSongs();
            const songsWithoutLyrics = allSongs.filter(s => !s.lyrics || !s.lyrics.trim());

            if (songsWithoutLyrics.length === 0) {
                showToast("Todas as músicas já possuem letra!");
                return;
            }

            let found = 0;
            let notFound = 0;
            const total = songsWithoutLyrics.length;

            for (let i = 0; i < total; i++) {
                const song = songsWithoutLyrics[i];
                showToast(`Buscando letras... ${i + 1}/${total}`, "success");

                try {
                    const lyrics = await fetchLyrics(song.title, song.artist);
                    if (lyrics) {
                        await SongModel.updateSong({ id: song.id, lyrics });
                        found++;
                    } else {
                        notFound++;
                    }
                } catch (err) {
                    console.warn(`Erro ao buscar letra de "${song.title}":`, err);
                    notFound++;
                }
            }

            showToast(`Concluído! ${found} encontradas, ${notFound} não encontradas.`);
            await this.loadData();
        } catch (err) {
            console.error("Bulk fetch failed", err);
            showToast("Erro ao buscar letras em massa", "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="ph ph-magic-wand" style="margin-right: 8px;"></i> Buscar Letras em Massa';
            }
        }
    }

    bindYouTubeModalEvents() {
        const closeYoutube = () => {
            this.youtubeModal.classList.remove('active');
            this.youtubeModal.setAttribute('aria-hidden', 'true');
            this.youtubePlayerFrame.src = '';
        };
        if (this.btnCloseYoutube) this.btnCloseYoutube.addEventListener('click', closeYoutube);
        if (this.btnCloseYoutubePlayer) this.btnCloseYoutubePlayer.addEventListener('click', closeYoutube);
        if (this.youtubeModal) {
            this.youtubeModal.addEventListener('click', (e) => {
                if (e.target === this.youtubeModal) closeYoutube();
            });
        }
        if (this.btnOpenYoutubeApp) {
            this.btnOpenYoutubeApp.addEventListener('click', () => {
                const src = this.youtubePlayerFrame.src;
                const match = src.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
                if (match) this.handleYoutubeOpenApp(match[1]);
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.youtubeModal.classList.contains('active')) {
                    this.youtubeModal.classList.remove('active');
                    this.youtubePlayerFrame.src = '';
                }
                const expandModal = document.getElementById('lyricsExpandModal');
                if (expandModal && expandModal.classList.contains('active')) {
                    expandModal.classList.remove('active');
                    expandModal.setAttribute('aria-hidden', 'true');
                }
                const viewModal = document.getElementById('lyricsViewModal');
                if (viewModal && viewModal.classList.contains('active')) {
                    viewModal.classList.remove('active');
                    viewModal.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    // === Repertório da Semana ===

    async handlePeriodoChange(periodoId) {
        if (!periodoId) {
            this.currentRepertorio = null;
            return;
        }
        try {
            const repertorio = await SongModel.getRepertorio(periodoId);
            this.currentRepertorio = repertorio;
            if (repertorio && repertorio.periodo) {
                this.homeView.setSelectedPeriodo(periodoId, repertorio.periodo);
            }
            this.homeView.renderRepertorio(repertorio);
        } catch (error) {
            console.error("Erro ao carregar repertório:", error);
            showToast("Erro ao carregar repertório", "error");
        }
    }

    handleSalvarPeriodo(nome) {
        // Gera ID baseado no nome (slugify simples)
        const id = nome
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '_' + Date.now();

        this._criarOuCarregarPeriodo(id, nome);
    }

    async _criarOuCarregarPeriodo(id, periodo) {
        try {
            // Verifica se já existe
            const existente = await SongModel.getRepertorio(id);
            if (!existente) {
                await SongModel.createRepertorio(id, periodo);
            }
            this.homeView.setSelectedPeriodo(id, periodo);
            await this.loadPeriodos();
            await this.handlePeriodoChange(id);
        } catch (error) {
            console.error("Erro ao criar/carregar período:", error);
            showToast("Erro ao criar período", "error");
        }
    }

    async loadPeriodos() {
        try {
            const periodos = await SongModel.getPeriodos();
            this.homeView.renderPeriodos(periodos);
        } catch (error) {
            console.error("Erro ao carregar períodos:", error);
        }
    }

    async handleDeletarPeriodo(periodoId) {
        if (!confirm("Tem certeza que deseja deletar este período?")) return;
        try {
            await SongModel.deleteRepertorio(periodoId);
            this.currentRepertorio = null;
            this.homeView.currentPeriodo = null;
            this.homeView.periodoSelect.value = '';
            this.homeView.periodoDataInicio.value = '';
            this.homeView.periodoDataFim.value = '';
            this.homeView.periodoMes.value = '';
            await this.loadPeriodos();

            // Limpa as listas renderizadas
            document.querySelectorAll('.songs-list-repertorio').forEach(el => {
                el.innerHTML = '<div class="empty-state-small"><p>Nenhuma música adicionada</p></div>';
            });

            showToast("Período deletado!");
        } catch (error) {
            console.error("Erro ao deletar período:", error);
            showToast("Erro ao deletar período", "error");
        }
    }

    async handleToggleChange(secao, ativo) {
        if (!this.currentRepertorio || !this.homeView.currentPeriodo) return;
        
        try {
            const updates = {};
            if (secao === 'pos-palavra') {
                updates.posPalavraAtivo = ativo;
            } else if (secao === 'ceia') {
                updates.ceiaAtivo = ativo;
            }
            await SongModel.updateRepertorio(this.homeView.currentPeriodo, updates);
        } catch (error) {
            console.error("Erro ao atualizar toggle:", error);
        }
    }

    async handleAddSongRepertorio(dia, secao) {
        if (!this.homeView.currentPeriodo) {
            showToast("Selecione um período primeiro", "error");
            return;
        }

        // EBD: sempre mostra apenas Louvor
        let tipoFiltro;
        if (dia === 'ebd') {
            tipoFiltro = 'louvor';
        } else {
            const secaoTipoMap = {
                'adoracao': 'adoracao',
                'oferta': 'louvor',
                'louvor': 'louvor',
                'pos-palavra': 'adoracao',
                'ceia': 'adoracao'
            };
            tipoFiltro = secaoTipoMap[secao] || 'louvor';
        }

        // Filtra músicas por categoria
        const allSongs = await SongModel.getAllSongs();
        const songs = allSongs.filter(s => s.type === tipoFiltro);
        if (songs.length === 0) {
            showToast("Nenhuma música nesta categoria", "error");
            return;
        }

        // Cria modal de seleção
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Selecionar Música</h2>
                    <button class="btn-icon close-modal" aria-label="Fechar">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                    <input type="text" id="searchSongSelect" placeholder="Buscar música..." class="search-input" style="width: 100%; margin-bottom: 12px;">
                    <div id="songsSelectList"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const listContainer = modal.querySelector('#songsSelectList');
        const searchInput = modal.querySelector('#searchSongSelect');

        const renderSongs = (filter = '') => {
            const filtered = filter 
                ? songs.filter(s => s.title.toLowerCase().includes(filter.toLowerCase()))
                : songs;

            listContainer.innerHTML = '';
            filtered.forEach(song => {
                const item = document.createElement('div');
                item.className = 'song-select-item';
                item.style.cssText = 'padding: 12px; border-bottom: 1px solid var(--color-border); cursor: pointer; display: flex; justify-content: space-between; align-items: center;';
                item.innerHTML = `
                    <div>
                        <div style="font-weight: 500;">${song.title}</div>
                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">${song.artist || ''}</div>
                    </div>
                    <i class="ph ph-plus-circle" style="font-size: 1.2rem; color: var(--color-brand-primary);"></i>
                `;
                item.addEventListener('click', () => this._addSongToRepertorio(song, dia, secao, modal));
                listContainer.appendChild(item);
            });
        };

        renderSongs();
        searchInput.addEventListener('input', () => renderSongs(searchInput.value));

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async _addSongToRepertorio(song, dia, secao, modal) {
        try {
            const vocalConfigs = (song.vocalConfigs || []).map(vc => ({
                vocalist: vc.vocalist,
                key: vc.key
            }));

            const musica = {
                id: song.id,
                titulo: song.title,
                artista: song.artist,
                vocalista: '',
                tom: song.key || '',
                vocalConfigs: vocalConfigs
            };

            // Atualiza localmente PRIMEIRO
            if (!this.currentRepertorio[dia]) this.currentRepertorio[dia] = {};
            if (!this.currentRepertorio[dia][secao]) this.currentRepertorio[dia][secao] = [];
            this.currentRepertorio[dia][secao].push(musica);

            // Salva o estado LOCAL no Firestore (não lê do Firestore)
            await SongModel.saveRepertorio(this.homeView.currentPeriodo, this.currentRepertorio);

            this.homeView.renderRepertorio(this.currentRepertorio);

            modal.remove();
            showToast("Música adicionada ao repertório!");
        } catch (error) {
            console.error("Erro ao adicionar música:", error);
            showToast("Erro ao adicionar música", "error");
        }
    }

    async handleReplaceSongRepertorio(dia, secao, index) {
        if (!this.homeView.currentPeriodo) return;

        let tipoFiltro;
        if (dia === 'ebd') {
            tipoFiltro = 'louvor';
        } else {
            const secaoTipoMap = {
                'adoracao': 'adoracao',
                'oferta': 'louvor',
                'louvor': 'louvor',
                'pos-palavra': 'adoracao',
                'ceia': 'adoracao'
            };
            tipoFiltro = secaoTipoMap[secao] || 'louvor';
        }

        const allSongs = await SongModel.getAllSongs();
        const songs = allSongs.filter(s => s.type === tipoFiltro);
        if (songs.length === 0) {
            showToast("Nenhuma música nesta categoria", "error");
            return;
        }

        const musicaAtual = this.currentRepertorio?.[dia]?.[secao]?.[index];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Trocar Música</h2>
                    <button class="btn-icon close-modal" aria-label="Fechar">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                    <input type="text" id="searchSongReplace" placeholder="Buscar música..." class="search-input" style="width: 100%; margin-bottom: 12px;">
                    <div id="songsReplaceList"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const listContainer = modal.querySelector('#songsReplaceList');
        const searchInput = modal.querySelector('#searchSongReplace');

        const renderSongs = (filter = '') => {
            const filtered = filter
                ? songs.filter(s => s.title.toLowerCase().includes(filter.toLowerCase()))
                : songs;

            listContainer.innerHTML = '';
            filtered.forEach(song => {
                const item = document.createElement('div');
                item.className = 'song-select-item';
                item.style.cssText = 'padding: 12px; border-bottom: 1px solid var(--color-border); cursor: pointer; display: flex; justify-content: space-between; align-items: center;';
                const isCurrent = musicaAtual && musicaAtual.id === song.id;
                item.innerHTML = `
                    <div>
                        <div style="font-weight: 500; ${isCurrent ? 'color: var(--color-brand-primary);' : ''}">${song.title} ${isCurrent ? '(atual)' : ''}</div>
                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">${song.artist || ''}</div>
                    </div>
                    <i class="ph ph-arrow-circle-right" style="font-size: 1.2rem; color: var(--color-brand-primary);"></i>
                `;
                item.addEventListener('click', () => this._replaceSongInRepertorio(song, dia, secao, index, modal));
                listContainer.appendChild(item);
            });
        };

        renderSongs();
        searchInput.addEventListener('input', () => renderSongs(searchInput.value));

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async _replaceSongInRepertorio(newSong, dia, secao, index, modal) {
        try {
            const vocalConfigs = (newSong.vocalConfigs || []).map(vc => ({
                vocalist: vc.vocalist,
                key: vc.key
            }));

            const musica = {
                id: newSong.id,
                titulo: newSong.title,
                artista: newSong.artist,
                vocalista: '',
                tom: newSong.key || '',
                vocalConfigs: vocalConfigs
            };

            // Atualiza localmente
            if (this.currentRepertorio?.[dia]?.[secao]) {
                this.currentRepertorio[dia][secao][index] = musica;
            }

            // Salva o estado LOCAL no Firestore
            await SongModel.saveRepertorio(this.homeView.currentPeriodo, this.currentRepertorio);

            this.homeView.renderRepertorio(this.currentRepertorio);
            modal.remove();
            showToast("Música trocada!");
        } catch (error) {
            console.error("Erro ao trocar música:", error);
            showToast("Erro ao trocar música", "error");
        }
    }

    async handleRemoveSongRepertorio(dia, secao, index) {
        if (!this.homeView.currentPeriodo) return;

        try {
            // Remove localmente primeiro
            if (this.currentRepertorio?.[dia]?.[secao]) {
                this.currentRepertorio[dia][secao].splice(index, 1);
            }

            // Salva o estado LOCAL no Firestore
            await SongModel.saveRepertorio(this.homeView.currentPeriodo, this.currentRepertorio);

            this.homeView.renderRepertorio(this.currentRepertorio);
            showToast("Música removida!");
        } catch (error) {
            console.error("Erro ao remover música:", error);
            showToast("Erro ao remover música", "error");
        }
    }

    async handleRepertorioFieldChange(dia, secao, index, field, value) {
        if (!this.homeView.currentPeriodo) return;

        // Atualiza localmente IMEDIATAMENTE para não perder dados
        if (this.currentRepertorio && this.currentRepertorio[dia]?.[secao]?.[index]) {
            this.currentRepertorio[dia][secao][index][field] = value;
            if (field === 'vocalista' && value) {
                const musica = this.currentRepertorio[dia][secao][index];
                if (musica.vocalConfigs) {
                    const vc = musica.vocalConfigs.find(v => v.vocalist === value);
                    if (vc) musica.tom = vc.key;
                }
            }
        }

        // Salva Firestore em background (sem await)
        SongModel.updateMusicaRepertorio(this.homeView.currentPeriodo, dia, secao, index, field, value)
            .catch(error => console.error("Erro ao atualizar campo:", error));
    }

    async handleCompartilhar() {
        if (!this.currentRepertorio || !this.homeView.currentPeriodo) {
            showToast("Selecione um período para compartilhar", "error");
            return;
        }

        const periodo = this.homeView.periodoSelect?.options[this.homeView.periodoSelect.selectedIndex]?.text || '';
        const url = window.location.origin + window.location.pathname + `?rep=${this.homeView.currentPeriodo}`;

        let mensagem = `*Repertório da Semana (${periodo})*\n`;
        mensagem += `Ministério de Louvor Kerigma\n`;
        mensagem += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        mensagem += `\n*Acesse o repertório completo:*\n${url}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
        window.open(whatsappUrl, '_blank');
    }

    // ================================================================
    //  AI CHAT — Busca Inteligente de Músicas (Gemini)
    // ================================================================

    _updateAiKeyWarning() {
        const warn = document.getElementById('aiNoKeyWarning');
        const sendBtn = document.getElementById('btnAiSend');
        const input = document.getElementById('aiChatInput');
        const hasKey = !!this.geminiApiKey;
        if (warn) warn.style.display = hasKey ? 'none' : 'flex';
        if (sendBtn) sendBtn.disabled = !hasKey || !(input?.value.trim());
    }

    bindAiChatEvents() {
        const modal   = document.getElementById('aiChatModal');
        const btnOpen = document.getElementById('btnBibliaIA');
        const btnClose= document.getElementById('btnCloseAiChat');
        const btnClear= document.getElementById('btnClearAiChat');
        const input   = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('btnAiSend');

        if (!modal) return;

        // Open
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                modal.classList.add('active');
                document.body.classList.add('ai-chat-open'); // esconde rodapé e seta de topo
                this._updateAiKeyWarning();
                setTimeout(() => input?.focus(), 300);
            });
        }

        // Close
        const closeAiChat = () => {
            modal.classList.remove('active');
            document.body.classList.remove('ai-chat-open');
        };
        if (btnClose) btnClose.addEventListener('click', closeAiChat);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeAiChat(); });

        // Clear conversation
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                this._aiChatHistory = [];
                const msgs = document.getElementById('aiChatMessages');
                if (msgs) msgs.innerHTML = `
                    <div class="ai-message ai-message-assistant ai-welcome">
                        <div class="ai-message-bubble">
                            <p>Graça e paz! 🙏</p>
                            <p>Conversa reiniciada. Diga um tema, versículo, sentimento ou qualquer ideia, e vou te sugerir músicas ideais.</p>
                        </div>
                    </div>`;
            });
        }

        // Input auto-resize + enable send
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 100) + 'px';
                if (sendBtn) sendBtn.disabled = !input.value.trim() || !this.geminiApiKey;
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!sendBtn.disabled) this._sendAiMessage();
                }
            });
        }

        // Send button
        if (sendBtn) sendBtn.addEventListener('click', () => this._sendAiMessage());

        this._updateAiKeyWarning();
    }

    async _sendAiMessage() {
        const input   = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('btnAiSend');
        if (!input || !this.geminiApiKey) return;

        const userText = input.value.trim();
        if (!userText) return;

        // Show user message
        this._appendMessage('user', userText);
        input.value = '';
        input.style.height = 'auto';
        if (sendBtn) sendBtn.disabled = true;

        // Update status
        const statusLabel = document.getElementById('aiStatusLabel');
        if (statusLabel) { statusLabel.textContent = 'Pensando...'; statusLabel.classList.add('thinking'); }

        // Show typing indicator
        const typingId = this._appendTyping();

        try {
            // Build song context from local DB
            const allSongs = await SongModel.getAllSongs();
            const songContext = allSongs.map(s => {
                const vocais = (s.vocalConfigs || []).map(v => v.vocalist).filter(Boolean);
                const tom = s.key || (s.vocalConfigs?.[0]?.key) || '';
                return `- "${s.title}" | Artista: ${s.artist || 'Desconhecido'} | Categoria: ${
                    s.type === 'adoracao' ? 'Adoração' : 'Louvor'
                }${tom ? ` | Tom: ${tom}` : ''}${vocais.length ? ` | Vocalistas: ${vocais.join(', ')}` : ''}${s.lyrics ? ` | Com letra cadastrada` : ''}`;
            }).join('\n');

            const systemPrompt = `Você é a "Assistente do Louvor": uma crente alegre, bem-humorada e calorosa, que ama louvor e ajuda líderes de louvor da igreja. Você conversa como uma irmã de igreja no zap: descontraída, direta ao ponto e amigável — sempre numa boa, com vibe de "Graça e paz!". Sempre em português do Brasil.

O repertório do ministério (músicas cadastradas no app):
${songContext || '(Nenhuma música cadastrada ainda)'}

Regras importantes:
1. NUNCA use JSON, código, asterisco de programação nem formato técnico. Escreva como uma pessoa real conversando.
2. Seja objetiva e descontraída: respostas curtas, com o coração. Emojis com moderação (🙏✨🎵🎶).
3. Quando sugerir músicas, liste cada uma assim:
**Título da Música** — Nome do Cantor/Banda (vocal: Nome do Vocalista)
4. Priorize as músicas que JÁ ESTÃO no repertório do ministério (marque com ✓ no app) e depois sugira externas conhecidas do gospel/adoração brasileiro.
5. Nunca invente vocalistas: use apenas os vocalistas informados no repertório.
6. Pode bater papo sobre temas de culto, versículos, liturgia, ensaio e dicas pro ministério — e sempre tenta conectar com músicas.
7. Se não souber alguma música, seja sincera e sugira alternativas parecidas.`;

            // Build conversation history for Gemini
            const contents = [
                ...this._aiChatHistory,
                { role: 'user', parts: [{ text: userText }] }
            ];

            // Modelos com fallback (gemini-2.0-flash foi descontinuado pelo Google)
            const geminiModels = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
            let response = null;
            for (const model of geminiModels) {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: systemPrompt }] },
                            contents,
                            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                        })
                    }
                );
                if (res.ok) { response = res; break; }
                // 404 = modelo removido; 503 = sobrecarga temporária → tenta o próximo modelo
                const isLastModel = model === geminiModels[geminiModels.length - 1];
                if ((res.status === 404 || res.status === 503) && !isLastModel) continue;
                response = res;
                break;
            }

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err?.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Save to history
            this._aiChatHistory.push({ role: 'user', parts: [{ text: userText }] });
            this._aiChatHistory.push({ role: 'model', parts: [{ text: rawText }] });
            // Keep history lean (last 10 turns)
            if (this._aiChatHistory.length > 20) this._aiChatHistory = this._aiChatHistory.slice(-20);

            // Render conversational response (markdown-lite)
            this._removeTyping(typingId);
            this._appendRichMessage('assistant', rawText);

        } catch (err) {
            this._removeTyping(typingId);
            console.error('Gemini error:', err);
            let errMsg = 'Erro ao consultar a IA.';
            if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
                errMsg = '🔑 Chave de API inválida. Verifique no painel Admin.';
            } else if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
                errMsg = '⚠️ Cota da API excedida. Aguarde alguns instantes.';
            }
            this._appendMessage('assistant', errMsg);
        } finally {
            if (statusLabel) { statusLabel.textContent = 'Pronto para ajudar'; statusLabel.classList.remove('thinking'); }
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    _appendRichMessage(role, text) {
        const msgs = document.getElementById('aiChatMessages');
        if (!msgs) return;
        // Rede de segurança: remove cercas de código (```json ...) se a IA gerar por engano
        let clean = String(text || '')
            .replace(/^\s*```(?:json|javascript|js|text)?\s*/i, '')
            .replace(/\s*```\s*$/, '');
        const div = document.createElement('div');
        div.className = `ai-message ai-message-${role}`;
        div.innerHTML = `<div class="ai-message-bubble">${this._renderAiMarkdown(clean)}</div>`;
        msgs.appendChild(div);
        div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    _renderAiMarkdown(text) {
        let safe = this._escHtml(text);
        // Negrito **texto**
        safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Itálico *texto*
        safe = safe.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
        const lines = safe.split('\n');
        let html = '';
        let inList = false;
        const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) { closeList(); continue; }
            const bullet = trimmed.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
            if (bullet) {
                if (!inList) { html += '<ul>'; inList = true; }
                html += `<li>${bullet[1]}</li>`;
            } else {
                closeList();
                html += `<p>${trimmed}</p>`;
            }
        }
        closeList();
        return html || `<p>${this._escHtml(text)}</p>`;
    }

    _appendMessage(role, text) {
        const msgs = document.getElementById('aiChatMessages');
        if (!msgs) return;
        const div = document.createElement('div');
        div.className = `ai-message ai-message-${role}`;
        div.innerHTML = `<div class="ai-message-bubble">${this._escHtml(text).replace(/\n/g, '<br>')}</div>`;
        msgs.appendChild(div);
        div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    _appendTyping() {
        const msgs = document.getElementById('aiChatMessages');
        if (!msgs) return null;
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.className = 'ai-message ai-message-assistant';
        div.id = id;
        div.innerHTML = `
            <div class="ai-message-bubble">
                <div class="ai-typing-bubble">
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                </div>
            </div>`;
        msgs.appendChild(div);
        div.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return id;
    }

    _removeTyping(id) {
        if (id) document.getElementById(id)?.remove();
    }

    _escHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
}
