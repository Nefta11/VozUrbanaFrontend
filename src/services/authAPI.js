// Mock authentication API service

// Simulated users database
const users = [
  {
    id: 1,
    nombre: "María González",
    email: "maria@email.com",
    password: "password123",
    rol: "ciudadano",
    reportes_creados: 5,
    fecha_registro: "2024-01-01"
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    email: "carlos@email.com",
    password: "password123",
    rol: "ciudadano",
    reportes_creados: 3,
    fecha_registro: "2024-01-15"
  },
  {
    id: 3,
    nombre: "Admin",
    email: "admin@vozurbana.com",
    password: "admin123",
    rol: "admin",
    reportes_creados: 0,
    fecha_registro: "2023-12-01"
  }
]

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const authAPI = {
  // Login user
  async login(email, password) {
    await delay(800) // Simulate network delay
    
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    
    if (!user) {
      throw new Error('Credenciales inválidas')
    }
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = user
    
    return userWithoutPassword
  },
  
  // Register new user
  async register(userData) {
    await delay(1000) // Simulate network delay
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('El correo electrónico ya está registrado')
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      nombre: userData.nombre,
      email: userData.email,
      password: userData.password,
      rol: 'ciudadano', // Default role
      reportes_creados: 0,
      fecha_registro: new Date().toISOString().split('T')[0]
    }
    
    // Add to users array (in a real app, this would be a database insert)
    users.push(newUser)
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = newUser
    
    return userWithoutPassword
  },
  
  // Get user profile
  async getUserProfile(userId) {
    await delay(500) // Simulate network delay
    
    const user = users.find(u => u.id === userId)
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = user
    
    return userWithoutPassword
  },
  
  // Update user profile
  async updateProfile(userId, userData) {
    await delay(800) // Simulate network delay
    
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado')
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      // Don't update these fields from user input
      id: users[userIndex].id,
      rol: users[userIndex].rol,
      fecha_registro: users[userIndex].fecha_registro
    }
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = users[userIndex]
    
    return userWithoutPassword
  },

  // Check if user is admin
  isAdmin(user) {
    return user?.rol === 'admin'
  }
}