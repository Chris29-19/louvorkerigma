// js/utils/helpers.js

/**
 * Mostra uma notificação toast na tela
 * @param {string} message 
 * @param {'success'|'error'} type 
 */
export const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

/**
 * Debounce function to limit API/Search calls
 * @param {Function} func 
 * @param {number} delay 
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

/**
 * Remove acentos/diacríticos de uma string para buscas inteligentes
 * "Águas profundas" → "aguas profundas"
 * @param {string} str
 * @returns {string}
 */
export const normalizeText = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

/**
 * Converte texto em slug para URLs (Cifra Club, etc.)
 * "Diante do Trono" → "diante-do-trono"
 * "Águas Profundas" → "aguas-profundas"
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

/**
 * Busca letra de música automaticamente via LRCLIB (primário) e Vagalume (fallback)
 * @param {string} title - Título da música
 * @param {string} artist - Artista/Banda
 * @returns {Promise<string|null>} - Letra encontrada ou null
 */
export const fetchLyrics = async (title, artist) => {
    if (!title || !artist) return null;

    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();

    // 1. Tentar LRCLIB (gratuita, sem chave)
    try {
        const lrclibUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
        const res = await fetch(lrclibUrl, {
            headers: { 'User-Agent': 'LouvorApp/1.0 (https://louvorkerigma.netlify.app)' }
        });

        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                const best = _pickBestLrclibResult(data, cleanTitle, cleanArtist);
                if (best) {
                    console.log('[Lyrics] Encontrada via LRCLIB:', cleanTitle, '- Artista:', best.artistName);
                    return best.plainLyrics || best.syncedLyrics;
                }
            }
        }
    } catch (err) {
        console.warn('[Lyrics] LRCLIB falhou:', err.message);
    }

    // 2. Fallback: Vagalume (brasileira, sem chave para busca básica)
    try {
        const vagalumeUrl = `https://api.vagalume.com.br/search.php?art=${encodeURIComponent(cleanArtist)}&mus=${encodeURIComponent(cleanTitle)}&extra=0`;
        const res = await fetch(vagalumeUrl);

        if (res.ok) {
            const data = await res.json();
            if (data.type === 'exact' && data.mus && data.mus.length > 0) {
                const lyrics = data.mus[0].text;
                if (lyrics) {
                    console.log('[Lyrics] Encontrada via Vagalume:', cleanTitle);
                    return lyrics;
                }
            }
        }
    } catch (err) {
        console.warn('[Lyrics] Vagalume falhou:', err.message);
    }

    console.log('[Lyrics] Não encontrada:', cleanTitle);
    return null;
};

/**
 * Escolhe o melhor resultado do LRCLIB comparando artista e título
 * @param {Array} results - Resultados da LRCLIB
 * @param {string} searchTitle - Título buscado (normalizado)
 * @param {string} searchArtist - Artista buscado (normalizado)
 * @returns {Object|null} - Melhor resultado ou null
 */
const _pickBestLrclibResult = (results, searchTitle, searchArtist) => {
    const nSearchArtist = normalizeText(searchArtist);
    const nSearchTitle = normalizeText(searchTitle);

    const scored = results
        .filter(r => !r.instrumental && (r.plainLyrics || r.syncedLyrics))
        .map(r => {
            const nArtist = normalizeText(r.artistName || '');
            const nTitle = normalizeText(r.trackName || '');
            let score = 0;

            // Artista exato ou containment
            if (nArtist === nSearchArtist) score += 100;
            else if (nArtist.includes(nSearchArtist) || nSearchArtist.includes(nArtist)) score += 70;
            else {
                const artistWords = nSearchArtist.split(/\s+/);
                const matchWords = artistWords.filter(w => w.length > 2 && nArtist.includes(w));
                score += (matchWords.length / artistWords.length) * 50;
            }

            // Título
            if (nTitle === nSearchTitle) score += 50;
            else if (nTitle.includes(nSearchTitle) || nSearchTitle.includes(nTitle)) score += 30;

            // Bônus: tem plainLyrics
            if (r.plainLyrics) score += 10;

            return { ...r, score };
        })
        .sort((a, b) => b.score - a.score);

    return scored.length > 0 ? scored[0] : null;
};
