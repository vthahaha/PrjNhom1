import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((authData) => {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData))
    setUser(authData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((newFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...newFields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, [])

  const isAdmin = user?.vaiTro === 'ADMIN'
  const isTenant = user?.vaiTro === 'TENANT'
  const needsPasswordChange = user?.doiMkLanDau === true

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin, isTenant, needsPasswordChange }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
