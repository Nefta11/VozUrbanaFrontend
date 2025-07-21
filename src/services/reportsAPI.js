// Mock reports API service

// Sample reports data
let sampleReports = [
  {
    id: 1,
    titulo: "Fuga de agua en Av. Hidalgo",
    descripcion:
      "Gran fuga que está desperdiciando agua y afectando el tránsito",
    categoria: "saneamiento",
    ubicacion: "Av. Hidalgo, Centro, Xicotepec de Juárez",
    latitud: 20.2745,
    longitud: -97.9557,
    estado: "nuevo",
    prioridad: "alta",
    votos_positivos: 15,
    votos_negativos: 2,
    votos_usuarios: {}, // Track user votes: { userId: 'up' | 'down' }
    fecha_creacion: "2024-01-15",
    fecha_actualizacion: "2024-01-15",
    asignado_a: null,
    notas_admin: [],
    usuario: {
      id: 1,
      nombre: "María González",
    },
    imagen:
      "https://images.pexels.com/photos/2590716/pexels-photo-2590716.jpeg?auto=compress&cs=tinysrgb&w=800",
    comentarios: [
      {
        id: 1,
        texto: "Ya tiene más de una semana así y nadie ha venido a arreglarlo.",
        usuario: {
          id: 2,
          nombre: "Carlos Rodríguez",
        },
        fecha: "2024-01-16",
      },
    ],
  },
  {
    id: 2,
    titulo: "Basura acumulada en parque central",
    descripcion:
      "Hay montones de basura acumulada cerca de los juegos infantiles",
    categoria: "saneamiento",
    ubicacion: "Parque Central, Juan Galindo, Necaxa",
    latitud: 20.2083,
    longitud: -98.0333,
    estado: "resuelto",
    prioridad: "alta",
    votos_positivos: 25,
    votos_negativos: 0,
    votos_usuarios: {},
    fecha_creacion: "2024-01-05",
    fecha_actualizacion: "2024-01-05",
    asignado_a: null,
    notas_admin: [],
    usuario: {
      id: 1,
      nombre: "María González",
    },
    imagen:
      "https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=800",
    comentarios: [
      {
        id: 2,
        texto: "¡Ya limpiaron todo el área! Muchas gracias por el reporte.",
        usuario: {
          id: 1,
          nombre: "María González",
        },
        fecha: "2024-01-08",
      },
    ],
  },
  {
    id: 3,
    titulo: "Bache peligroso en calle Morelos",
    descripcion: "Bache muy profundo que puede dañar vehículos",
    categoria: "infraestructura",
    ubicacion: "Calle Morelos #123, Huauchinango",
    latitud: 20.1833,
    longitud: -98.05,
    estado: "en_proceso",
    prioridad: "media",
    votos_positivos: 8,
    votos_negativos: 1,
    votos_usuarios: {},
    fecha_creacion: "2024-01-10",
    fecha_actualizacion: "2024-01-10",
    asignado_a: null,
    notas_admin: [],
    usuario: {
      id: 2,
      nombre: "Carlos Rodríguez",
    },
    imagen:
      "https://images.pexels.com/photos/5396793/pexels-photo-5396793.jpeg?auto=compress&cs=tinysrgb&w=800",
    comentarios: [],
  },
  {
    id: 4,
    titulo: "Plaga de mosquitos en zona residencial",
    descripcion:
      "Hay una infestación de mosquitos que está causando problemas de salud",
    categoria: "salud_publica",
    ubicacion: "Colonia Las Flores, Xicotepec de Juárez",
    latitud: 20.2778,
    longitud: -97.9556,
    estado: "nuevo",
    prioridad: "alta",
    votos_positivos: 12,
    votos_negativos: 0,
    votos_usuarios: {},
    fecha_creacion: "2024-01-12",
    fecha_actualizacion: "2024-01-12",
    asignado_a: null,
    notas_admin: [],
    usuario: {
      id: 2,
      nombre: "Carlos Rodríguez",
    },
    imagen:
      "https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=800",
    comentarios: [],
  },
];

