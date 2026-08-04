// js/models/SongModel.js
import { dbOperations, STORE_SONGS, STORE_PRESETS, STORE_REPERTORIO } from '../db/firebase.js';
import { normalizeText } from '../utils/helpers.js';

export class SongModel {
    /**
     * @returns {Promise<Array>} List of all songs
     */
    static async getAllSongs() {
        try {
            const songs = await dbOperations.getAll(STORE_SONGS);
            return songs.sort((a, b) => a.title.localeCompare(b.title));
        } catch (error) {
            console.error("Error fetching songs:", error);
            throw error;
        }
    }

    /**
     * @param {string|number} id 
     * @returns {Promise<Object>}
     */
    static async getSong(id) {
        try {
            return await dbOperations.getById(STORE_SONGS, id);
        } catch (error) {
            console.error(`Error fetching song ${id}:`, error);
            throw error;
        }
    }

    /**
     * @param {Object} songData { title, artist, vocal, category, key, bpm, lyrics }
     * @returns {Promise<number>} Returns the ID of the new song
     */
    static async addSong(songData) {
        try {
            return await dbOperations.add(STORE_SONGS, songData);
        } catch (error) {
            console.error("Error adding song:", error);
            throw error;
        }
    }

    /**
     * @param {Object} songData Must include ID
     */
    static async updateSong(songData) {
        if (!songData.id) throw new Error("ID is required to update a song");
        try {
            return await dbOperations.put(STORE_SONGS, songData);
        } catch (error) {
            console.error("Error updating song:", error);
            throw error;
        }
    }

    /**
     * @param {string|number} id 
     */
    static async deleteSong(id) {
        try {
            return await dbOperations.delete(STORE_SONGS, id);
        } catch (error) {
            console.error(`Error deleting song ${id}:`, error);
            throw error;
        }
    }

/**
     * Filter songs by query and/or filters
     * @param {string} query - Search query
     * @param {Object} filters - { artist, vocal, key }
     * @returns {Promise<Array>}
     */
    static async filterSongs(query = '', filters = {}) {
        let songs = await this.getAllSongs();
        
        const lowerQuery = normalizeText(query);
        
        songs = songs.filter(song => {
            const matchSearch = !lowerQuery || 
                (song.title && normalizeText(song.title).includes(lowerQuery)) || 
                (song.artist && normalizeText(song.artist).includes(lowerQuery)) ||
                (song.lyrics && normalizeText(song.lyrics).includes(lowerQuery));
            
            const matchCategory = !filters.category || song.type === filters.category;
            const matchArtist = !filters.artist || (song.artist && song.artist.toLowerCase() === filters.artist.toLowerCase());
            const matchKey = !filters.key || this._songHasKey(song, filters.key);

            let matchVocal = true;
            if (filters.vocal) {
                const songVocals = this._getSongVocals(song);
                matchVocal = songVocals.some(v => v.toLowerCase() === filters.vocal.toLowerCase());
            }

            return matchSearch && matchCategory && matchArtist && matchVocal && matchKey;
        });
        
        return songs;
    }

    static _getSongVocals(song) {
        if (song.vocalConfigs && song.vocalConfigs.length > 0) {
            return song.vocalConfigs.map(vc => vc.vocalist).filter(Boolean);
        }
        return song.vocal ? [song.vocal] : [];
    }

    static _songHasKey(song, key) {
        if (song.vocalConfigs && song.vocalConfigs.length > 0) {
            return song.vocalConfigs.some(vc => vc.key === key);
        }
        return song.key === key;
    }

    /**
     * Get unique values for filters
     * @returns {Promise<Object>} { artists: [], vocals: [] }
     */
    static async getFilterOptions() {
        const songs = await this.getAllSongs();
        const options = {
            artists: new Set(),
            vocals: new Set()
        };

        songs.forEach(song => {
            if (song.artist) options.artists.add(song.artist);
            const vocals = this._getSongVocals(song);
            vocals.forEach(v => options.vocals.add(v));
        });

        return {
            artists: Array.from(options.artists).sort(),
            vocals: Array.from(options.vocals).sort()
        };
    }

    /**
     * Export all data as a JSON string
     * @returns {Promise<string>}
     */
    static async exportData() {
        const songs = await this.getAllSongs();
        return JSON.stringify(songs, null, 2);
    }

