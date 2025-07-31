import { useEffect, useCallback } from 'react';
import webSocketService from '../services/webSocketService';
import { useNotification } from './useNotification';

export const useWebSocket = () => {
  const { showNotification } = useNotification();

  const connectWebSocket = useCallback(() => {
    webSocketService.connect();
  }, []);

  const disconnectWebSocket = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const sendMessage = useCallback((data) => {
    webSocketService.send(data);
  }, []);

  // Configurar listeners de eventos
  useEffect(() => {
    // Handler para nuevos reportes
    const handleNewReport = (data) => {
      showNotification(
        `🚨 Nuevo reporte: ${data.data.titulo}`,
        'info'
      );
      console.log('Nuevo reporte recibido:', data.data);
    };

    // Handler para cambios de estado
    const handleStatusChange = (data) => {
      showNotification(
        `📝 Reporte "${data.data.titulo}" cambió a: ${data.data.newStatus}`,
        'info'
      );
    };

    // Handler para reportes pendientes
    const handlePendingReports = (data) => {
      if (data.data.count > 0) {
        showNotification(
          `⏰ ${data.data.message}`,
          'warning'
        );
      }
    };

    // Handler para conexión establecida
    const handleConnected = () => {
      showNotification('🔗 Conectado al sistema de notificaciones', 'success');
    };

    // Handler para desconexión
    const handleDisconnected = () => {
      showNotification('❌ Desconectado del sistema de notificaciones', 'error');
    };

    // Registrar listeners
    webSocketService.on('new_report', handleNewReport);
    webSocketService.on('status_change', handleStatusChange);
    webSocketService.on('pending_reports', handlePendingReports);
    webSocketService.on('connected', handleConnected);
    webSocketService.on('disconnected', handleDisconnected);

    // Conectar automáticamente
    connectWebSocket();

    // Cleanup: remover listeners y desconectar
    return () => {
      webSocketService.off('new_report', handleNewReport);
      webSocketService.off('status_change', handleStatusChange);
      webSocketService.off('pending_reports', handlePendingReports);
      webSocketService.off('connected', handleConnected);
      webSocketService.off('disconnected', handleDisconnected);
      disconnectWebSocket();
    };
  }, [showNotification, connectWebSocket, disconnectWebSocket]);

  return {
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    connectionStatus: webSocketService.getConnectionStatus()
  };
};