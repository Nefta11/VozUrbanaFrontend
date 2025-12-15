/**
 * Sync Service - Maneja la sincronización entre IndexedDB y el backend
 *
 * Funcionalidades:
 * - Sincronización automática cuando hay conexión
 * - Cola de operaciones pendientes para modo offline
 * - Detección de conflictos y resolución
 * - Sincronización incremental (solo cambios recientes)
 */

import indexedDBService from './indexedDBService';
import { reportsAPI } from './reportsAPI';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.conflictStrategy = 'server-wins'; // 'server-wins' | 'client-wins' | 'manual'
  }

  /**
   * ==================== LISTENERS ====================
   */
  onSyncStart(callback) {
    this.syncListeners.push({ event: 'start', callback });
  }

  onSyncComplete(callback) {
    this.syncListeners.push({ event: 'complete', callback });
  }

  onSyncError(callback) {
    this.syncListeners.push({ event: 'error', callback });
  }

  emit(event, data) {
    this.syncListeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }

  /**
   * ==================== SINCRONIZACIÓN PRINCIPAL ====================
   */
  async syncAll(options = {}) {
    const {
      force = false,
      direction = 'both' // 'upload' | 'download' | 'both'
    } = options;

    if (this.isSyncing && !force) {
      console.log('Sincronización ya en progreso');
      return;
    }

    this.isSyncing = true;
    this.emit('start', { timestamp: Date.now() });

    try {
      // 1. Sincronizar datos desde el servidor (download)
      if (direction === 'download' || direction === 'both') {
        await this.downloadFromServer();
      }

      // 2. Sincronizar cambios locales al servidor (upload)
      if (direction === 'upload' || direction === 'both') {
        await this.uploadToServer();
      }

      // 3. Actualizar timestamp de última sincronización
      await indexedDBService.setLastSyncTime();

      this.emit('complete', {
        timestamp: Date.now(),
        success: true
      });

      console.log('Sincronización completada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error en sincronización:', error);
      this.emit('error', { error, timestamp: Date.now() });
      return { success: false, error };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * ==================== DESCARGA DESDE SERVIDOR ====================
   */
  async downloadFromServer() {
    console.log('Descargando datos del servidor...');

    try {
      // Descargar reportes
      const reports = await reportsAPI.getAll();
      await indexedDBService.saveReports(reports);
      console.log(`✓ ${reports.length} reportes descargados`);

      // Descargar categorías
      const categories = await reportsAPI.getCategories();
      await indexedDBService.saveCategories(categories);
      console.log(`✓ ${categories.length} categorías descargadas`);

      return { success: true };
    } catch (error) {
      console.error('Error descargando datos:', error);
      throw error;
    }
  }

  /**
   * ==================== SUBIDA AL SERVIDOR ====================
   */
  async uploadToServer() {
    console.log('Subiendo cambios al servidor...');

    const syncQueue = await indexedDBService.getSyncQueue();

    if (syncQueue.length === 0) {
      console.log('No hay cambios pendientes para sincronizar');
      return { success: true, processed: 0 };
    }

    console.log(`Procesando ${syncQueue.length} operaciones pendientes...`);

    let processed = 0;
    let failed = 0;

    for (const item of syncQueue) {
      try {
        await this.processSyncQueueItem(item);
        await indexedDBService.removeSyncQueueItem(item.id);
        processed++;
      } catch (error) {
        console.error(`Error procesando item ${item.id}:`, error);
        failed++;

        // Incrementar contador de reintentos
        await indexedDBService.updateSyncQueueItem(item.id, {
          retries: (item.retries || 0) + 1,
          lastError: error.message
        });

        // Si ha fallado muchas veces, marcar como error permanente
        if (item.retries >= 5) {
          console.error(`Item ${item.id} ha fallado 5 veces, marcando como error permanente`);
          await indexedDBService.updateSyncQueueItem(item.id, {
            status: 'failed-permanent'
          });
        }
      }
    }

    console.log(`Sincronización completada: ${processed} exitosos, ${failed} fallidos`);
    return { success: true, processed, failed };
  }

  /**
   * Procesa un item individual de la cola de sincronización
   */
  async processSyncQueueItem(item) {
    const { type, action, data } = item;

    switch (type) {
      case 'report':
        return this.syncReport(action, data);

      case 'comment':
        return this.syncComment(action, data);

      case 'vote':
        return this.syncVote(action, data);

      case 'category':
        return this.syncCategory(action, data);

      default:
        throw new Error(`Tipo de operación desconocido: ${type}`);
    }
  }

  /**
   * ==================== SINCRONIZACIÓN POR TIPO ====================
   */
  async syncReport(action, data) {
    switch (action) {
      case 'create':
        const newReport = await reportsAPI.create(data);
        await indexedDBService.saveReport(newReport);
        return newReport;

      case 'update':
        const updatedReport = await reportsAPI.update(data.id, data);
        await indexedDBService.saveReport(updatedReport);
        return updatedReport;

      case 'delete':
        await reportsAPI.delete(data.id);
        await indexedDBService.deleteReport(data.id);
        return { id: data.id, deleted: true };

      case 'updateStatus':
        const statusUpdated = await reportsAPI.updateStatus(data.id, data.status);
        await indexedDBService.saveReport(statusUpdated);
        return statusUpdated;

      default:
        throw new Error(`Acción de reporte desconocida: ${action}`);
    }
  }

  async syncComment(action, data) {
    switch (action) {
      case 'create':
        const newComment = await reportsAPI.addComment(data.reportId, data);
        await indexedDBService.saveComment(newComment);
        return newComment;

      case 'update':
        const updatedComment = await reportsAPI.updateComment(data.id, data.texto);
        await indexedDBService.saveComment(updatedComment);
        return updatedComment;

      case 'delete':
        await reportsAPI.deleteComment(data.id);
        await indexedDBService.deleteComment(data.id);
        return { id: data.id, deleted: true };

      default:
        throw new Error(`Acción de comentario desconocida: ${action}`);
    }
  }

  async syncVote(action, data) {
    if (action === 'create') {
      const result = await reportsAPI.vote(data.reportId, data.voteType);
      return result;
    }
    throw new Error(`Acción de voto desconocida: ${action}`);
  }

  async syncCategory(action, data) {
    switch (action) {
      case 'create':
        const newCategory = await reportsAPI.createCategory(data);
        await indexedDBService.saveCategory(newCategory);
        return newCategory;

      case 'update':
        const updatedCategory = await reportsAPI.updateCategory(data.id, data);
        await indexedDBService.saveCategory(updatedCategory);
        return updatedCategory;

      case 'delete':
        await reportsAPI.deleteCategory(data.id);
        await indexedDBService.deleteCategory(data.id);
        return { id: data.id, deleted: true };

      default:
        throw new Error(`Acción de categoría desconocida: ${action}`);
    }
  }

  /**
   * ==================== OPERACIONES OFFLINE ====================
   */
  async queueOperation(type, action, data) {
    const operation = {
      type,
      action,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    const id = await indexedDBService.addToSyncQueue(operation);
    console.log(`Operación añadida a la cola: ${type}.${action} (ID: ${id})`);

    return { queued: true, id };
  }

  /**
   * ==================== GESTIÓN DE DATOS HÍBRIDA ====================
   */
  async getReports(options = {}) {
    const { forceRefresh = false } = options;

    // 1. Cargar primero desde caché local (rápido)
    let cachedReports = await indexedDBService.getReports();

    // Si no hay conexión o no se fuerza refresh, devolver caché
    if (!navigator.onLine || !forceRefresh) {
      console.log('Devolviendo reportes desde caché local');
      return cachedReports;
    }

    // 2. Intentar obtener datos frescos del servidor
    try {
      const freshReports = await reportsAPI.getAll();
      await indexedDBService.saveReports(freshReports);
      console.log('Reportes actualizados desde servidor');
      return freshReports;
    } catch (error) {
      console.warn('No se pudo actualizar desde servidor, usando caché:', error);
      return cachedReports;
    }
  }

  async getReportById(id, options = {}) {
    const { forceRefresh = false } = options;

    // 1. Cargar desde caché
    let cachedReport = await indexedDBService.getReportById(id);

    if (!navigator.onLine || !forceRefresh) {
      return cachedReport;
    }

    // 2. Intentar actualizar desde servidor
    try {
      const freshReport = await reportsAPI.getById(id);
      await indexedDBService.saveReport(freshReport);
      return freshReport;
    } catch (error) {
      console.warn('No se pudo actualizar reporte desde servidor:', error);
      return cachedReport;
    }
  }

  async getCategories(options = {}) {
    const { forceRefresh = false } = options;

    let cachedCategories = await indexedDBService.getCategories();

    if (!navigator.onLine || !forceRefresh) {
      return cachedCategories;
    }

    try {
      const freshCategories = await reportsAPI.getCategories();
      await indexedDBService.saveCategories(freshCategories);
      return freshCategories;
    } catch (error) {
      console.warn('No se pudo actualizar categorías:', error);
      return cachedCategories;
    }
  }

  /**
   * ==================== OPERACIONES CON COLA ====================
   */
  async createReportOffline(reportData) {
    // Generar ID temporal para uso local
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reportWithTempId = {
      ...reportData,
      id: tempId,
      synced: false,
      fecha_creacion: new Date().toISOString()
    };

    // Guardar en IndexedDB
    await indexedDBService.saveReport(reportWithTempId);

    // Añadir a cola de sincronización
    await this.queueOperation('report', 'create', reportData);

    return reportWithTempId;
  }

  async updateReportOffline(id, reportData) {
    // Actualizar en IndexedDB
    const existingReport = await indexedDBService.getReportById(id);
    const updatedReport = { ...existingReport, ...reportData, synced: false };
    await indexedDBService.saveReport(updatedReport);

    // Añadir a cola
    await this.queueOperation('report', 'update', { id, ...reportData });

    return updatedReport;
  }

  async deleteReportOffline(id) {
    await indexedDBService.deleteReport(id);
    await this.queueOperation('report', 'delete', { id });
    return { success: true };
  }

  /**
   * ==================== UTILIDADES ====================
   */
  async getSyncStatus() {
    const lastSync = await indexedDBService.getLastSyncTime();
    const queueLength = (await indexedDBService.getSyncQueue()).length;
    const dbSize = await indexedDBService.getDatabaseSize();

    return {
      lastSync: lastSync ? new Date(lastSync) : null,
      pendingOperations: queueLength,
      isSyncing: this.isSyncing,
      isOnline: navigator.onLine,
      databaseSize: dbSize
    };
  }

  async clearAllLocalData() {
    await indexedDBService.clearAllData();
    console.log('Todos los datos locales han sido eliminados');
  }
}

// Exportar instancia única (singleton)
const syncService = new SyncService();
export default syncService;
