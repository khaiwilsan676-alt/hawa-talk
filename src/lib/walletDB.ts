export const DB_NAME = 'SharedWalletDB';
export const STORE_NAME = 'walletState';

export async function initWalletDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject("No window");
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSharedBalance(): Promise<number> {
  try {
    if (typeof window === 'undefined') return 1077472;
    const db = await initWalletDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('coins');
      req.onsuccess = () => {
        if (req.result !== undefined) resolve(req.result);
        else resolve(1077472); // Default initial balance matching Wallet.tsx
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('getSharedBalance error:', e);
    return 1077472;
  }
}

export async function setSharedBalance(newBalance: number): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    const db = await initWalletDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(newBalance, 'coins');
      tx.oncomplete = () => {
        // Dispatch an event so other components can update
        window.dispatchEvent(new CustomEvent('walletBalanceChanged', { detail: newBalance }));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('setSharedBalance error:', e);
  }
}
