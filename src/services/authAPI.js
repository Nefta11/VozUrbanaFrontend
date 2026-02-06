import apiClient from "../config/api";

export const authAPI = {
  // Login user - Usando backend API
  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = response.data;

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(message);
    }
  },

  // Register new user - Usando backend API
  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
      });

      const { user, token } = response.data; 

      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Error al registrarse";
      throw new Error(message);
    }
  },

  // Get user profile - Usando backend API
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/auth/perfil/${userId}`);
      return response.data.user; 
    } catch (error) {
      const message = error.response?.data?.message || "Error al obtener perfil";
      throw new Error(message);
    }
  },

  // Update user profile - Usando backend API
  async updateProfile(userId, userData) {
    try {
      const response = await apiClient.patch(`/auth/perfil/${userId}`, userData);

      // Actualizar usuario en localStorage si es el usuario actual
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === parseInt(userId)) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response.data.user; 
    } catch (error) {
      const message = error.response?.data?.message || "Error al actualizar perfil";
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
