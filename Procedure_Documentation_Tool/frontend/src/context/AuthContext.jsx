import { createContext, useContext, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token    = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const role     = localStorage.getItem('role')
    return token ? { token, username, role } : null
  })

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password })
    const data = response.data
    localStorage.setItem('token',    data.accessToken)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role',     data.role)
    setUser({
      token:    data.accessToken,
      username: data.username,
      role:     data.role,
    })
    return data
  }

  const register = async (username, email, password, firstName, lastName) => {
    const response = await authAPI.register({
      username, email, password, firstName, lastName
    })
    const data = response.data
    localStorage.setItem('token',    data.accessToken)
    localStorage.setItem('username', data.username)
    localStorage.setItem('role',     data.role)
    setUser({
      token:    data.accessToken,
      username: data.username,
      role:     data.role,
    })
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
