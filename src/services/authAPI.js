import apiClient from "../config/api";

export const authAPI = {
  // Login user
  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = response.data;

      // Guardar token en localStorage
      localStorage.setItem("token", token);

      // Retornar datos del usuario con la estructura esperada por el frontend
      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        puntos: user.puntos || 0,
        fecha_registro:
          user.createdAt || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(message);
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
      });

      const { user, token } = response.data;

      // Guardar token en localStorage
      localStorage.setItem("token", token);

      // Retornar datos del usuario con la estructura esperada por el frontend
      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        puntos: user.puntos || 0,
        fecha_registro:
          user.createdAt || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      const message = error.response?.data?.message || "Error al registrarse";
      throw new Error(message);
    }
  },

  // Get user profile (si tienes este endpoint en el backend)
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      const user = response.data;

      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        puntos: user.puntos || 0,
        fecha_registro:
          user.createdAt || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al obtener perfil";
      throw new Error(message);
    }
  },

  // Update user profile (si tienes este endpoint en el backend)
  async updateProfile(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      const user = response.data;

      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        puntos: user.puntos || 0,
        fecha_registro:
          user.createdAt || new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al actualizar perfil";
      throw new Error(message);
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
