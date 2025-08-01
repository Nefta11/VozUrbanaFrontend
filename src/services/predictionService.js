class PredictionService {
  
  // ✅ CONFIGURAR LA URL BASE DE TU API
  constructor() {
    this.API_BASE_URL = 'http://localhost:3000';
  }
  
  // Ejecutar modelo híbrido y obtener predicciones
  async ejecutarModeloHibrido() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/utils/ejecutar-etl-reportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Verificar si es modelo híbrido
      if (data.success && data.version === 'hibrido_v2.1' && data.data.modelo_hibrido) {
        return {
          esHibrido: true,
          predicciones: data.data.modelo_hibrido.predicciones_futuras,
          recomendaciones: data.data.modelo_hibrido.recomendaciones,
          metricas: data.data.metricas,
          paths: {
            modelo: data.data.modelo_path,
            grafico: data.data.grafico_path
          }
        };
      } else {
        return {
          esHibrido: false,
          message: 'Modelo solo clustering (sin predicciones)',
          metricas: data.data.metricas
        };
      }

    } catch (error) {
      console.error('Error ejecutando modelo híbrido:', error);
      throw error;
    }
  }

  // Procesar predicciones para gráficos
  procesarPrediccionesParaGraficos(predicciones) {
    const datos = [];
    
    Object.keys(predicciones).forEach(zona => {
      predicciones[zona].forEach(pred => {
        datos.push({
          zona: zona,
          fecha: pred.fecha,
          semana: pred.semana,
          reportes: pred.reportes_predichos,
          timestamp: new Date(pred.fecha).getTime()
        });
      });
    });

    return datos.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Obtener resumen de predicciones por zona
  obtenerResumenPorZona(predicciones) {
    const resumen = {};

    Object.keys(predicciones).forEach(zona => {
      const prediccionesZona = predicciones[zona];
      const totalReportes = prediccionesZona.reduce((sum, pred) => sum + pred.reportes_predichos, 0);
      const promedio = totalReportes / prediccionesZona.length;
      const maximo = Math.max(...prediccionesZona.map(p => p.reportes_predichos));

      resumen[zona] = {
        totalPredicho: totalReportes,
        promedioPorSemana: Math.round(promedio * 100) / 100,
        picoMaximo: maximo,
        semanas: prediccionesZona.length
      };
    });

    return resumen;
  }
}

export default new PredictionService();