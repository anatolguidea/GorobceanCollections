export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  return !!token
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const getUser = (): any => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  notifyAuthStateChange()
}

export const redirectToLogin = (redirectPath: string = '/'): void => {
  if (typeof window === 'undefined') return
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`
  window.location.href = loginUrl
}

export const notifyAuthStateChange = (): void => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('authStateChanged'))
}
