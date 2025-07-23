import apiClient from "../config/api";

export const reportsAPI = {
  // Get categories from backend
  async getCategories() {
    try {
      const response = await apiClient.get("/categorias");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      // Fallback a categorías locales si falla el backend
      return [
        {
          id: 1,
          nombre: "Saneamiento",
          icono: "Droplets",
          descripcion: "Problemas de agua y drenaje",
          activa: true,
          orden_visualizacion: 1,
        },
        {
          id: 2,
          nombre: "Infraestructura",
          icono: "Construction",
          descripcion: "Calles, banquetas y construcción",
          activa: true,
          orden_visualizacion: 2,
        },
        {
          id: 3,
          nombre: "Salud Pública",
          icono: "Heart",
          descripcion: "Problemas de salud comunitaria",
          activa: true,
          orden_visualizacion: 3,
        },
        {
          id: 4,
          nombre: "Seguridad",
          icono: "Shield",
          descripcion: "Seguridad pública y vandalismo",
          activa: true,
          orden_visualizacion: 4,
        },
        {
          id: 5,
          nombre: "Medio Ambiente",
          icono: "Leaf",
          descripcion: "Contaminación y áreas verdes",
          activa: true,
          orden_visualizacion: 5,
        },
        {
          id: 6,
          nombre: "Servicios Públicos",
          icono: "Zap",
          descripcion: "Electricidad y servicios básicos",
          activa: true,
          orden_visualizacion: 6,
        },
        {
          id: 7,
          nombre: "Transporte",
          icono: "Bus",
          descripcion: "Transporte público y vialidad",
          activa: true,
          orden_visualizacion: 7,
        },
        {
          id: 8,
          nombre: "Otros",
          icono: "AlertCircle",
          descripcion: "Otros problemas urbanos",
          activa: true,
          orden_visualizacion: 8,
        },
      ];
    }
  },

  // Helper function to get category name by ID
  async getCategoryName(categoryId) {
    if (!categoryId) return "Otros";

    try {
      const categories = await this.getCategories();
      const category = categories.find(
        (cat) => cat.id === parseInt(categoryId)
      );
      return category ? category.nombre : "Otros";
    } catch {
      return "Otros";
    }
  },

  // Get all reports
  async getAll() {
    try {
      // Primero obtenemos las categorías para mapear IDs a nombres
      const categories = await this.getCategories();
      const categoriesMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.nombre;
        return acc;
      }, {});

      const response = await apiClient.get("/reports");

      // Para cada reporte, obtenemos sus votos y comentarios
      const reportsWithData = await Promise.all(
        response.data.map(async (report) => {
          try {
            // Obtener votos y comentarios en paralelo
            const [votesResponse, commentsResponse] = await Promise.all([
              apiClient
                .get(`/votos/${report.id}`)
                .catch(() => ({ data: { up: 0, down: 0, total: 0 } })),
              apiClient
                .get(`/comentarios/${report.id}`)
                .catch(() => ({ data: [] })),
            ]);

            return {
              id: report.id,
              titulo: report.titulo,
              descripcion: report.descripcion,
              categoria: categoriesMap[report.categoria_id] || "Otros", // Mapear ID a nombre
              ubicacion: report.ubicacion,
              latitud: report.latitud,
              longitud: report.longitud,
              estado: report.estado,
              prioridad: report.prioridad,
              votos_positivos: votesResponse.data.up || 0,
              votos_negativos: votesResponse.data.down || 0,
              votos_usuarios: {}, // Se podría implementar para mostrar voto del usuario actual
              fecha_creacion: report.fecha_creacion,
              fecha_actualizacion: report.fecha_actualizacion,
              asignado_a: report.asignado_a,
              notas_admin: [],
              usuario: {
                id: report.User?.id || report.usuario_id,
                nombre: report.User?.nombre || "Usuario",
              },
              imagen: report.imagen_url,
              comentarios: commentsResponse.data.map((comment) => ({
                id: comment.id,
                texto: comment.texto,
                fecha: comment.fecha_comentario,
                usuario: {
                  id: comment.User?.id || comment.usuario_id,
                  nombre: comment.User?.nombre || "Usuario",
                },
              })),
            };
          } catch {
            // Si hay error obteniendo votos/comentarios, devolver reporte sin ellos
            return {
              id: report.id,
              titulo: report.titulo,
              descripcion: report.descripcion,
              categoria: categoriesMap[report.categoria_id] || "Otros", // Mapear ID a nombre
              ubicacion: report.ubicacion,
              latitud: report.latitud,
              longitud: report.longitud,
              estado: report.estado,
              prioridad: report.prioridad,
              votos_positivos: 0,
              votos_negativos: 0,
              votos_usuarios: {},
              fecha_creacion: report.fecha_creacion,
              fecha_actualizacion: report.fecha_actualizacion,
              asignado_a: report.asignado_a,
              notas_admin: [],
              usuario: {
                id: report.User?.id || report.usuario_id,
                nombre: report.User?.nombre || "Usuario",
              },
              imagen: report.imagen_url,
              comentarios: [],
            };
          }
        })
      );

      return reportsWithData;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al obtener reportes";
      throw new Error(message);
    }
  },

  // Category CRUD operations
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post("/categorias", categoryData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al crear categoría";
      throw new Error(message);
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.patch(`/categorias/${id}`, categoryData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar categoría";
      throw new Error(message);
    }
  },

  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al eliminar categoría";
      throw new Error(message);
    }
  },

  // Get report by ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      const report = response.data;

      // Obtener votos y comentarios en paralelo
      const [votesResponse, commentsResponse] = await Promise.all([
        apiClient
          .get(`/votos/${id}`)
          .catch(() => ({ data: { up: 0, down: 0, total: 0 } })),
        apiClient.get(`/comentarios/${id}`).catch(() => ({ data: [] })),
      ]);

      return {
        id: report.id,
        titulo: report.titulo,
        descripcion: report.descripcion,
        categoria: report.categoria_id?.toString() || "6",
        ubicacion: report.ubicacion,
        latitud: report.latitud,
        longitud: report.longitud,
        estado: report.estado,
        prioridad: report.prioridad,
        votos_positivos: votesResponse.data.up || 0,
        votos_negativos: votesResponse.data.down || 0,
        votos_usuarios: {},
        fecha_creacion: report.fecha_creacion,
        fecha_actualizacion: report.fecha_actualizacion,
        asignado_a: report.asignado_a,
        notas_admin: [],
        usuario: {
          id: report.User?.id || report.usuario_id,
          nombre: report.User?.nombre || "Usuario",
        },
        imagen: report.imagen_url,
        comentarios: commentsResponse.data.map((comment) => ({
          id: comment.id,
          texto: comment.texto,
          fecha: comment.fecha_comentario,
          usuario: {
            id: comment.User?.id || comment.usuario_id,
            nombre: comment.User?.nombre || "Usuario",
          },
        })),
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al obtener reporte";
      throw new Error(message);
    }
  },

  // Get reports by user ID
  async getByUser(userId) {
    try {
      const response = await apiClient.get(`/reports/user/${userId}`);

      // El backend devuelve: { message, count, reports }
      // Necesitamos extraer el array de reports
      const reports = response.data.reports || [];

      // Obtener categorías una vez
      const categoriesResponse = await this.getCategories();
      const categoriesMap = {};
      categoriesResponse.forEach((cat) => {
        categoriesMap[cat.id] = cat.nombre;
      });

      // Procesar cada reporte
      const processedReports = await Promise.all(
        reports.map(async (report) => {
          try {
            // Obtener votos para cada reporte
            const votesResponse = await apiClient
              .get(`/votos/${report.id}`)
              .catch(() => ({
                data: { up: 0, down: 0, total: 0 },
              }));

            return {
              id: report.id,
              titulo: report.titulo,
              descripcion: report.descripcion,
              categoria: categoriesMap[report.categoria_id] || "Otros",
              ubicacion: report.ubicacion,
              latitud: report.latitud,
              longitud: report.longitud,
              fecha: report.fecha_creacion || report.fecha_reporte, // Usar fecha_creacion del backend
              estado: report.estado,
              votos: {
                up: votesResponse.data.up || 0,
                down: votesResponse.data.down || 0,
                total: votesResponse.data.total || 0,
              },
              usuario: {
                id: report.User?.id || report.usuario_id,
                nombre: report.User?.nombre || "Usuario",
              },
              imagen: report.imagen_url,
            };
          } catch {
            // Si hay error con un reporte específico, devolver sin votos
            return {
              id: report.id,
              titulo: report.titulo,
              descripcion: report.descripcion,
              categoria: categoriesMap[report.categoria_id] || "Otros",
              ubicacion: report.ubicacion,
              latitud: report.latitud,
              longitud: report.longitud,
              fecha: report.fecha_creacion || report.fecha_reporte,
              estado: report.estado,
              votos: { up: 0, down: 0, total: 0 },
              usuario: {
                id: report.User?.id || report.usuario_id,
                nombre: report.User?.nombre || "Usuario",
              },
              imagen: report.imagen_url,
            };
          }
        })
      );

      return processedReports;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Error al obtener reportes del usuario";
      throw new Error(message);
    }
  },

  // Create new report
  async create(reportData) {
    try {
      const response = await apiClient.post("/reports", {
        titulo: reportData.titulo,
        descripcion: reportData.descripcion,
        categoria_id: parseInt(reportData.categoria),
        ubicacion: reportData.ubicacion,
        latitud: reportData.latitud,
        longitud: reportData.longitud,
        imagen_url: reportData.imagen,
        prioridad: reportData.prioridad || "media",
      });

      const report = response.data.report;

      return {
        id: report.id,
        titulo: report.titulo,
        descripcion: report.descripcion,
        categoria: report.categoria_id?.toString() || "6",
        ubicacion: report.ubicacion,
        latitud: report.latitud,
        longitud: report.longitud,
        estado: report.estado,
        prioridad: report.prioridad,
        votos_positivos: 0,
        votos_negativos: 0,
        votos_usuarios: {},
        fecha_creacion: report.fecha_creacion,
        fecha_actualizacion: report.fecha_actualizacion,
        asignado_a: report.asignado_a,
        notas_admin: [],
        usuario: reportData.usuario || { id: null, nombre: "Usuario" },
        imagen: report.imagen_url,
        comentarios: [],
      };
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear reporte";
      throw new Error(message);
    }
  },

  // Update report
  async update(id, reportData) {
    try {
      const updateData = {};

      if (reportData.titulo) updateData.titulo = reportData.titulo;
      if (reportData.descripcion)
        updateData.descripcion = reportData.descripcion;
      if (reportData.categoria)
        updateData.categoria_id = parseInt(reportData.categoria);
      if (reportData.ubicacion) updateData.ubicacion = reportData.ubicacion;
      if (reportData.latitud) updateData.latitud = reportData.latitud;
      if (reportData.longitud) updateData.longitud = reportData.longitud;
      if (reportData.imagen) updateData.imagen_url = reportData.imagen;
      if (reportData.prioridad) updateData.prioridad = reportData.prioridad;
      if (reportData.estado) updateData.estado = reportData.estado;
      if (reportData.asignado_a) updateData.asignado_a = reportData.asignado_a;

      const response = await apiClient.patch(`/reports/${id}`, updateData);
      const report = response.data.report;

      return {
        id: report.id,
        titulo: report.titulo,
        descripcion: report.descripcion,
        categoria: report.categoria_id?.toString() || "6",
        ubicacion: report.ubicacion,
        latitud: report.latitud,
        longitud: report.longitud,
        estado: report.estado,
        prioridad: report.prioridad,
        votos_positivos: 0,
        votos_negativos: 0,
        votos_usuarios: {},
        fecha_creacion: report.fecha_creacion,
        fecha_actualizacion: report.fecha_actualizacion,
        asignado_a: report.asignado_a,
        notas_admin: [],
        usuario: {
          id: report.User?.id || report.usuario_id,
          nombre: report.User?.nombre || "Usuario",
        },
        imagen: report.imagen_url,
        comentarios: [],
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar reporte";
      throw new Error(message);
    }
  },

  // Delete report
  async delete(id) {
    try {
      await apiClient.delete(`/reports/${id}`);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al eliminar reporte";
      throw new Error(message);
    }
  },

  // Update report status
  async updateStatus(reportId, newStatus) {
    try {
      const response = await apiClient.patch(`/reports/${reportId}`, {
        estado: newStatus,
      });
      const report = response.data.report;

      return {
        id: report.id,
        titulo: report.titulo,
        descripcion: report.descripcion,
        categoria: report.categoria_id?.toString() || "6",
        ubicacion: report.ubicacion,
        latitud: report.latitud,
        longitud: report.longitud,
        estado: report.estado,
        prioridad: report.prioridad,
        votos_positivos: 0,
        votos_negativos: 0,
        votos_usuarios: {},
        fecha_creacion: report.fecha_creacion,
        fecha_actualizacion: report.fecha_actualizacion,
        asignado_a: report.asignado_a,
        notas_admin: [],
        usuario: {
          id: report.User?.id || report.usuario_id,
          nombre: report.User?.nombre || "Usuario",
        },
        imagen: report.imagen_url,
        comentarios: [],
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar estado";
      throw new Error(message);
    }
  },

  // Get reports by location (usando el endpoint del backend)
  async getByLocation(lat, lng, radius = 0.01) {
    try {
      const response = await apiClient.get(
        `/reports/location/${lat}/${lng}/${radius}`
      );

      return response.data.map((report) => ({
        id: report.id,
        titulo: report.titulo,
        descripcion: report.descripcion,
        categoria: report.categoria_id?.toString() || "6",
        ubicacion: report.ubicacion,
        latitud: report.latitud,
        longitud: report.longitud,
        estado: report.estado,
        prioridad: report.prioridad,
        votos_positivos: 0,
        votos_negativos: 0,
        votos_usuarios: {},
        fecha_creacion: report.fecha_creacion,
        fecha_actualizacion: report.fecha_actualizacion,
        asignado_a: report.asignado_a,
        notas_admin: [],
        usuario: {
          id: report.User?.id || report.usuario_id,
          nombre: report.User?.nombre || "Usuario",
        },
        imagen: report.imagen_url,
        comentarios: [],
      }));
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Error al obtener reportes por ubicación";
      throw new Error(message);
    }
  },

  // Funciones de comentarios y votos - Ahora conectadas al backend!

  // Add comment to report
  async addComment(reportId, commentData) {
    try {
      await apiClient.post("/comentarios", {
        reporte_id: parseInt(reportId),
        texto: commentData.texto,
      });

      // Después de crear el comentario, obtenemos los comentarios actualizados
      const commentsResponse = await apiClient.get(`/comentarios/${reportId}`);
      return {
        success: true,
        comentarios: commentsResponse.data.map((comment) => ({
          id: comment.id,
          texto: comment.texto,
          fecha: comment.fecha_comentario,
          usuario: {
            id: comment.User?.id || comment.usuario_id,
            nombre: comment.User?.nombre || "Usuario",
          },
        })),
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al añadir comentario";
      throw new Error(message);
    }
  },

  // Get comments for a report
  async getComments(reportId) {
    try {
      const response = await apiClient.get(`/comentarios/${reportId}`);
      return response.data.map((comment) => ({
        id: comment.id,
        texto: comment.texto,
        fecha: comment.fecha_comentario,
        usuario: {
          id: comment.User?.id || comment.usuario_id,
          nombre: comment.User?.nombre || "Usuario",
        },
      }));
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al obtener comentarios";
      throw new Error(message);
    }
  },

  // Update comment
  async updateComment(commentId, texto) {
    try {
      const response = await apiClient.patch(`/comentarios/${commentId}`, {
        texto,
      });
      return {
        success: true,
        comentario: response.data.comentario,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar comentario";
      throw new Error(message);
    }
  },

  // Delete comment
  async deleteComment(commentId) {
    try {
      await apiClient.delete(`/comentarios/${commentId}`);
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al eliminar comentario";
      throw new Error(message);
    }
  },

  // Vote on report
  async vote(reportId, voteType) {
    try {
      const endpoint = voteType === "up" ? "/votos/up" : "/votos/down";
      const response = await apiClient.post(endpoint, {
        reporte_id: parseInt(reportId),
      });

      // Después de votar, obtenemos los votos actualizados
      const votesResponse = await apiClient.get(`/votos/${reportId}`);
      return {
        success: true,
        message: response.data.message,
        votos: {
          positivos: votesResponse.data.up,
          negativos: votesResponse.data.down,
          total: votesResponse.data.total,
        },
      };
    } catch (error) {
      const message = error.response?.data?.message || "Error al votar";
      throw new Error(message);
    }
  },

  // Get votes for a report
  async getVotes(reportId) {
    try {
      const response = await apiClient.get(`/votos/${reportId}`);
      return {
        positivos: response.data.up,
        negativos: response.data.down,
        total: response.data.total,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Error al obtener votos";
      throw new Error(message);
    }
  },
};
