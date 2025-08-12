import { useState, useEffect, useContext, useCallback } from 'react';
import { ReportsContext } from '../../context/ReportsContext';
import { AuthContext } from '../../context/AuthContext';
import CustomPieChart from '../../components/Charts/PieChart';
import CustomBarChart from '../../components/Charts/BarChart';
import CustomLineChart from '../../components/Charts/LineChart';
import { StatsCard, CommentsChart } from '../../components/Charts/StatsComponents';
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { reports, categories, fetchReports, fetchCategories } = useContext(ReportsContext);
  const { user } = useContext(AuthContext);
  const [statsData, setStatsData] = useState({
    totalReports: 0,
    totalComments: 0,
    activeUsers: 0,
    approvedReports: 0,
    categoriesData: [],
    statusData: [],
    monthlyData: [],
    commentsData: []
  });

  useEffect(() => {
    if (user?.rol === 'admin') {
      fetchReports();
      fetchCategories();
    }
  }, [user, fetchReports, fetchCategories]);

  const calculateStats = useCallback(() => {
    // Estadísticas básicas
    const totalReports = reports.length;
    const totalComments = reports.reduce((sum, report) => sum + (report.comentarios?.length || 0), 0);
    const approvedReports = reports.filter(report => 
      report.estado === 'aprobado' || 
      report.estado === 'resuelto' || 
      report.estado === 'cerrado'
    ).length;
    const uniqueUsers = new Set(reports.map(report => report.usuario?.id || report.usuario_id)).size;

    // Datos por categoría - mapear por nombre de categoría
    const categoriesStats = categories.map(category => {
      // Contar reportes que coincidan con el nombre normalizado de la categoría
      const categoryReports = reports.filter(report => {
        // Verificar si el reporte tiene categoria_id o categoria (nombre)
        if (report.categoria_id) {
          return report.categoria_id === category.id;
        } else if (report.categoria) {
          // Normalizar nombres para comparación
          const normalizedReportCategory = report.categoria.toLowerCase().replace(/\s+/g, '_');
          const normalizedCategoryName = category.nombre.toLowerCase().replace(/\s+/g, '_');
          return normalizedReportCategory === normalizedCategoryName || 
                 normalizedReportCategory === normalizedCategoryName.replace('_publica', '_publica') ||
                 (normalizedReportCategory === 'otros' && normalizedCategoryName === 'otros');
        }
        return false;
      });
      
      return {
        name: category.nombre,
        value: categoryReports.length
      };
    }).filter(item => item.value > 0);

    // Datos por estado - usar 'estado' en lugar de 'status'
    const statusStats = [
      { name: 'Aprobados', value: reports.filter(r => r.estado === 'aprobado').length },
      { name: 'Pendientes', value: reports.filter(r => r.estado === 'nuevo').length },
      { name: 'No Aprobados', value: reports.filter(r => r.estado === 'no_aprobado').length },
      { name: 'En Proceso', value: reports.filter(r => r.estado === 'en_proceso').length },
      { name: 'Resueltos', value: reports.filter(r => r.estado === 'resuelto').length },
      { name: 'Cerrados', value: reports.filter(r => r.estado === 'cerrado').length }
    ].filter(item => item.value > 0);

    // Datos mensuales (últimos 6 meses)
    const now = new Date();
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      const monthReports = reports.filter(report => {
        const reportDate = new Date(report.fecha_creacion);
        return reportDate.getMonth() === date.getMonth() && 
               reportDate.getFullYear() === date.getFullYear();
      });
      monthlyStats.push({
        name: monthName,
        reportes: monthReports.length,
        comentarios: monthReports.reduce((sum, r) => sum + (r.comentarios?.length || 0), 0)
      });
    }

    // Datos de comentarios por día (últimas 2 semanas)
    const commentsStats = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayReports = reports.filter(report => {
        const reportDate = new Date(report.fecha_creacion);
        return reportDate.toDateString() === date.toDateString();
      });
      commentsStats.push({
        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        comments: dayReports.reduce((sum, r) => sum + (r.comentarios?.length || 0), 0)
      });
    }

    setStatsData({
      totalReports,
      totalComments,
      activeUsers: uniqueUsers,
      approvedReports,
      categoriesData: categoriesStats,
      statusData: statusStats,
      monthlyData: monthlyStats,
      commentsData: commentsStats
    });
  }, [reports, categories]);

  useEffect(() => {
    if (reports.length > 0) {
      calculateStats();
    }
  }, [reports, categories, calculateStats]);

  if (user?.rol !== 'admin') {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <AlertTriangle size={48} />
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden acceder al dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Administración</h1>
        <p>Estadísticas y métricas de Voz Urbana</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <StatsCard
          title="Total Reportes"
          value={statsData.totalReports}
          icon={<BarChart3 />}
          color="#3b82f6"
          change={`+${Math.round(statsData.totalReports * 0.12)}`}
          changeType="positive"
        />
        <StatsCard
          title="Usuarios Activos"
          value={statsData.activeUsers}
          icon={<Users />}
          color="#10b981"
          change={`+${Math.round(statsData.activeUsers * 0.08)}`}
          changeType="positive"
        />
        <StatsCard
          title="Total Comentarios"
          value={statsData.totalComments}
          icon={<MessageCircle />}
          color="#f59e0b"
          change={`+${Math.round(statsData.totalComments * 0.15)}`}
          changeType="positive"
        />
        <StatsCard
          title="Reportes Exitosos"
          value={statsData.approvedReports}
          icon={<CheckCircle />}
          color="#8b5cf6"
          change={`${Math.round((statsData.approvedReports / statsData.totalReports) * 100)}%`}
          changeType="neutral"
        />
      </div>

      {/* Gráficos principales */}
      <div className="charts-grid">
        <div className="chart-row">
          <div className="chart-col-half">
            <CustomPieChart
              data={statsData.categoriesData}
              title="Reportes por Categoría"
              colors={[
                '#3b82f6', // Azul moderno
                '#ef4444', // Rojo vibrante
                '#10b981', // Verde esmeralda
                '#f59e0b', // Ámbar
                '#8b5cf6', // Violeta
                '#06b6d4', // Cian
                '#f97316', // Naranja
                '#84cc16', // Lima
                '#ec4899'  // Rosa
              ]}
            />
          </div>
          <div className="chart-col-half">
            <CustomPieChart
              data={statsData.statusData}
              title="Reportes por Estado"
              colors={[
                '#10b981', // Verde para aprobados
                '#f59e0b', // Ámbar para pendientes
                '#ef4444', // Rojo para no aprobados
                '#3b82f6', // Azul para en proceso
                '#22c55e', // Verde más claro para resueltos
                '#6b7280'  // Gris para cerrados
              ]}
            />
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-col-full">
            <CustomBarChart
              data={statsData.monthlyData}
              title="Reportes por Mes"
              xAxisKey="name"
              yAxisKey="reportes"
              color="#3b82f6"
            />
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-col-half">
            <CustomLineChart
              data={statsData.monthlyData}
              title="Comentarios por Mes"
              xAxisKey="name"
              yAxisKey="comentarios"
              color="#10b981"
            />
          </div>
          <div className="chart-col-half">
            <CommentsChart
              data={statsData.commentsData}
              title="Actividad de Comentarios (Últimas 2 semanas)"
            />
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="dashboard-footer">
        <div className="info-cards">
          <div className="info-card">
            <Calendar className="info-icon" />
            <div>
              <h3>Último Reporte</h3>
              <p>{reports.length > 0 ? new Date(reports[0]?.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}</p>
            </div>
          </div>
          <div className="info-card">
            <MapPin className="info-icon" />
            <div>
              <h3>Ubicaciones Activas</h3>
              <p>{new Set(reports.map(r => `${r.latitud}-${r.longitud}`)).size} zonas</p>
            </div>
          </div>
          <div className="info-card">
            <TrendingUp className="info-icon" />
            <div>
              <h3>Tasa de Éxito</h3>
              <p>{statsData.totalReports > 0 ? Math.round((statsData.approvedReports / statsData.totalReports) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
