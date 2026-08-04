// js/db/database.js

const DB_NAME = 'LouvorAppDB';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';

/**
 * Initializes the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create songs store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_SONGS)) {
                const store = db.createObjectStore(STORE_SONGS, { keyPath: 'id', autoIncrement: true });
                // Create indexes for searching
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('artist', 'artist', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
    });
};

/**
 * Helper to perform database transactions
 * @param {string} storeName 
 * @param {'readonly' | 'readwrite'} mode 
 * @returns {Promise<IDBObjectStore>}
 */
const getStore = async (storeName, mode) => {
    const db = await openDB();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
};

export const dbOperations = {
    async add(storeName, data) {
        const store = await getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async put(storeName, data) {
        const store = await getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            data.updatedAt = new Date().toISOString();
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getAll(storeName) {
        const store = await getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getById(storeName, id) {
        const store = await getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.get(Number(id));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async delete(storeName, id) {
        const store = await getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(Number(id));
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    async clear(storeName) {
        const store = await getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
};

export { STORE_SONGS };
