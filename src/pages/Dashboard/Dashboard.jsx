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
    const approvedReports = reports.filter(report => report.status === 'aprobado').length;
    const uniqueUsers = new Set(reports.map(report => report.usuario_id)).size;

    // Datos por categoría
    const categoriesStats = categories.map(category => ({
      name: category.nombre,
      value: reports.filter(report => report.categoria_id === category.id).length
    })).filter(item => item.value > 0);

    // Datos por estado
    const statusStats = [
      { name: 'Aprobados', value: reports.filter(r => r.status === 'aprobado').length },
      { name: 'Pendientes', value: reports.filter(r => r.status === 'nuevo').length },
      { name: 'No Aprobados', value: reports.filter(r => r.status === 'no_aprobado').length },
      { name: 'En Proceso', value: reports.filter(r => r.status === 'en_proceso').length }
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
          title="Reportes Aprobados"
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
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']}
            />
          </div>
          <div className="chart-col-half">
            <CustomPieChart
              data={statsData.statusData}
              title="Reportes por Estado"
              colors={['#10b981', '#f59e0b', '#ef4444', '#6b7280']}
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
              <h3>Tasa de Aprobación</h3>
              <p>{statsData.totalReports > 0 ? Math.round((statsData.approvedReports / statsData.totalReports) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
