import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PredictionService from '../../services/predictionService';
import './PredictionDashboard.css';

const PredictionDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [predicciones, setPredicciones] = useState(null);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [error, setError] = useState(null);


  const ejecutarPredicciones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await PredictionService.ejecutarModeloHibrido();
      
      if (resultado.esHibrido) {
        setPredicciones(resultado.predicciones);
        setRecomendaciones(resultado.recomendaciones);
        setMetricas(resultado.metricas);
      } else {
        setError('El modelo actual no incluye predicciones. Solo clustering disponible.');
        setMetricas(resultado.metricas);
      }
      
    } catch (err) {
      setError(`Error al obtener predicciones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ USAR EL SERVICIO PARA PROCESAR DATOS
  const datosGrafico = predicciones ? 
    PredictionService.procesarPrediccionesParaGraficos(predicciones) : [];

  const resumenZonas = predicciones ? 
    PredictionService.obtenerResumenPorZona(predicciones) : {};

  return (
    <div className="prediction-dashboard">
      <div className="dashboard-header">
        <h1>Predicciones de Reportes</h1>
        <p>Análisis predictivo y recomendaciones inteligentes</p>
        <button 
          onClick={ejecutarPredicciones} 
          disabled={loading}
          className="btn-execute"
        >
          {loading ? 'Ejecutando modelo...' : 'Generar Predicciones'}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning">
          ⚠️ {error}
        </div>
      )}

      {metricas && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Precisión del Modelo</h4>
            <div className="metric-value">
              MAE: {metricas.prediccion?.mae?.toFixed(2) || 'N/A'}
            </div>
            <div className="metric-subtitle">
              R²: {metricas.prediccion?.r2?.toFixed(3) || 'N/A'}
            </div>
          </div>
          
          <div className="metric-card">
            <h4>Clustering</h4>
            <div className="metric-value">
              {metricas.n_clusters || 'N/A'} zonas
            </div>
            <div className="metric-subtitle">
              Score: {metricas.silhouette_score?.toFixed(3) || 'N/A'}
            </div>
          </div>

          <div className="metric-card">
            <h4>Predicciones</h4>
            <div className="metric-value">
              {metricas.zonas_con_prediccion || 0}
            </div>
            <div className="metric-subtitle">
              {metricas.total_recomendaciones || 0} recomendaciones
            </div>
          </div>
        </div>
      )}

      {predicciones && datosGrafico.length > 0 && (
        <>
          {/* Gráfico de tendencias */}
          <div className="chart-container">
            <h3>Tendencia de Reportes Predichos por Zona</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reportes" 
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Resumen por zonas */}
          <div className="zones-summary">
            <h3>Resumen por Zonas Críticas</h3>
            <div className="zones-grid">
              {Object.entries(resumenZonas).map(([zona, datos]) => (
                <div key={zona} className="zone-card">
                  <h4>{zona.replace('zona_', 'Zona ').toUpperCase()}</h4>
                  <div className="zone-stats">
                    <div>Total predicho: <strong>{datos.totalPredicho}</strong></div>
                    <div>Promedio/semana: <strong>{datos.promedioPorSemana}</strong></div>
                    <div>Pico máximo: <strong>{datos.picoMaximo}</strong></div>
                    <div>Período: <strong>{datos.semanas} semanas</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {recomendaciones.length > 0 && (
        <div className="recommendations">
          <h3>Recomendaciones del Sistema</h3>
          <div className="recommendations-list">
            {recomendaciones.map((rec, index) => (
              <div 
                key={index} 
                className={`recommendation-card priority-${rec.prioridad.toLowerCase()}`}
              >
                <div className="rec-header">
                  <h4>{rec.zona}</h4>
                  <span className={`priority-badge ${rec.prioridad.toLowerCase()}`}>
                    {rec.prioridad}
                  </span>
                </div>
                <p className="rec-action">{rec.accion}</p>
                <div className="rec-coordinates">
                  📍 {rec.coordenadas}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !predicciones && !error && (
        <div className="empty-state">
          <h3>Sistema de Predicciones Inteligente</h3>
          <p>Ejecuta el modelo híbrido para obtener predicciones de reportes y recomendaciones para las zonas críticas de la ciudad.</p>
          <div className="features-list">
            <div className="feature">✅ Análisis de patrones históricos</div>
            <div className="feature">✅ Clustering de zonas críticas</div>
            <div className="feature">✅ Predicciones futuras</div>
            <div className="feature">✅ Recomendaciones inteligentes</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;