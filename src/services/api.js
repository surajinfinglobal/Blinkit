const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'


export async function registerUser(userData) {
    console.log(userData);
  const response = await fetch(`${API_URL}/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
   const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data
}

export async function getUserProfile() {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Please log in to view your profile.')
  }

  const response = await fetch(`${API_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Profile fetch nahi ho paya')
  }
  if (!data.success || !data.user) {
    throw new Error('Profile response is invalid')
  }

  return data.user
}

export const profile = getUserProfile
