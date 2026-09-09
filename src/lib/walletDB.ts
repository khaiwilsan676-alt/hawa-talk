export class SharedWalletDB {
  private dbName = 'WalletDB';
  private storeName = 'WalletStore';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open wallet database', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async getCoins(): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(5000000); // Default balance
        return;
      }
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('coins');

      request.onsuccess = () => {
        if (request.result !== undefined) {
          resolve(request.result);
        } else {
          resolve(5000000); // Default balance
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async setCoins(amount: number): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(amount, 'coins');

      request.onsuccess = () => {
        // Dispatch event for cross-component sync
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('walletBalanceChanged', { detail: { coins: amount } }));
        }
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deductCoins(amount: number): Promise<boolean> {
    const current = await this.getCoins();
    if (current >= amount) {
      await this.setCoins(current - amount);
      return true;
    }
    return false;
  }

  async addCoins(amount: number): Promise<void> {
    const current = await this.getCoins();
    await this.setCoins(current + amount);
  }
}

export const walletDB = new SharedWalletDB();
