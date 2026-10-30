import { Navigate, Outlet, useLocation } from 'react-router-dom'

function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = token.split('.')[1]
    if (!payload) return true
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (!decoded.exp) return false // if no exp, don't force logout
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch (e) {
    return true
  }
}

export default function ProtectedRoute() {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token || isTokenExpired(token)) {
    try {
      localStorage.removeItem('token')
    } catch (e) {
      // ignore
    }
    return (
      <Navigate
        to="/phone"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
