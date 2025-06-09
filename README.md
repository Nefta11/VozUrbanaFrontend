# 🏙️ Voz Urbana Frontend

Una plataforma ciudadana moderna para reportar y gestionar incidencias urbanas, construida con React y Vite.

![Voz Urbana](src/assets/logoVozUrbana.png)

## 📋 Descripción

Voz Urbana es una aplicación web que permite a los ciudadanos reportar problemas urbanos como baches, alumbrado público dañado, basura acumulada, y otros incidentes que afectan la calidad de vida en la ciudad. La plataforma facilita la comunicación entre ciudadanos y autoridades locales para una gestión más eficiente de los recursos municipales.

## ✨ Características Principales

- 🗺️ **Mapas Interactivos**: Integración con Leaflet para visualizar reportes geolocalizados
- 📱 **Diseño Responsivo**: Interfaz optimizada para dispositivos móviles y desktop
- 🔐 **Sistema de Autenticación**: Registro y login seguro de usuarios
- 👥 **Roles de Usuario**: Ciudadano común y administrador con diferentes permisos
- 📊 **Panel de Administración**: Gestión avanzada de reportes para administradores
- 🏷️ **Categorización**: Clasificación de reportes por tipo de incidencia
- 📍 **Geolocalización**: Ubicación automática y manual de reportes
- 🔔 **Notificaciones**: Sistema de alertas y confirmaciones en tiempo real
- 🎨 **UI/UX Moderna**: Interfaz intuitiva con animaciones y transiciones suaves

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite 5.4.2** - Herramienta de build ultrarrápida
- **React Router DOM 6.22.3** - Enrutamiento del lado del cliente
- **Leaflet 1.9.4** - Biblioteca de mapas interactivos
- **React Leaflet 4.2.1** - Componentes React para Leaflet
- **Lucide React 0.344.0** - Iconos SVG modernos
- **Date-fns 3.3.1** - Utilidades para manejo de fechas

### Herramientas de Desarrollo
- **ESLint** - Linter para JavaScript/React
- **Vite Plugin React** - Plugin oficial de React para Vite

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Git

### Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/voz-urbana-frontend.git
cd voz-urbana-frontend
```

### Instalar Dependencias
```bash
npm install
```

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MAP_DEFAULT_CENTER_LAT=-34.6037
VITE_MAP_DEFAULT_CENTER_LNG=-58.3816
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Construir para Producción
```bash
npm run build
```

### Vista Previa de Producción
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, logos)
├── components/          # Componentes React reutilizables
│   ├── AlertModal/      # Modal de alertas y confirmaciones
│   ├── CategoryBadge/   # Badges para categorías
│   ├── CategoryFilter/  # Filtro de categorías
│   ├── Footer/          # Pie de página
│   ├── Header/          # Encabezado de navegación
│   ├── MapPicker/       # Selector de ubicación en mapa
│   ├── MapView/         # Visualizador de mapas
│   ├── Notification/    # Sistema de notificaciones
│   ├── ProtectedRoute/  # Rutas protegidas
│   └── ReportCard/      # Tarjeta de reporte
├── context/             # Contextos React (estado global)
│   ├── AuthContext.jsx  # Contexto de autenticación
│   ├── NotificationContext.jsx
│   └── ReportsContext.jsx
├── hooks/               # Hooks personalizados
│   ├── useAuth.js       # Hook de autenticación
│   ├── useGeolocation.js
│   ├── useLocalStorage.js
│   ├── useNotification.js
│   └── useReports.js
├── pages/               # Páginas principales
│   ├── AdminDashboard/  # Panel de administración
│   ├── Auth/            # Login y registro
│   ├── CreateReport/    # Creación de reportes
│   ├── Home/            # Página de inicio
│   ├── NotFound/        # Página 404
│   ├── Profile/         # Perfil de usuario
│   ├── ReportDetail/    # Detalle de reporte
│   └── Reports/         # Lista de reportes
└── services/            # Servicios API
    ├── authAPI.js       # API de autenticación
    └── reportsAPI.js    # API de reportes
```

## 🎯 Funcionalidades por Rol

### 👤 Usuario Ciudadano
- Crear reportes de incidencias urbanas
- Ver mapa de reportes existentes
- Seguimiento del estado de sus reportes
- Gestión de perfil personal

### 👨‍💼 Administrador
- Todas las funcionalidades de ciudadano
- Panel de administración avanzado
- Gestión de todos los reportes
- Estadísticas y métricas
- Moderación de contenido

## 🌐 API Integration

La aplicación se conecta con un backend RESTful que proporciona:
- Autenticación JWT
- CRUD de reportes
- Gestión de usuarios
- Geolocalización
- Subida de imágenes

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter ESLint

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- Usar ESLint para mantener la consistencia del código
- Componentes en PascalCase
- Archivos de utilidades en camelCase
- CSS Modules para estilos de componentes
- Hooks personalizados con prefijo `use`

## 🐛 Reportar Problemas

Si encuentras algún bug o tienes una sugerencia, por favor:
1. Revisa si ya existe un issue similar
2. Crea un nuevo issue con una descripción detallada
3. Incluye pasos para reproducir el problema
4. Adjunta capturas de pantalla si es necesario

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Frontend**: Desarrollado con ❤️ usando React y Vite
- **UI/UX**: Diseño moderno y accesible
- **Backend**: API RESTful (repositorio separado)

## 🌟 Roadmap

- [ ] Notificaciones push
- [ ] Modo offline
- [ ] App móvil nativa
- [ ] Integración con redes sociales
- [ ] Sistema de votación de reportes
- [ ] Chat en tiempo real

---

**Voz Urbana** - Conectando ciudadanos con su ciudad 🏙️