// Categories data
const categories = [
  { id: "saneamiento", nombre: "Saneamiento", icono: "Droplet" },
  { id: "infraestructura", nombre: "Infraestructura", icono: "Building2" },
  { id: "salud_publica", nombre: "Salud Pública", icono: "Stethoscope" },
  { id: "seguridad", nombre: "Seguridad", icono: "Shield" },
  { id: "medio_ambiente", nombre: "Medio Ambiente", icono: "Leaf" },
  { id: "otros", nombre: "Otros", icono: "FileQuestion" },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const reportsAPI = {
  // Get all reports
  async getAll() {
    await delay(800); // Simulate network delay
    return [...sampleReports];
  },

  // Get report by ID
  async getById(id) {
    await delay(500); // Simulate network delay

    const report = sampleReports.find((r) => r.id === Number(id));

    if (!report) {
      throw new Error("Reporte no encontrado");
    }

    return { ...report };
  },

  // Create new report
  async create(reportData) {
    await delay(1000); // Simulate network delay

    const newReport = {
      id: sampleReports.length + 1,
      ...reportData,
      votos_positivos: 0,
      votos_negativos: 0,
      votos_usuarios: {},
      fecha_creacion: new Date().toISOString().split("T")[0],
      fecha_actualizacion: new Date().toISOString().split("T")[0],
      asignado_a: null,
      notas_admin: [],
      comentarios: [],
    };

    sampleReports.push(newReport);

    return { ...newReport };
  },

  // Update report
  async update(id, reportData) {
    await delay(800); // Simulate network delay

    const reportIndex = sampleReports.findIndex((r) => r.id === Number(id));

    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }

    // Update report data
    sampleReports[reportIndex] = {
      ...sampleReports[reportIndex],
      ...reportData,
      fecha_actualizacion: new Date().toISOString().split("T")[0],
      // Don't update these fields from input
      id: sampleReports[reportIndex].id,
      fecha_creacion: sampleReports[reportIndex].fecha_creacion,
      usuario: sampleReports[reportIndex].usuario,
    };

    return { ...sampleReports[reportIndex] };
  },

  // Assign report to staff member
  async assignReport(reportId, staffData) {
    await delay(500); // Simulate network delay

    const reportIndex = sampleReports.findIndex(
      (r) => r.id === Number(reportId)
    );

    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }

    sampleReports[reportIndex] = {
      ...sampleReports[reportIndex],
      asignado_a: staffData,
      estado: "en_proceso",
      fecha_actualizacion: new Date().toISOString().split("T")[0],
    };

    return { ...sampleReports[reportIndex] };
  },

  // Add admin note to report
  async addAdminNote(reportId, note) {
    await delay(500); // Simulate network delay

    const reportIndex = sampleReports.findIndex(
      (r) => r.id === Number(reportId)
    );

    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }

    const newNote = {
      id: sampleReports[reportIndex].notas_admin.length + 1,
      texto: note.texto,
      usuario: note.usuario,
      fecha: new Date().toISOString().split("T")[0],
    };

    sampleReports[reportIndex].notas_admin.push(newNote);
    sampleReports[reportIndex].fecha_actualizacion = new Date()
      .toISOString()
      .split("T")[0];

    return { ...sampleReports[reportIndex] };
  },

  // Update report status
  async updateStatus(reportId, newStatus) {
    await delay(500); // Simulate network delay

    const reportIndex = sampleReports.findIndex(
      (r) => r.id === Number(reportId)
    );

    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }

    sampleReports[reportIndex] = {
      ...sampleReports[reportIndex],
      estado: newStatus,
      fecha_actualizacion: new Date().toISOString().split("T")[0],
    };

    return { ...sampleReports[reportIndex] };
  },

  // Vote on report
  async vote(id, voteType, userId) {
    await delay(300);

    const reportIndex = sampleReports.findIndex((r) => r.id === Number(id));

    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }

    const report = sampleReports[reportIndex];
    const previousVote = report.votos_usuarios[userId];

    // Remove previous vote if exists
    if (previousVote) {
      if (previousVote === "up") report.votos_positivos--;
      if (previousVote === "down") report.votos_negativos--;
    }

    // Add new vote if different from previous
    if (!previousVote || previousVote !== voteType) {
      if (voteType === "up") report.votos_positivos++;
      if (voteType === "down") report.votos_negativos++;
      report.votos_usuarios[userId] = voteType;
    } else {
      // If same vote, remove it (toggle)
      delete report.votos_usuarios[userId];
    }

    return { ...report };
  },

  // Add comment to report
  async addComment(reportId, commentData) {
    await delay(500); // Simulate network delay

    const reportIndex = sampleReports.findIndex(
      (r) => r.id === Number(reportId)
    );

    if (reportIndex === -1) {
      throw new Error("Reporte no encontrado");
    }

    const newComment = {
      id: sampleReports[reportIndex].comentarios.length + 1,
      ...commentData,
      fecha: new Date().toISOString().split("T")[0],
    };

    sampleReports[reportIndex].comentarios.push(newComment);

    return { ...sampleReports[reportIndex] };
  },

  // Get reports by user
  async getByUser(userId) {
    await delay(700); // Simulate network delay

    const userReports = sampleReports.filter(
      (r) => r.usuario && r.usuario.id === Number(userId)
    );

    return [...userReports];
  },

  // Get reports by category
  async getByCategory(categoryId) {
    await delay(700); // Simulate network delay

    const categoryReports = sampleReports.filter(
      (r) => r.categoria === categoryId
    );

    return [...categoryReports];
  },

  // Get reports by status
  async getByStatus(status) {
    await delay(700); // Simulate network delay

    const statusReports = sampleReports.filter((r) => r.estado === status);

    return [...statusReports];
  },

  // Get all categories
  async getCategories() {
    await delay(300); // Simulate network delay
    return [...categories];
  },
};
