class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 segundos
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(url = 'ws://localhost:3000/ws') {
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = (event) => {
        console.log('✅ Conectado al WebSocket de Voz Urbana');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Suscribirse a notificaciones
        this.send({
          type: 'subscribe'
        });
        
        this.emit('connected', event);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Mensaje recibido:', data);
          
          // Emitir evento específico según el tipo de mensaje
          this.emit(data.type, data);
          this.emit('message', data);
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocket desconectado:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected', event);
        
        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect(url);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  }

  reconnect(url) {
    this.reconnectAttempts++;
    console.log(`🔄 Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(url);
    }, this.reconnectInterval);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no está conectado. No se puede enviar:', data);
    }
  }

  // Sistema de eventos personalizado
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en callback para evento ${eventType}:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Desconexión intencional');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Crear instancia singleton
const webSocketService = new WebSocketService();

export default webSocketService;