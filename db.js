
const DB_NAME = 'expense-tracker';
const STORE = 'transactions';
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

async function addTxn(txn) {
  await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite');
    t.objectStore(STORE).add(txn).onsuccess = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

async function getAllTxns() {
  await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly');
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteTxn(id) {
  await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite');
    t.objectStore(STORE).delete(id).onsuccess = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

async function updateTxn(txn) {
  await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite');
    t.objectStore(STORE).put(txn).onsuccess = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

async function replaceAllTxns(list) {
  await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite');
    const store = t.objectStore(STORE);
    const clearReq = store.clear();
    clearReq.onsuccess = () => {
      list.forEach(item => store.add(item));
      t.oncomplete = () => resolve();
    };
    clearReq.onerror = () => reject(clearReq.error);
  });
}