    /**
     * Extract YouTube video ID from various URL formats
     * @param {string} url
     * @returns {string|null}
     */
    static extractYouTubeId(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    /**
     * Import data from JSON string, replacing existing DB
     * @param {string} jsonString 
     */
    static async importData(jsonString) {
        try {
            const songs = JSON.parse(jsonString);
            if (!Array.isArray(songs)) throw new Error("O formato do backup é inválido.");
            
            // Clear existing
            await dbOperations.clear(STORE_SONGS);
            
            // Add all
            for (const song of songs) {
                const newSong = { ...song };
                delete newSong.id;
                await dbOperations.add(STORE_SONGS, newSong);
            }
            
            return true;
        } catch (error) {
            console.error("Error importing data:", error);
            throw error;
        }
    }

    // === Vocal Presets ===

    static async getPresets() {
        try {
            return await dbOperations.getAll(STORE_PRESETS);
        } catch (error) {
            console.error("Error fetching presets:", error);
            throw error;
        }
    }

    static async savePreset(vocalist, key) {
        const presets = await this.getPresets();
        const existing = presets.find(p => p.vocalist.toLowerCase() === vocalist.toLowerCase());
        if (existing) {
            return await dbOperations.put(STORE_PRESETS, { id: existing.id, vocalist, key });
        } else {
            return await dbOperations.add(STORE_PRESETS, { vocalist, key });
        }
    }

    static async deletePreset(id) {
        return await dbOperations.delete(STORE_PRESETS, id);
    }

    // === Repertório da Semana ===

    static async getPeriodos() {
        try {
            return await dbOperations.getAll(STORE_REPERTORIO);
        } catch (error) {
            console.error("Error fetching periodos:", error);
            throw error;
        }
    }

    static async getRepertorio(periodoId) {
        try {
            return await dbOperations.getById(STORE_REPERTORIO, periodoId);
        } catch (error) {
            console.error(`Error fetching repertorio ${periodoId}:`, error);
            throw error;
        }
    }

    static async createRepertorio(id, periodo) {
        const repertorio = {
            periodo,
            quarta: { adoracao: [], oferta: [], louvor: [] },
            sabado: { adoracao: [], oferta: [], louvor: [] },
            ebd: { adoracao: [], oferta: [], louvor: [] },
            domingo: { adoracao: [], oferta: [], 'pos-palavra': [], ceia: [], louvor: [] },
            posPalavraAtivo: false,
            ceiaAtivo: false,
            criadoEm: new Date().toISOString()
        };
        await dbOperations.setById(STORE_REPERTORIO, id, { id, ...repertorio });
        return id;
    }

    static async updateRepertorio(periodoId, updates) {
        try {
            const existing = await this.getRepertorio(periodoId);
            if (!existing) throw new Error("Repertório não encontrado");
            
            const updated = { ...existing, ...updates };
            return await dbOperations.put(STORE_REPERTORIO, updated);
        } catch (error) {
            console.error("Error updating repertorio:", error);
            throw error;
        }
    }

    static async addMusicaRepertorio(periodoId, dia, secao, musica) {
        try {
            const repertorio = await this.getRepertorio(periodoId);
            if (!repertorio) throw new Error("Repertório não encontrado");

            if (!repertorio[dia]) {
                repertorio[dia] = { adoracao: [], oferta: [], louvor: [] };
            }
            if (!repertorio[dia][secao]) {
                repertorio[dia][secao] = [];
            }

            repertorio[dia][secao].push(musica);
            return await dbOperations.put(STORE_REPERTORIO, repertorio);
        } catch (error) {
            console.error("Error adding music to repertorio:", error);
            throw error;
        }
    }

    static async removeMusicaRepertorio(periodoId, dia, secao, index) {
        try {
            const repertorio = await this.getRepertorio(periodoId);
            if (!repertorio || !repertorio[dia] || !repertorio[dia][secao]) {
                throw new Error("Repertório não encontrado");
            }

            repertorio[dia][secao].splice(index, 1);
            return await dbOperations.put(STORE_REPERTORIO, repertorio);
        } catch (error) {
            console.error("Error removing music from repertorio:", error);
            throw error;
        }
    }

    static async updateMusicaRepertorio(periodoId, dia, secao, index, field, value) {
        try {
            const repertorio = await this.getRepertorio(periodoId);
            if (!repertorio || !repertorio[dia] || !repertorio[dia][secao]) {
                throw new Error("Repertório não encontrado");
            }

            repertorio[dia][secao][index][field] = value;

            // Se mudou o vocalista, atualiza o tom baseado no vocalConfigs
            if (field === 'vocalista' && value) {
                const musica = repertorio[dia][secao][index];
                if (musica.vocalConfigs && musica.vocalConfigs.length > 0) {
                    const vc = musica.vocalConfigs.find(v => v.vocalist === value);
                    if (vc) {
                        musica.tom = vc.key;
                    }
                }
            }

            return await dbOperations.put(STORE_REPERTORIO, repertorio);
        } catch (error) {
            console.error("Error updating music field in repertorio:", error);
            throw error;
        }
    }

    static async deleteRepertorio(periodoId) {
        try {
            return await dbOperations.delete(STORE_REPERTORIO, periodoId);
        } catch (error) {
            console.error(`Error deleting repertorio ${periodoId}:`, error);
            throw error;
        }
    }
}
