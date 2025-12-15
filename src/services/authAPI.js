// Helper function to get users from localStorage
const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

// Helper function to save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Inicializar usuarios de ejemplo si no existen
const initializeDefaultUsers = () => {
  const users = getUsers();

  // Si no hay usuarios, crear usuarios de ejemplo
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: 1,
        nombre: 'Admin',
        email: 'admin@vozurbana.com',
        password: 'admin123',
        rol: 'admin',
        puntos: 100,
        fecha_registro: new Date().toISOString().split("T")[0],
      },
      {
        id: 2,
        nombre: 'Usuario Demo',
        email: 'usuario@vozurbana.com',
        password: 'usuario123',
        rol: 'usuario',
        puntos: 50,
        fecha_registro: new Date().toISOString().split("T")[0],
      }
    ];

    saveUsers(defaultUsers);
    console.log('Usuarios de ejemplo creados:', defaultUsers.map(u => ({ email: u.email, password: u.password, rol: u.rol })));
  }
};

// Inicializar usuarios al cargar el módulo
initializeDefaultUsers();

// Helper function to generate a simple JWT-like token
const generateToken = (userId, rol) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: userId,
    rol: rol,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  }));
  const signature = btoa(`signature-${userId}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
};

export const authAPI = {
  // Login user - Usando LocalStorage
  async login(email, password) {
    try {
      const users = getUsers();

      // Buscar usuario por email
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Validar contraseña
      if (user.password !== password) {
        throw new Error("Contraseña incorrecta");
      }

      // Generar token
      const token = generateToken(user.id, user.rol);

      // Guardar token en localStorage
      localStorage.setItem("token", token);

      // Retornar datos del usuario con la estructura esperada por el frontend
      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        puntos: user.puntos || 0,
        fecha_registro: user.fecha_registro || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  },

  // Register new user - Usando LocalStorage
  async register(userData) {
    try {
      const users = getUsers();

      // Verificar si el email ya existe
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error("El email ya está registrado");
      }

      // Crear nuevo usuario
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        rol: 'usuario', // Por defecto es usuario normal
        puntos: 0,
        fecha_registro: new Date().toISOString().split("T")[0],
      };

      // Agregar usuario a la lista
      users.push(newUser);
      saveUsers(users);

      // Retornar datos del usuario (sin el password)
      return {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        puntos: newUser.puntos,
        fecha_registro: newUser.fecha_registro,
      };
    } catch (error) {
      throw new Error(error.message || "Error al registrarse");
    }
  },

  // Get user profile - Usando LocalStorage
  async getUserProfile(userId) {
    try {
      const users = getUsers();
      const user = users.find(u => u.id === parseInt(userId));

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        puntos: user.puntos || 0,
        fecha_registro: user.fecha_registro || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      throw new Error(error.message || "Error al obtener perfil");
    }
  },

  // Update user profile - Usando LocalStorage
  async updateProfile(userId, userData) {
    try {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === parseInt(userId));

      if (userIndex === -1) {
        throw new Error("Usuario no encontrado");
      }

      // Actualizar datos del usuario
      users[userIndex] = {
        ...users[userIndex],
        ...userData,
        id: users[userIndex].id, // Mantener el ID original
        fecha_registro: users[userIndex].fecha_registro, // Mantener fecha de registro
      };

      saveUsers(users);

      // También actualizar en localStorage si es el usuario actual
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === parseInt(userId)) {
          localStorage.setItem('user', JSON.stringify({
            id: users[userIndex].id,
            nombre: users[userIndex].nombre,
            email: users[userIndex].email,
            rol: users[userIndex].rol,
            puntos: users[userIndex].puntos,
            fecha_registro: users[userIndex].fecha_registro,
          }));
        }
      }

      return {
        id: users[userIndex].id,
        nombre: users[userIndex].nombre,
        email: users[userIndex].email,
        rol: users[userIndex].rol,
        puntos: users[userIndex].puntos || 0,
        fecha_registro: users[userIndex].fecha_registro || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      throw new Error(error.message || "Error al actualizar perfil");
    }
  },

  // Check if user is admin
  isAdmin(user) {
    return user?.rol === "admin";
  },

  // Logout (limpiar token)
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
