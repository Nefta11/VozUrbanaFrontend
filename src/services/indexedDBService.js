/**
 * IndexedDB Service - Maneja toda la persistencia local de datos
 *
 * Estructura de la base de datos:
 * - reports: Almacena todos los reportes con índices por estado, categoría y usuario
 * - categories: Almacena las categorías de reportes
 * - comments: Almacena comentarios de reportes
 * - votes: Almacena votos de reportes
 * - syncQueue: Cola de operaciones pendientes de sincronización
 * - metadata: Información de sincronización y versiones
 */

const DB_NAME = 'VozUrbanaDB';
const DB_VERSION = 1;

class IndexedDBService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa la base de datos IndexedDB
   */
  async init() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error al abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB inicializado correctamente');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store de reportes
        if (!db.objectStoreNames.contains('reports')) {
          const reportsStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportsStore.createIndex('estado', 'estado', { unique: false });
          reportsStore.createIndex('categoria_id', 'categoria_id', { unique: false });
          reportsStore.createIndex('usuario_id', 'usuario_id', { unique: false });
          reportsStore.createIndex('fecha_creacion', 'fecha_creacion', { unique: false });
          reportsStore.createIndex('votos_total', 'votos_total', { unique: false });
        }

        // Store de categorías
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Store de comentarios
        if (!db.objectStoreNames.contains('comments')) {
          const commentsStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentsStore.createIndex('reporte_id', 'reporte_id', { unique: false });
        }

        // Store de votos
        if (!db.objectStoreNames.contains('votes')) {
          const votesStore = db.createObjectStore('votes', { keyPath: 'id' });
          votesStore.createIndex('reporte_id', 'reporte_id', { unique: false });
        }

        // Store de cola de sincronización
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        // Store de metadata
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        console.log('Estructura de IndexedDB creada');
      };
    });
  }

  /**
   * Operaciones genéricas de IndexedDB
   */
  async getAll(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById(storeName, id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * ==================== REPORTES ====================
   */
  async saveReports(reports) {
    await this.init();
    const transaction = this.db.transaction('reports', 'readwrite');
    const store = transaction.objectStore('reports');

    for (const report of reports) {
      store.put(report);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getReports() {
    return this.getAll('reports');
  }

  async getReportById(id) {
    return this.getById('reports', id);
  }

  async getReportsByUser(userId) {
    return this.getByIndex('reports', 'usuario_id', userId);
  }

  async getReportsByStatus(status) {
    return this.getByIndex('reports', 'estado', status);
  }

  async getReportsByCategory(categoryId) {
    return this.getByIndex('reports', 'categoria_id', categoryId);
  }

  async saveReport(report) {
    return this.put('reports', report);
  }

  async deleteReport(id) {
    return this.delete('reports', id);
  }

  /**
   * ==================== CATEGORÍAS ====================
   */
  async saveCategories(categories) {
    await this.init();
    const transaction = this.db.transaction('categories', 'readwrite');
    const store = transaction.objectStore('categories');

    for (const category of categories) {
      store.put(category);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getCategories() {
    return this.getAll('categories');
  }

  async saveCategory(category) {
    return this.put('categories', category);
  }

  async deleteCategory(id) {
    return this.delete('categories', id);
  }

  /**
   * ==================== COMENTARIOS ====================
   */
  async saveComments(reportId, comments) {
    await this.init();
    const transaction = this.db.transaction('comments', 'readwrite');
    const store = transaction.objectStore('comments');

    for (const comment of comments) {
      store.put({ ...comment, reporte_id: reportId });
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getComments(reportId) {
    return this.getByIndex('comments', 'reporte_id', reportId);
  }

  async saveComment(comment) {
    return this.put('comments', comment);
  }

  async deleteComment(id) {
    return this.delete('comments', id);
  }

  /**
   * ==================== VOTOS ====================
   */
  async saveVotes(reportId, votes) {
    await this.init();
    const transaction = this.db.transaction('votes', 'readwrite');
    const store = transaction.objectStore('votes');

    for (const vote of votes) {
      store.put({ ...vote, reporte_id: reportId });
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getVotes(reportId) {
    return this.getByIndex('votes', 'reporte_id', reportId);
  }

  /**
   * ==================== COLA DE SINCRONIZACIÓN ====================
   */
  async addToSyncQueue(operation) {
    const queueItem = {
      ...operation,
      timestamp: Date.now(),
      retries: 0
    };
    return this.add('syncQueue', queueItem);
  }

  async getSyncQueue() {
    return this.getAll('syncQueue');
  }

  async removeSyncQueueItem(id) {
    return this.delete('syncQueue', id);
  }

  async clearSyncQueue() {
    return this.clear('syncQueue');
  }

  async updateSyncQueueItem(id, updates) {
    const item = await this.getById('syncQueue', id);
    if (item) {
      return this.put('syncQueue', { ...item, ...updates });
    }
  }

  /**
   * ==================== METADATA ====================
   */
  async setMetadata(key, value) {
    return this.put('metadata', { key, value, timestamp: Date.now() });
  }

  async getMetadata(key) {
    const result = await this.getById('metadata', key);
    return result ? result.value : null;
  }

  async getLastSyncTime() {
    return this.getMetadata('lastSyncTime');
  }

  async setLastSyncTime(timestamp = Date.now()) {
    return this.setMetadata('lastSyncTime', timestamp);
  }

  /**
   * ==================== UTILIDADES ====================
   */
  async clearAllData() {
    await this.init();
    const storeNames = ['reports', 'categories', 'comments', 'votes', 'syncQueue', 'metadata'];

    for (const storeName of storeNames) {
      await this.clear(storeName);
    }

    console.log('Todos los datos de IndexedDB han sido eliminados');
  }

  async getDatabaseSize() {
    await this.init();
    const stores = ['reports', 'categories', 'comments', 'votes', 'syncQueue', 'metadata'];
    const sizes = {};

    for (const storeName of stores) {
      const data = await this.getAll(storeName);
      sizes[storeName] = data.length;
    }

    return sizes;
  }
}

// Exportar instancia única (singleton)
const indexedDBService = new IndexedDBService();
export default indexedDBService;
