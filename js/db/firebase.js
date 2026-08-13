const firebaseConfig = {
    apiKey: "AIzaSyDUvO-ZJEFhkxzpECQKeX_qeo-G-6HA0LE",
    authDomain: "repertoriolouvor-15903.firebaseapp.com",
    projectId: "repertoriolouvor-15903",
    storageBucket: "repertoriolouvor-15903.firebasestorage.app",
    messagingSenderId: "522673027448",
    appId: "1:522673027448:web:3123f18da211970f7c708d",
    measurementId: "G-9459LGK83F"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const STORE_SONGS = 'songs';
const STORE_PRESETS = 'vocalPresets';
const STORE_SETTINGS = 'appSettings';
const STORE_REPERTORIO = 'repertorio_semanal';
const STORE_SUGESTOES = 'sugestoes';

firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(() => {});

export const dbOperations = {
    async add(collectionName, data) {
        delete data.id;
        const docRef = await db.collection(collectionName).add(data);
        await docRef.update({ id: docRef.id });
        return docRef.id;
    },

    async put(collectionName, data) {
        const { id, ...rest } = data;
        await db.collection(collectionName).doc(id).set(rest, { merge: true });
    },

    async getAll(collectionName) {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getById(collectionName, id) {
        const docRef = await db.collection(collectionName).doc(id).get();
        if (!docRef.exists) return null;
        return { id: docRef.id, ...docRef.data() };
    },

    async delete(collectionName, id) {
        await db.collection(collectionName).doc(id).delete();
    },

    async setById(collectionName, id, data) {
        const { id: _id, ...rest } = data;
        await db.collection(collectionName).doc(id).set(rest);
    },

    async clear(collectionName) {
        const snapshot = await db.collection(collectionName).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    async getSettings() {
        const docRef = await db.collection(STORE_SETTINGS).doc('main').get();
        return docRef.exists ? docRef.data() : {};
    },

    async saveSettings(settings) {
        await db.collection(STORE_SETTINGS).doc('main').set(settings, { merge: true });
    }
};

export { db, STORE_SONGS, STORE_PRESETS, STORE_SETTINGS, STORE_REPERTORIO, STORE_SUGESTOES };
